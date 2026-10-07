/**
 * Catalogue repository: reads products, images and taxonomy from Postgres
 * and maps them to `CatalogueProduct`. No `server-only` import so tests can
 * call it with their own connection; app code uses `src/server/catalogue.ts`.
 */
import { and, asc, eq, inArray } from 'drizzle-orm';
import type { Database } from '../db/connect';
import * as s from '../db/schema';
import type { Availability, CatalogueProduct, StagePreset, Term, TermKind } from '../lib/catalogue/types';
import { displayPrice } from '../lib/commerce/money';
import { purchaseBlocker } from '../lib/commerce/purchasable';

type ProductRow = typeof s.products.$inferSelect;

export async function loadTerms(db: Database): Promise<Term[]> {
  const rows = await db.select().from(s.taxonomyTerms).orderBy(asc(s.taxonomyTerms.position));
  return rows.map((r) => ({ ...r, kind: r.kind as TermKind }));
}

export async function loadProducts(db: Database, opts: { status?: 'published' | 'any'; ids?: string[] } = {}) {
  const where = [];
  if ((opts.status ?? 'published') === 'published') where.push(eq(s.products.status, 'published'));
  if (opts.ids) {
    if (!opts.ids.length) return [];
    where.push(inArray(s.products.id, opts.ids));
  }
  const rows = await db
    .select()
    .from(s.products)
    .where(where.length ? and(...where) : undefined);
  return hydrate(db, rows);
}

export async function hydrate(db: Database, rows: ProductRow[]): Promise<CatalogueProduct[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [images, terms] = await Promise.all([
    db
      .select({
        productId: s.productImages.productId,
        assetId: s.productImages.assetId,
        position: s.productImages.position,
        role: s.productImages.role,
        alt: s.productImages.alt,
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
      .where(inArray(s.productImages.productId, ids))
      .orderBy(asc(s.productImages.position)),
    db
      .select({
        productId: s.productTerms.productId,
        basis: s.productTerms.basis,
        id: s.taxonomyTerms.id,
        kind: s.taxonomyTerms.kind,
        slug: s.taxonomyTerms.slug,
        label: s.taxonomyTerms.label,
        position: s.taxonomyTerms.position,
      })
      .from(s.productTerms)
      .innerJoin(s.taxonomyTerms, eq(s.taxonomyTerms.id, s.productTerms.termId))
      .where(inArray(s.productTerms.productId, ids))
      .orderBy(asc(s.taxonomyTerms.position)),
  ]);

  return rows.map((r) => {
    const approved = r.priceStatus === 'approved' && r.pricePaise !== null;
    return {
      id: r.id,
      reference: r.reference,
      sku: r.sku,
      slug: r.slug,
      name: r.name,
      summary: r.summary,
      description: r.description,
      price: { paise: approved ? r.pricePaise : null, approved, display: displayPrice(r.pricePaise, approved) },
      availability: r.availability as Availability,
      purchasable: purchaseBlocker(r) === null,
      colour: r.colour,
      material: r.material,
      dimensions: r.dimensions,
      features: r.features,
      tags: r.tags,
      stage: r.stage as StagePreset,
      featuredRank: r.featuredRank,
      arrivedAt: r.arrivedAt?.toISOString() ?? null,
      publishedAt: r.publishedAt?.toISOString() ?? null,
      images: images
        .filter((i) => i.productId === r.id)
        .map((i) => ({
          assetId: i.assetId,
          role: i.role as CatalogueProduct['images'][number]['role'],
          alt: i.alt,
          asset: {
            cloudName: i.cloudName,
            publicId: i.publicId,
            version: i.version,
            format: i.format,
            deliveryUrl: i.deliveryUrl,
            width: i.width,
            height: i.height,
          },
        })),
      terms: terms
        .filter((t) => t.productId === r.id)
        .map((t) => ({ id: t.id, kind: t.kind as TermKind, slug: t.slug, label: t.label, basis: t.basis as 'fact' | 'inference' | 'client' })),
    };
  });
}
