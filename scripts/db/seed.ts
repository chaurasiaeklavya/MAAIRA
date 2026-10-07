/**
 * Imports the catalogue seed: media assets, taxonomy and products.
 *   npm run db:seed                       idempotent; never overwrites existing products
 *   npm run db:seed -- --reset-catalogue  (development only) replace products from the seed
 */
import { eq, inArray, sql } from 'drizzle-orm';
import { createDatabase } from '../../src/db/connect';
import * as s from '../../src/db/schema';
import { loadAssets } from '../../catalogue/assets';
import { HELD_ASSETS, PRODUCT_SEEDS } from '../../catalogue/products';
import { ALL_TERMS, termId } from '../../catalogue/taxonomy';
import { loadEnv } from './env';

async function main() {
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');
  const reset = process.argv.includes('--reset-catalogue');
  if (reset && process.env.NODE_ENV === 'production') throw new Error('--reset-catalogue is disabled in production.');

  const { db, client } = createDatabase(url, { max: 1 });
  try {
    const { assets, duplicates, rejected } = loadAssets();
    const assigned = new Set(PRODUCT_SEEDS.flatMap((p) => p.images.map((i) => i.assetId)));

    await db.transaction(async (tx) => {
      for (const [i, t] of ALL_TERMS.entries()) {
        await tx
          .insert(s.taxonomyTerms)
          .values({ id: termId(t), kind: t.kind, slug: t.slug, label: t.label, description: t.description, synonyms: t.synonyms, position: i })
          .onConflictDoUpdate({
            target: s.taxonomyTerms.id,
            set: { label: t.label, description: t.description, synonyms: t.synonyms, position: i },
          });
      }

      for (const a of assets) {
        const reviewStatus = assigned.has(a.id) ? 'assigned' : HELD_ASSETS[a.id] ? 'held' : 'pending';
        const reviewNotes = HELD_ASSETS[a.id] ?? (assigned.has(a.id) ? 'Provisional assignment (filename sequence).' : null);
        await tx
          .insert(s.mediaAssets)
          .values({ ...a, reviewStatus, reviewNotes })
          .onConflictDoUpdate({
            target: s.mediaAssets.id,
            // Delivery facts follow the intake; review decisions made in /admin are kept.
            set: {
              cloudName: a.cloudName,
              publicId: a.publicId,
              version: a.version,
              format: a.format,
              deliveryUrl: a.deliveryUrl,
              alternateUrls: a.alternateUrls,
              originalFilename: a.originalFilename,
              intakeBatch: a.intakeBatch,
            },
          });
      }

      if (reset) {
        await tx.delete(s.products).where(inArray(s.products.reference, PRODUCT_SEEDS.map((p) => p.reference)));
      }

      for (const p of PRODUCT_SEEDS) {
        const exists = await tx.select({ id: s.products.id }).from(s.products).where(eq(s.products.reference, p.reference));
        if (exists.length) continue;
        const { images, terms, arrivedAt, ...fields } = p;
        const [row] = await tx
          .insert(s.products)
          .values({
            ...fields,
            arrivedAt: arrivedAt ? new Date(arrivedAt) : null,
            publishedAt: p.status === 'published' ? sql`now()` : null,
          })
          .returning({ id: s.products.id });
        if (images.length) {
          await tx.insert(s.productImages).values(images.map((img, position) => ({ productId: row.id, position, ...img })));
        }
        if (terms.length) {
          await tx.insert(s.productTerms).values(terms.map((t) => ({ productId: row.id, termId: t.id, basis: t.basis, evidence: t.evidence })));
        }
      }
    });

    const counts = await db.execute(sql`select
      (select count(*) from media_assets) as assets,
      (select count(*) from media_assets where review_status = 'pending') as pending,
      (select count(*) from products) as products,
      (select count(*) from taxonomy_terms) as terms`);
    console.log('Seed complete:', counts[0]);
    if (duplicates.length) console.log(`Duplicate URLs ignored (${duplicates.length}):`, duplicates.join(', '));
    if (rejected.length) console.log(`Unrecognised URLs (${rejected.length}):`, rejected.join(', '));
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
