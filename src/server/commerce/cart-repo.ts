/**
 * Server-side cart. The browser only ever holds an opaque cart token in an
 * httpOnly cookie; product IDs and quantities are validated here, and prices
 * are always read from the database — a client can't set or influence them.
 */
import { createHash, randomBytes } from 'node:crypto';
import { and, eq, inArray, sql } from 'drizzle-orm';
import type { Database, Executor } from '../../db/connect';
import * as s from '../../db/schema';
import { displayPrice, formatPaise } from '../../lib/commerce/money';
import { MAX_QUANTITY, purchaseBlocker, type PurchaseBlocker } from '../../lib/commerce/purchasable';

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const newToken = () => randomBytes(32).toString('base64url');

export class CartError extends Error {
  constructor(
    public code: 'not_found' | 'not_purchasable' | 'quantity' | 'stock',
    message: string,
    public blocker?: PurchaseBlocker,
  ) {
    super(message);
  }
}

export async function findCartId(db: Database, ident: { tokenHash?: string | null; userId?: string | null }) {
  if (ident.userId) {
    const [row] = await db.select({ id: s.carts.id }).from(s.carts).where(eq(s.carts.userId, ident.userId));
    if (row) return row.id;
  }
  if (ident.tokenHash) {
    const [row] = await db
      .select({ id: s.carts.id, userId: s.carts.userId })
      .from(s.carts)
      .where(eq(s.carts.tokenHash, ident.tokenHash));
    // A signed-in user's cart is never reachable by token from another account.
    if (row && (!row.userId || row.userId === ident.userId)) return row.id;
  }
  return null;
}

export async function createCart(db: Database, tokenHash: string, userId: string | null) {
  const [row] = await db.insert(s.carts).values({ tokenHash, userId }).returning({ id: s.carts.id });
  return row.id;
}

async function loadProductForCart(db: Executor, productId: string) {
  const [p] = await db.select().from(s.products).where(eq(s.products.id, productId));
  if (!p) throw new CartError('not_found', 'This piece could not be found.');
  return p;
}

function clampQuantity(qty: number) {
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) {
    throw new CartError('quantity', `Quantity must be between 1 and ${MAX_QUANTITY}.`);
  }
  return qty;
}

export async function addItem(db: Database, cartId: string, productId: string, quantity: number) {
  clampQuantity(quantity);
  return db.transaction(async (tx) => {
    const p = await loadProductForCart(tx, productId);
    const blocker = purchaseBlocker(p);
    if (blocker) throw new CartError('not_purchasable', 'This piece can’t be added to the cart yet.', blocker);
    const [existing] = await tx
      .select({ quantity: s.cartItems.quantity })
      .from(s.cartItems)
      .where(and(eq(s.cartItems.cartId, cartId), eq(s.cartItems.productId, productId)));
    const wanted = Math.min((existing?.quantity ?? 0) + quantity, MAX_QUANTITY);
    if (p.trackInventory && (p.stock ?? 0) < wanted) {
      throw new CartError('stock', p.stock ? `Only ${p.stock} available.` : 'Currently unavailable.');
    }
    await tx
      .insert(s.cartItems)
      .values({ cartId, productId, quantity: wanted })
      .onConflictDoUpdate({ target: [s.cartItems.cartId, s.cartItems.productId], set: { quantity: wanted } });
    await tx.update(s.carts).set({ updatedAt: new Date() }).where(eq(s.carts.id, cartId));
    return wanted;
  });
}

export async function setQuantity(db: Database, cartId: string, productId: string, quantity: number) {
  if (quantity === 0) return removeItem(db, cartId, productId);
  clampQuantity(quantity);
  return db.transaction(async (tx) => {
    const p = await loadProductForCart(tx, productId);
    if (p.trackInventory && (p.stock ?? 0) < quantity) {
      throw new CartError('stock', p.stock ? `Only ${p.stock} available.` : 'Currently unavailable.');
    }
    const updated = await tx
      .update(s.cartItems)
      .set({ quantity })
      .where(and(eq(s.cartItems.cartId, cartId), eq(s.cartItems.productId, productId)))
      .returning({ q: s.cartItems.quantity });
    if (!updated.length) throw new CartError('not_found', 'That item is no longer in your cart.');
    return quantity;
  });
}

export async function removeItem(db: Database, cartId: string, productId: string) {
  await db.delete(s.cartItems).where(and(eq(s.cartItems.cartId, cartId), eq(s.cartItems.productId, productId)));
  return 0;
}

export async function clearCart(db: Executor, cartId: string) {
  await db.delete(s.cartItems).where(eq(s.cartItems.cartId, cartId));
}

/** Moves a guest cart's lines into the signed-in user's cart (max quantity wins, capped). */
export async function mergeGuestCart(db: Database, guestTokenHash: string, userId: string) {
  return db.transaction(async (tx) => {
    const [guest] = await tx.select().from(s.carts).where(eq(s.carts.tokenHash, guestTokenHash));
    if (!guest || guest.userId) return;
    const [own] = await tx.select().from(s.carts).where(eq(s.carts.userId, userId));
    if (!own) {
      await tx.update(s.carts).set({ userId }).where(eq(s.carts.id, guest.id));
      return;
    }
    await tx.execute(sql`
      insert into cart_items (cart_id, product_id, quantity, created_at)
      select ${own.id}::uuid, product_id, quantity, created_at from cart_items where cart_id = ${guest.id}::uuid
      on conflict (cart_id, product_id) do update set quantity = least(${MAX_QUANTITY}::int, greatest(cart_items.quantity, excluded.quantity))`);
    await tx.delete(s.carts).where(eq(s.carts.id, guest.id));
  });
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  reference: string;
  quantity: number;
  unitPricePaise: number | null;
  unitPrice: string;
  lineTotalPaise: number | null;
  lineTotal: string | null;
  image: { cloudName: string; publicId: string; version: string | null; format: string; deliveryUrl: string; width: number | null; height: number | null; alt: string } | null;
  /** Why this line can't be bought right now (excluded from the subtotal). */
  issue: string | null;
  maxQuantity: number;
}

export interface CartView {
  lines: CartLine[];
  itemCount: number;
  subtotalPaise: number;
  subtotal: string;
  /** Every line is purchasable and the cart isn't empty. */
  checkoutable: boolean;
}

export const EMPTY_CART: CartView = { lines: [], itemCount: 0, subtotalPaise: 0, subtotal: formatPaise(0), checkoutable: false };

export async function viewCart(db: Database, cartId: string | null): Promise<CartView> {
  if (!cartId) return EMPTY_CART;
  const items = await db
    .select({ productId: s.cartItems.productId, quantity: s.cartItems.quantity, p: s.products })
    .from(s.cartItems)
    .innerJoin(s.products, eq(s.products.id, s.cartItems.productId))
    .where(eq(s.cartItems.cartId, cartId))
    .orderBy(s.cartItems.addedAt);
  if (!items.length) return EMPTY_CART;

  const images = await db
    .select({
      productId: s.productImages.productId,
      alt: s.productImages.alt,
      position: s.productImages.position,
      cloudName: s.mediaAssets.cloudName,
      publicId: s.mediaAssets.publicId,
      version: s.mediaAssets.version,
      format: s.mediaAssets.format,
      deliveryUrl: s.mediaAssets.deliveryUrl,
      width: s.mediaAssets.width,
      height: s.mediaAssets.height,
    })
    .from(s.productImages)
    .innerJoin(s.mediaAssets, eq(s.mediaAssets.id, s.productImages.assetId))
    .where(inArray(s.productImages.productId, items.map((i) => i.productId)))
    .orderBy(s.productImages.position);

  let subtotal = 0;
  let count = 0;
  const lines: CartLine[] = items.map(({ productId, quantity, p }) => {
    const blocker = purchaseBlocker(p, quantity);
    const approved = p.priceStatus === 'approved' && p.pricePaise !== null;
    const line = !blocker && approved ? p.pricePaise! * quantity : null;
    if (line !== null) {
      subtotal += line;
      count += quantity;
    }
    const img = images.find((i) => i.productId === productId) ?? null;
    return {
      productId,
      slug: p.slug,
      name: p.name,
      reference: p.reference,
      quantity,
      unitPricePaise: approved ? p.pricePaise : null,
      unitPrice: displayPrice(p.pricePaise, approved),
      lineTotalPaise: line,
      lineTotal: line !== null ? formatPaise(line) : null,
      image: img ? { ...img } : null,
      issue: blocker
        ? blocker === 'out-of-stock' && p.trackInventory && (p.stock ?? 0) > 0
          ? `Only ${p.stock} available — please reduce the quantity.`
          : 'No longer available to buy online.'
        : null,
      maxQuantity: p.trackInventory ? Math.max(1, Math.min(MAX_QUANTITY, p.stock ?? 0)) : MAX_QUANTITY,
    };
  });
  return {
    lines,
    itemCount: count,
    subtotalPaise: subtotal,
    subtotal: formatPaise(subtotal),
    checkoutable: lines.length > 0 && lines.every((l) => !l.issue),
  };
}
