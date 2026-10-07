import { randomBytes } from 'node:crypto';
import { and, desc, eq, inArray } from 'drizzle-orm';
import type { Database } from '../db/connect';
import * as s from '../db/schema';
import type { CleanEnquiry } from '../lib/enquiry/schema';

export const ENQUIRY_STATUSES = ['new', 'contacted', 'closed'] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export function newEnquiryId(kind: CleanEnquiry['kind']) {
  const prefix = kind === 'callback' ? 'CB' : 'EQ';
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function createEnquiry(db: Database, value: CleanEnquiry) {
  return db.transaction(async (tx) => {
    const [dupe] = await tx
      .select({ id: s.enquiries.id, kind: s.enquiries.kind })
      .from(s.enquiries)
      .where(eq(s.enquiries.idempotencyKey, value.idempotencyKey));
    if (dupe) return { ...dupe, duplicate: true, productLabel: null as string | null };
    const product = value.pieceId
      ? (await tx.select({ id: s.products.id, name: s.products.name, reference: s.products.reference }).from(s.products).where(eq(s.products.slug, value.pieceId)))[0]
      : undefined;
    const id = newEnquiryId(value.kind);
    const productLabel = product ? `${product.name} (${product.reference})` : null;
    await tx.insert(s.enquiries).values({
      id,
      kind: value.kind,
      name: value.name,
      email: value.email,
      phone: value.phone,
      productId: product?.id ?? null,
      productLabel,
      message: value.message,
      preferredContact: value.preferredContact,
      callbackWindow: value.callbackWindow,
      consentAt: new Date(),
      idempotencyKey: value.idempotencyKey,
    });
    return { id, kind: value.kind, duplicate: false, productLabel };
  });
}

export async function listEnquiries(db: Database, filter: { status?: EnquiryStatus; kind?: 'enquiry' | 'callback' } = {}) {
  const where = [];
  if (filter.status) where.push(eq(s.enquiries.status, filter.status));
  if (filter.kind) where.push(eq(s.enquiries.kind, filter.kind));
  return db
    .select()
    .from(s.enquiries)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(s.enquiries.createdAt))
    .limit(500);
}

export async function setEnquiryStatus(db: Database, id: string, status: EnquiryStatus) {
  const rows = await db.update(s.enquiries).set({ status }).where(eq(s.enquiries.id, id)).returning({ id: s.enquiries.id });
  return rows.length > 0;
}

export async function knownProductSlugs(db: Database) {
  const rows = await db.select({ slug: s.products.slug }).from(s.products).where(inArray(s.products.status, ['published']));
  return rows.map((r) => r.slug);
}
