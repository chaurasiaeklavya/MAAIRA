'use server';

import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getDb } from '@/db';
import type { Transaction } from '@/db/connect';
import * as s from '@/db/schema';
import type { OrderStatus } from '@/lib/commerce/order-state';
import { OrderError, transitionOrder } from '@/server/commerce/orders-repo';
import { loadSettings, saveSettings } from '@/server/commerce/settings';
import { setEnquiryStatus, ENQUIRY_STATUSES } from '@/server/enquiries-repo';
import { audit, requireStaff } from '@/server/staff';

/**
 * Admin server actions. Each one re-verifies the session and role on the
 * server, validates input strictly, and records an audit entry.
 */
export type ActionState = { ok: boolean; message?: string; errors?: Record<string, string> };

const STAGES = ['champagne-studio', 'ivory-plaster', 'espresso-leather'] as const;
const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const optional = (v: string, max: number) => (v ? v.slice(0, max) : null);

function rupeesToPaise(v: string): number | null | 'invalid' {
  if (!v) return null;
  const clean = v.replace(/[₹,\s]/g, '');
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(clean)) return 'invalid';
  const paise = Math.round(Number(clean) * 100);
  return paise > 0 ? paise : 'invalid';
}

function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const refresh = (productId?: string) => {
  revalidatePath('/', 'layout');
  if (productId) revalidatePath(`/admin/products/${productId}`);
};

// ─────────────────────────────────────────────────────────────── Products

export async function createProduct(form: FormData) {
  const user = await requireStaff('catalogue:write');
  const name = str(form, 'name').slice(0, 120);
  if (name.length < 2) redirect('/admin/products?error=name');
  const db = getDb();
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(s.products);
  const base = slugify(name) || 'piece';
  let slug = base;
  for (let i = 2; (await db.select({ id: s.products.id }).from(s.products).where(eq(s.products.slug, slug))).length; i++) slug = `${base}-${i}`;
  const [row] = await db
    .insert(s.products)
    .values({ reference: `MFB-P-${String(n + 1).padStart(3, '0')}-${Date.now().toString(36).slice(-4).toUpperCase()}`, slug, name, status: 'draft' })
    .returning({ id: s.products.id });
  await audit(user, 'product.create', 'product', row.id, { name, slug });
  redirect(`/admin/products/${row.id}`);
}

export async function updateProduct(productId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireStaff('catalogue:write');
  const id = z.uuid().parse(productId);
  const db = getDb();
  const [current] = await db.select().from(s.products).where(eq(s.products.id, id));
  if (!current) return { ok: false, message: 'Product not found.' };

  const errors: Record<string, string> = {};
  const name = str(form, 'name');
  if (name.length < 2 || name.length > 120) errors.name = 'Name must be 2–120 characters.';
  const slug = str(form, 'slug');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 80) errors.slug = 'Use lowercase letters, numbers and single hyphens.';
  const price = rupeesToPaise(str(form, 'price'));
  if (price === 'invalid') errors.price = 'Enter a price in rupees, e.g. 24500.';
  const priceStatus = z.enum(['pending', 'approved']).safeParse(form.get('priceStatus'));
  const status = z.enum(['draft', 'published', 'archived']).safeParse(form.get('status'));
  const availability = z.enum(['unconfirmed', 'in_stock', 'made_to_order', 'out_of_stock']).safeParse(form.get('availability'));
  const nameStatus = z.enum(['working', 'approved']).safeParse(form.get('nameStatus'));
  const copyStatus = z.enum(['draft', 'approved']).safeParse(form.get('copyStatus'));
  const stage = z.enum(STAGES).safeParse(form.get('stage'));
  if (!priceStatus.success || !status.success || !availability.success || !nameStatus.success || !copyStatus.success || !stage.success) {
    errors.form = 'Some options were invalid. Please reload and try again.';
  }
  if (priceStatus.data === 'approved') {
    if (price === null) errors.price = 'An approved price needs an amount.';
    if (form.get('priceConfirm') !== 'on' && current.priceStatus !== 'approved') errors.priceConfirm = 'Confirm the business has approved this price.';
  }
  const featuredRaw = str(form, 'featuredRank');
  const featuredRank = featuredRaw ? Number(featuredRaw) : null;
  if (featuredRank !== null && (!Number.isInteger(featuredRank) || featuredRank < 1 || featuredRank > 999)) errors.featuredRank = '1–999, or leave empty.';
  const arrivedRaw = str(form, 'arrivedAt');
  const arrivedAt = arrivedRaw ? new Date(`${arrivedRaw}T00:00:00Z`) : null;
  if (arrivedAt && Number.isNaN(arrivedAt.getTime())) errors.arrivedAt = 'Invalid date.';
  const features = str(form, 'features').split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 12).map((l) => l.slice(0, 120));
  const tags = str(form, 'tags').split(',').map((t) => t.trim().toLowerCase()).filter((t) => /^[a-z0-9 -]{1,40}$/.test(t)).slice(0, 20);
  const sku = optional(str(form, 'sku'), 60);

  if (status.data === 'published') {
    const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(s.productImages).where(eq(s.productImages.productId, id));
    if (!n) errors.status = 'Add at least one photograph before publishing.';
  }
  const dupe = await db.select({ id: s.products.id }).from(s.products).where(and(eq(s.products.slug, slug), sql`${s.products.id} <> ${id}`));
  if (dupe.length) errors.slug = 'Another product already uses this address.';
  if (sku) {
    const skuDupe = await db.select({ id: s.products.id }).from(s.products).where(and(eq(s.products.sku, sku), sql`${s.products.id} <> ${id}`));
    if (skuDupe.length) errors.sku = 'Another product already uses this SKU.';
  }

  // Taxonomy: term_<id> = basis ('' = not assigned).
  const terms = await db.select({ id: s.taxonomyTerms.id }).from(s.taxonomyTerms);
  const assigned: { termId: string; basis: 'fact' | 'inference' | 'client' }[] = [];
  for (const t of terms) {
    const basis = str(form, `term:${t.id}`);
    if (basis === 'fact' || basis === 'inference' || basis === 'client') assigned.push({ termId: t.id, basis });
  }

  if (Object.keys(errors).length) return { ok: false, errors, message: 'Please correct the highlighted fields.' };

  const trackInventory = form.get('trackInventory') === 'on';
  const next = {
    name,
    slug,
    sku,
    nameStatus: nameStatus.data!,
    summary: optional(str(form, 'summary'), 300),
    description: optional(str(form, 'description'), 4000),
    copyStatus: copyStatus.data!,
    pricePaise: price as number | null,
    priceStatus: priceStatus.data!,
    status: status.data!,
    availability: availability.data!,
    trackInventory,
    stock: trackInventory ? (current.stock ?? 0) : current.stock,
    colour: optional(str(form, 'colour'), 60),
    material: optional(str(form, 'material'), 120),
    dimensions: optional(str(form, 'dimensions'), 120),
    features,
    tags,
    stage: stage.data!,
    featuredRank,
    arrivedAt,
    internalNotes: optional(str(form, 'internalNotes'), 2000),
    publishedAt: status.data === 'published' ? (current.publishedAt ?? new Date()) : current.publishedAt,
  };

  const changed = Object.entries(next)
    .filter(([k, v]) => JSON.stringify(v) !== JSON.stringify((current as Record<string, unknown>)[k]))
    .map(([k]) => k);

  await db.transaction(async (tx) => {
    await tx.update(s.products).set(next).where(eq(s.products.id, id));
    await tx.delete(s.productTerms).where(eq(s.productTerms.productId, id));
    if (assigned.length) await tx.insert(s.productTerms).values(assigned.map((a) => ({ productId: id, ...a, evidence: `Assigned by ${user.email}` })));
  });

  const detail: Record<string, unknown> = { changed, terms: assigned.map((a) => `${a.termId}:${a.basis}`) };
  if (changed.includes('pricePaise') || changed.includes('priceStatus')) detail.price = { from: current.pricePaise, to: next.pricePaise, status: next.priceStatus };
  if (changed.includes('status')) detail.status = { from: current.status, to: next.status };
  await audit(user, 'product.update', 'product', id, detail);
  refresh(id);
  return { ok: true, message: 'Saved.' };
}

export async function adjustStock(productId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireStaff('catalogue:write');
  const id = z.uuid().parse(productId);
  const delta = Number(form.get('delta'));
  const note = str(form, 'note').slice(0, 200);
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 10000) return { ok: false, message: 'Enter a whole number, e.g. 5 or -2.' };
  if (!note) return { ok: false, message: 'Add a short reason (e.g. “new stock received”).' };
  const db = getDb();
  const result = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(s.products)
      .set({ stock: sql`coalesce(${s.products.stock}, 0) + ${delta}`, trackInventory: true })
      .where(and(eq(s.products.id, id), sql`coalesce(${s.products.stock}, 0) + ${delta} >= 0`))
      .returning({ stock: s.products.stock });
    if (!row) return null;
    await tx.insert(s.inventoryMovements).values({ productId: id, delta, stockAfter: row.stock!, reason: 'adjustment', actorId: user.id, note });
    return row.stock;
  });
  if (result === null) return { ok: false, message: 'Stock can’t go below zero.' };
  await audit(user, 'inventory.adjust', 'product', id, { delta, stockAfter: result, note });
  refresh(id);
  return { ok: true, message: `Stock is now ${result}.` };
}

// ─────────────────────────────────────────────────────────────── Product images

async function renumber(tx: Transaction, productId: string) {
  const rows = await tx.select({ assetId: s.productImages.assetId }).from(s.productImages).where(eq(s.productImages.productId, productId)).orderBy(asc(s.productImages.position));
  for (const [i, r] of rows.entries()) await tx.update(s.productImages).set({ position: 10_000 + i }).where(and(eq(s.productImages.productId, productId), eq(s.productImages.assetId, r.assetId)));
  for (const [i, r] of rows.entries()) await tx.update(s.productImages).set({ position: i }).where(and(eq(s.productImages.productId, productId), eq(s.productImages.assetId, r.assetId)));
}

const assetIds = z.array(z.string().regex(/^[A-Z0-9-]{3,40}$/)).min(1).max(30);

export async function addImages(productId: string, form: FormData) {
  const user = await requireStaff('catalogue:write');
  const id = z.uuid().parse(productId);
  const ids = assetIds.safeParse(form.getAll('assetId').map(String));
  if (!ids.success) return;
  const db = getDb();
  await db.transaction(async (tx) => {
    const [product] = await tx.select({ name: s.products.name }).from(s.products).where(eq(s.products.id, id));
    if (!product) return;
    // Only assets not already used by any product (one photo = one bag).
    const free = await tx
      .select({ id: s.mediaAssets.id })
      .from(s.mediaAssets)
      .leftJoin(s.productImages, eq(s.productImages.assetId, s.mediaAssets.id))
      .where(and(inArray(s.mediaAssets.id, ids.data), sql`${s.productImages.assetId} is null`));
    const [{ max }] = await tx.select({ max: sql<number>`coalesce(max(position), -1)::int` }).from(s.productImages).where(eq(s.productImages.productId, id));
    const hasPrimary = (await tx.select().from(s.productImages).where(and(eq(s.productImages.productId, id), eq(s.productImages.role, 'primary')))).length > 0;
    for (const [i, a] of free.entries()) {
      await tx.insert(s.productImages).values({
        productId: id,
        assetId: a.id,
        position: max + 1 + i,
        role: !hasPrimary && i === 0 ? 'primary' : 'gallery',
        alt: `${product.name}, view ${max + 2 + i}`,
      });
    }
    if (free.length) await tx.update(s.mediaAssets).set({ reviewStatus: 'assigned' }).where(inArray(s.mediaAssets.id, free.map((f) => f.id)));
  });
  await audit(user, 'product.images.add', 'product', id, { assets: ids.data });
  refresh(id);
}

export async function updateImage(productId: string, assetId: string, form: FormData) {
  const user = await requireStaff('catalogue:write');
  const id = z.uuid().parse(productId);
  const aid = z.string().regex(/^[A-Z0-9-]{3,40}$/).parse(assetId);
  const op = str(form, 'op');
  const db = getDb();
  await db.transaction(async (tx) => {
    const rows = await tx.select().from(s.productImages).where(eq(s.productImages.productId, id)).orderBy(asc(s.productImages.position));
    const idx = rows.findIndex((r) => r.assetId === aid);
    if (idx < 0) return;
    if (op === 'up' || op === 'down') {
      const j = op === 'up' ? idx - 1 : idx + 1;
      if (j < 0 || j >= rows.length) return;
      const a = rows[idx];
      const b = rows[j];
      await tx.update(s.productImages).set({ position: 20_000 }).where(and(eq(s.productImages.productId, id), eq(s.productImages.assetId, a.assetId)));
      await tx.update(s.productImages).set({ position: a.position }).where(and(eq(s.productImages.productId, id), eq(s.productImages.assetId, b.assetId)));
      await tx.update(s.productImages).set({ position: b.position }).where(and(eq(s.productImages.productId, id), eq(s.productImages.assetId, a.assetId)));
    } else if (op === 'primary') {
      await tx.update(s.productImages).set({ role: 'gallery' }).where(and(eq(s.productImages.productId, id), eq(s.productImages.role, 'primary')));
      await tx.update(s.productImages).set({ role: 'primary' }).where(and(eq(s.productImages.productId, id), eq(s.productImages.assetId, aid)));
    } else if (op === 'alt') {
      const alt = str(form, 'alt').slice(0, 160);
      const role = z.enum(['primary', 'gallery', 'detail', 'lifestyle']).catch('gallery').parse(form.get('role'));
      if (alt.length < 3) return;
      if (role === 'primary') await tx.update(s.productImages).set({ role: 'gallery' }).where(and(eq(s.productImages.productId, id), eq(s.productImages.role, 'primary')));
      await tx.update(s.productImages).set({ alt, role }).where(and(eq(s.productImages.productId, id), eq(s.productImages.assetId, aid)));
    } else if (op === 'remove') {
      await tx.delete(s.productImages).where(and(eq(s.productImages.productId, id), eq(s.productImages.assetId, aid)));
      await tx.update(s.mediaAssets).set({ reviewStatus: 'pending' }).where(eq(s.mediaAssets.id, aid));
      await renumber(tx, id);
      const left = await tx.select().from(s.productImages).where(eq(s.productImages.productId, id)).orderBy(asc(s.productImages.position));
      if (left.length && !left.some((r) => r.role === 'primary')) {
        await tx.update(s.productImages).set({ role: 'primary' }).where(and(eq(s.productImages.productId, id), eq(s.productImages.assetId, left[0].assetId)));
      }
      if (!left.length) await tx.update(s.products).set({ status: 'draft' }).where(and(eq(s.products.id, id), eq(s.products.status, 'published')));
    }
  });
  await audit(user, `product.images.${op}`, 'product', id, { asset: aid });
  refresh(id);
}

// ─────────────────────────────────────────────────────────────── Media library

export async function reviewAsset(assetId: string, form: FormData) {
  const user = await requireStaff('catalogue:write');
  const aid = z.string().regex(/^[A-Z0-9-]{3,40}$/).parse(assetId);
  const status = z.enum(['pending', 'held', 'rejected']).safeParse(form.get('reviewStatus'));
  if (!status.success) return;
  const notes = optional(str(form, 'reviewNotes'), 500);
  const db = getDb();
  const [used] = await db.select().from(s.productImages).where(eq(s.productImages.assetId, aid));
  if (used) return; // assigned assets are managed from their product
  await db.update(s.mediaAssets).set({ reviewStatus: status.data, reviewNotes: notes }).where(eq(s.mediaAssets.id, aid));
  await audit(user, 'media.review', 'media', aid, { status: status.data, notes });
  revalidatePath('/admin/media');
}

/** Groups selected photographs into a new draft product (the grouping workflow). */
export async function createProductFromAssets(form: FormData) {
  const user = await requireStaff('catalogue:write');
  const ids = assetIds.safeParse(form.getAll('assetId').map(String));
  const name = str(form, 'name').slice(0, 120);
  if (!ids.success || name.length < 2) redirect('/admin/media?error=selection');
  const fd = new FormData();
  fd.set('name', name);
  const db = getDb();
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(s.products);
  const base = slugify(name) || 'piece';
  let slug = base;
  for (let i = 2; (await db.select({ id: s.products.id }).from(s.products).where(eq(s.products.slug, slug))).length; i++) slug = `${base}-${i}`;
  const [row] = await db
    .insert(s.products)
    .values({ reference: `MFB-P-${String(n + 1).padStart(3, '0')}-${Date.now().toString(36).slice(-4).toUpperCase()}`, slug, name, status: 'draft' })
    .returning({ id: s.products.id });
  await audit(user, 'product.create', 'product', row.id, { name, slug, fromAssets: ids.data });
  for (const a of ids.data) fd.append('assetId', a);
  await addImages(row.id, fd);
  redirect(`/admin/products/${row.id}`);
}

// ─────────────────────────────────────────────────────────────── Orders

export async function changeOrderStatus(orderId: string, _: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireStaff('orders:write');
  const id = z.uuid().parse(orderId);
  const to = z.enum(['processing', 'shipped', 'delivered', 'cancelled', 'refunded']).safeParse(form.get('to'));
  if (!to.success) return { ok: false, message: 'Choose a valid status.' };
  const note = str(form, 'note').slice(0, 500) || undefined;
  if ((to.data === 'cancelled' || to.data === 'refunded') && form.get('confirm') !== 'on') {
    return { ok: false, message: 'Please confirm — this action can’t be undone.' };
  }
  try {
    const r = await transitionOrder(getDb(), id, to.data as OrderStatus, { type: 'staff', id: user.id }, note);
    await audit(user, 'order.status', 'order', id, { from: r.from, to: r.to, note });
  } catch (err) {
    if (err instanceof OrderError) {
      await audit(user, 'order.status', 'order', id, { to: to.data, error: err.code }, 'denied');
      return { ok: false, message: err.message };
    }
    throw err;
  }
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true, message: 'Status updated.' };
}

// ─────────────────────────────────────────────────────────────── Enquiries

export async function updateEnquiry(id: string, form: FormData) {
  const user = await requireStaff('enquiries:write');
  const eid = z.string().regex(/^(EQ|CB)-[A-Z0-9]+-[A-F0-9]{6}$/).parse(id);
  const status = z.enum(ENQUIRY_STATUSES).safeParse(form.get('status'));
  if (!status.success) return;
  if (await setEnquiryStatus(getDb(), eid, status.data)) await audit(user, 'enquiry.status', 'enquiry', eid, { status: status.data });
  revalidatePath('/admin/enquiries');
}

// ─────────────────────────────────────────────────────────────── Settings

export async function updateSettings(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireStaff('settings:write');
  const db = getDb();
  const before = await loadSettings(db);
  const fee = rupeesToPaise(str(form, 'shippingFee'));
  const shippingRaw = str(form, 'shippingFee');
  let shippingFlatPaise: number | null;
  if (shippingRaw === '0') shippingFlatPaise = 0;
  else if (!shippingRaw) shippingFlatPaise = null;
  else if (fee === 'invalid' || fee === null) return { ok: false, errors: { shippingFee: 'Enter an amount in rupees (0 for free delivery).' } };
  else shippingFlatPaise = fee;
  const next = {
    checkoutEnabled: form.get('checkoutEnabled') === 'on',
    shippingFlatPaise,
    taxMode: form.get('taxInclusive') === 'on' ? ('inclusive' as const) : null,
    policiesApproved: form.get('policiesApproved') === 'on',
  };
  await saveSettings(db, next, user.id);
  await audit(user, 'settings.update', 'settings', 'commerce', { before, after: next });
  revalidatePath('/', 'layout');
  return { ok: true, message: 'Settings saved.' };
}
