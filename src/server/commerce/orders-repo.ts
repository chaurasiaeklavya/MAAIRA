/**
 * Orders: creation, payment confirmation, expiry and staff transitions.
 *
 * Integrity rules enforced here (and by database constraints):
 *  - totals are computed from database prices inside the transaction;
 *  - product rows are locked (FOR UPDATE) while stock is checked and reserved;
 *  - an idempotency key makes double-submitted checkouts return one order;
 *  - an order becomes "paid" only after the provider's payment is verified
 *    and its order id, amount and currency match — never from a redirect;
 *  - every status change passes the state machine and is recorded.
 */
import { createHash, randomBytes, randomInt } from 'node:crypto';
import { and, desc, eq, inArray, lt, sql } from 'drizzle-orm';
import type { Database, Transaction as Tx } from '../../db/connect';
import * as s from '../../db/schema';
import type { AddressInput } from '../../lib/commerce/checkout-schema';
import { canTransition, type Actor, type OrderStatus } from '../../lib/commerce/order-state';
import { purchaseBlocker } from '../../lib/commerce/purchasable';
import type { CommerceSettings } from './settings';
import { clearCart } from './cart-repo';

export const PAYMENT_WINDOW_MINUTES = 30;

export class OrderError extends Error {
  constructor(
    public code: 'empty' | 'unavailable' | 'stock' | 'not_ready' | 'mismatch' | 'not_found' | 'transition',
    message: string,
  ) {
    super(message);
  }
}

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function newOrderNumber(now = new Date()) {
  const d = now.toISOString().slice(2, 10).replace(/-/g, '');
  let tail = '';
  for (let i = 0; i < 5; i++) tail += ALPHABET[randomInt(ALPHABET.length)];
  return `MA-${d}-${tail}`;
}

async function recordEvent(tx: Tx, orderId: string, from: OrderStatus | null, to: OrderStatus, actor: Actor, actorId: string | null, note?: string) {
  await tx.insert(s.orderEvents).values({ orderId, fromStatus: from, toStatus: to, actorType: actor, actorId, note });
}

export interface CreateOrderInput {
  cartId: string;
  userId: string | null;
  email: string;
  address: AddressInput;
  idempotencyKey: string;
  settings: CommerceSettings;
}

export interface CreatedOrder {
  id: string;
  number: string;
  totalPaise: number;
  /** Raw access token for the customer's order page; only returned once, at creation. */
  accessToken: string | null;
  existing: boolean;
}

export async function createOrder(db: Database, input: CreateOrderInput): Promise<CreatedOrder> {
  const { settings } = input;
  if (settings.shippingFlatPaise === null || settings.taxMode !== 'inclusive') {
    throw new OrderError('not_ready', 'Checkout is not open yet.');
  }

  return db.transaction(async (tx) => {
    const [dupe] = await tx
      .select({ id: s.orders.id, number: s.orders.number, totalPaise: s.orders.totalPaise })
      .from(s.orders)
      .where(eq(s.orders.idempotencyKey, input.idempotencyKey));
    if (dupe) return { ...dupe, accessToken: null, existing: true };

    const items = await tx
      .select({ productId: s.cartItems.productId, quantity: s.cartItems.quantity })
      .from(s.cartItems)
      .where(eq(s.cartItems.cartId, input.cartId));
    if (!items.length) throw new OrderError('empty', 'Your cart is empty.');

    // Lock the products for the rest of the transaction (consistent order avoids deadlocks).
    const ids = items.map((i) => i.productId).sort();
    const products = await tx.select().from(s.products).where(inArray(s.products.id, ids)).orderBy(s.products.id).for('update');
    const byId = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const lines = items.map((item) => {
      const p = byId.get(item.productId);
      if (!p) throw new OrderError('unavailable', 'A piece in your cart is no longer available.');
      const blocker = purchaseBlocker(p, item.quantity);
      if (blocker) {
        throw new OrderError(
          blocker === 'out-of-stock' ? 'stock' : 'unavailable',
          blocker === 'out-of-stock' ? `${p.name} doesn’t have enough stock for that quantity.` : `${p.name} can’t be bought online right now.`,
        );
      }
      const line = p.pricePaise! * item.quantity;
      subtotal += line;
      return { p, quantity: item.quantity, line };
    });

    const imageRows = await tx
      .select({ productId: s.productImages.productId, url: s.mediaAssets.deliveryUrl, position: s.productImages.position })
      .from(s.productImages)
      .innerJoin(s.mediaAssets, eq(s.mediaAssets.id, s.productImages.assetId))
      .where(inArray(s.productImages.productId, ids))
      .orderBy(s.productImages.position);

    const shipping = settings.shippingFlatPaise!;
    const accessToken = randomBytes(24).toString('base64url');
    const number = newOrderNumber();
    const [order] = await tx
      .insert(s.orders)
      .values({
        number,
        userId: input.userId,
        email: input.email,
        phone: input.address.phone,
        fullName: input.address.fullName,
        shippingAddress: { ...input.address, country: 'IN' },
        status: 'pending_payment',
        subtotalPaise: subtotal,
        shippingPaise: shipping,
        taxPaise: 0,
        totalPaise: subtotal + shipping,
        pricesIncludeTax: true,
        idempotencyKey: input.idempotencyKey,
        accessTokenHash: sha256(accessToken),
        sourceCartId: input.cartId,
        expiresAt: sql`now() + make_interval(mins => ${PAYMENT_WINDOW_MINUTES})`,
        placedAt: new Date(),
      })
      .returning({ id: s.orders.id, number: s.orders.number, totalPaise: s.orders.totalPaise });

    await tx.insert(s.orderItems).values(
      lines.map(({ p, quantity, line }) => ({
        orderId: order.id,
        productId: p.id,
        reference: p.reference,
        sku: p.sku,
        name: p.name,
        imageUrl: imageRows.find((r) => r.productId === p.id)?.url ?? null,
        unitPricePaise: p.pricePaise!,
        quantity,
        lineTotalPaise: line,
      })),
    );

    let reserved = false;
    for (const { p, quantity } of lines) {
      if (!p.trackInventory) continue;
      const [row] = await tx
        .update(s.products)
        .set({ stock: sql`${s.products.stock} - ${quantity}` })
        .where(and(eq(s.products.id, p.id), sql`${s.products.stock} >= ${quantity}`))
        .returning({ stock: s.products.stock });
      if (!row) throw new OrderError('stock', `${p.name} doesn’t have enough stock for that quantity.`);
      await tx.insert(s.inventoryMovements).values({ productId: p.id, delta: -quantity, stockAfter: row.stock!, reason: 'reserve', orderId: order.id });
      reserved = true;
    }
    if (reserved) await tx.update(s.orders).set({ stockReserved: true }).where(eq(s.orders.id, order.id));

    await recordEvent(tx, order.id, null, 'pending_payment', 'customer', input.userId, 'Order placed');
    return { ...order, accessToken, existing: false };
  });
}

export async function attachProviderOrder(db: Database, orderId: string, provider: string, providerOrderId: string, amountPaise: number) {
  await db.transaction(async (tx) => {
    await tx.update(s.orders).set({ paymentProvider: provider, providerOrderId }).where(eq(s.orders.id, orderId));
    await tx.insert(s.payments).values({ orderId, provider, providerOrderId, status: 'created', amountPaise, currency: 'INR' });
  });
}

async function releaseStock(tx: Tx, orderId: string, actorId: string | null, note: string) {
  const [order] = await tx.select({ stockReserved: s.orders.stockReserved }).from(s.orders).where(eq(s.orders.id, orderId));
  if (!order?.stockReserved) return;
  const items = await tx
    .select({ productId: s.orderItems.productId, quantity: s.orderItems.quantity })
    .from(s.orderItems)
    .innerJoin(s.products, eq(s.products.id, s.orderItems.productId))
    .where(and(eq(s.orderItems.orderId, orderId), eq(s.products.trackInventory, true)));
  for (const item of items) {
    if (!item.productId) continue;
    const [row] = await tx
      .update(s.products)
      .set({ stock: sql`coalesce(${s.products.stock}, 0) + ${item.quantity}` })
      .where(eq(s.products.id, item.productId))
      .returning({ stock: s.products.stock });
    await tx.insert(s.inventoryMovements).values({ productId: item.productId, delta: item.quantity, stockAfter: row.stock!, reason: 'release', orderId, actorId, note });
  }
  await tx.update(s.orders).set({ stockReserved: false }).where(eq(s.orders.id, orderId));
}

export interface VerifiedPayment {
  providerOrderId: string;
  paymentId: string;
  amountPaise: number;
  currency: string;
  status: 'authorized' | 'captured' | 'failed' | string;
  errorCode?: string | null;
  errorDescription?: string | null;
}

/**
 * Applies a provider-verified payment to its order. Idempotent: repeating
 * the same payment (browser + webhook, or webhook retries) is a no-op.
 */
export async function applyVerifiedPayment(db: Database, payment: VerifiedPayment): Promise<{ orderId: string; number: string; status: OrderStatus }> {
  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(s.orders).where(eq(s.orders.providerOrderId, payment.providerOrderId)).for('update');
    if (!order) throw new OrderError('not_found', 'Order not found for this payment.');
    const current = order.status as OrderStatus;

    await tx
      .insert(s.payments)
      .values({
        orderId: order.id,
        provider: 'razorpay',
        providerOrderId: payment.providerOrderId,
        providerPaymentId: payment.paymentId,
        status: payment.status === 'captured' ? 'captured' : payment.status === 'authorized' ? 'authorized' : 'failed',
        amountPaise: payment.amountPaise,
        currency: payment.currency,
        errorCode: payment.errorCode ?? null,
        errorDescription: payment.errorDescription ?? null,
      })
      .onConflictDoUpdate({
        target: s.payments.providerPaymentId,
        set: { status: sql`excluded.status`, errorCode: sql`excluded.error_code`, errorDescription: sql`excluded.error_description` },
      });

    if (payment.status === 'captured') {
      if (payment.amountPaise !== order.totalPaise || payment.currency !== order.currency) {
        await recordEvent(tx, order.id, current, current, 'provider', payment.paymentId, 'Amount/currency mismatch — not marked paid');
        throw new OrderError('mismatch', 'Payment amount does not match the order.');
      }
      if (current === 'paid' || !canTransition(current, 'paid', 'provider')) return { orderId: order.id, number: order.number, status: current };
      await tx.update(s.orders).set({ status: 'paid', paidAt: new Date(), expiresAt: null }).where(eq(s.orders.id, order.id));
      await recordEvent(tx, order.id, current, 'paid', 'provider', payment.paymentId, 'Payment captured and verified');
      if (order.sourceCartId) await clearCart(tx, order.sourceCartId);
      return { orderId: order.id, number: order.number, status: 'paid' };
    }

    if (payment.status === 'failed' && canTransition(current, 'payment_failed', 'provider')) {
      await tx.update(s.orders).set({ status: 'payment_failed' }).where(eq(s.orders.id, order.id));
      await recordEvent(tx, order.id, current, 'payment_failed', 'provider', payment.paymentId, payment.errorDescription ?? 'Payment failed');
      return { orderId: order.id, number: order.number, status: 'payment_failed' };
    }
    // 'authorized' (awaiting capture) or a late failure after success: state unchanged.
    return { orderId: order.id, number: order.number, status: current };
  });
}

/** Cancels unpaid orders whose payment window has passed and returns their stock. */
export async function expireUnpaidOrders(db: Database) {
  const stale = await db
    .select({ id: s.orders.id })
    .from(s.orders)
    .where(and(inArray(s.orders.status, ['pending_payment', 'payment_failed']), lt(s.orders.expiresAt, sql`now()`)));
  for (const { id } of stale) {
    await db.transaction(async (tx) => {
      const [o] = await tx.select({ status: s.orders.status }).from(s.orders).where(eq(s.orders.id, id)).for('update');
      const from = o?.status as OrderStatus | undefined;
      if (!from || !canTransition(from, 'cancelled', 'system')) return;
      await releaseStock(tx, id, null, 'Payment window expired');
      await tx.update(s.orders).set({ status: 'cancelled', expiresAt: null }).where(eq(s.orders.id, id));
      await recordEvent(tx, id, from, 'cancelled', 'system', null, 'Payment window expired');
    });
  }
  return stale.length;
}

/** Staff-initiated status change (validated by the state machine, recorded with actor). */
export async function transitionOrder(db: Database, orderId: string, to: OrderStatus, actor: { type: Actor; id: string }, note?: string) {
  return db.transaction(async (tx) => {
    const [o] = await tx.select({ status: s.orders.status }).from(s.orders).where(eq(s.orders.id, orderId)).for('update');
    if (!o) throw new OrderError('not_found', 'Order not found.');
    const from = o.status as OrderStatus;
    if (!canTransition(from, to, actor.type)) throw new OrderError('transition', `An order can’t move from ${from} to ${to}.`);
    if (to === 'cancelled') await releaseStock(tx, orderId, actor.id, note ?? 'Order cancelled');
    await tx.update(s.orders).set({ status: to, expiresAt: null }).where(eq(s.orders.id, orderId));
    await recordEvent(tx, orderId, from, to, actor.type, actor.id, note);
    return { from, to };
  });
}

/**
 * Order lookup for customers. Access requires EITHER the signed-in owner OR
 * the private token issued at checkout — order numbers alone reveal nothing.
 */
export async function findOrderForCustomer(db: Database, number: string, access: { userId?: string | null; token?: string | null }) {
  if (!/^MA-\d{6}-[2-9A-HJKMNP-Z]{5}$/.test(number)) return null;
  const [order] = await db.select().from(s.orders).where(eq(s.orders.number, number));
  if (!order) return null;
  const ownerOk = Boolean(access.userId && order.userId && access.userId === order.userId);
  const tokenOk = Boolean(access.token && sha256(access.token) === order.accessTokenHash);
  if (!ownerOk && !tokenOk) return null;
  const [items, events] = await Promise.all([
    db.select().from(s.orderItems).where(eq(s.orderItems.orderId, order.id)),
    db.select().from(s.orderEvents).where(eq(s.orderEvents.orderId, order.id)).orderBy(s.orderEvents.createdAt),
  ]);
  return { order, items, events };
}

export async function listOrdersForUser(db: Database, userId: string) {
  return db
    .select({
      number: s.orders.number,
      status: s.orders.status,
      totalPaise: s.orders.totalPaise,
      placedAt: s.orders.placedAt,
      itemCount: sql<number>`(select coalesce(sum(quantity), 0)::int from order_items oi where oi.order_id = ${s.orders.id})`,
    })
    .from(s.orders)
    .where(eq(s.orders.userId, userId))
    .orderBy(desc(s.orders.createdAt));
}
