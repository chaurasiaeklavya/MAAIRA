/**
 * Integration-test database. Uses TEST_DATABASE_URL (never DATABASE_URL), so
 * tests can't touch development or production data. Migrations are applied
 * once; each test file truncates the tables it needs.
 */
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { createDatabase, type Database } from '../../src/db/connect';
import * as s from '../../src/db/schema';
import { loadEnv } from '../../scripts/db/env';

loadEnv();

export function testDatabaseUrl() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) return null;
  if (url === process.env.DATABASE_URL) throw new Error('TEST_DATABASE_URL must differ from DATABASE_URL');
  return url;
}

export async function openTestDb() {
  const url = testDatabaseUrl();
  if (!url) return null;
  const { db, client } = createDatabase(url, { max: 4 });
  await migrate(db, { migrationsFolder: './drizzle' });
  return { db, close: () => client.end() };
}

export async function resetData(db: Database) {
  await db.execute(sql`truncate table
    order_events, order_items, payments, payment_events, inventory_movements, orders,
    cart_items, carts, wishlist_items, addresses, enquiries, audit_log, rate_limit_buckets,
    product_terms, product_images, products, media_assets, taxonomy_terms, store_settings,
    session, account, verification, rate_limit, "user" cascade`);
}

let seq = 0;
/** Inserts a TEST-ONLY product (never a real MAAIRA piece). */
export async function testProduct(db: Database, over: Partial<typeof s.products.$inferInsert> = {}) {
  seq++;
  const assetId = `TEST-IMG-${seq}`;
  await db.insert(s.mediaAssets).values({
    id: assetId,
    cloudName: 'test',
    publicId: `test_${seq}`,
    version: 'v1',
    format: 'jpg',
    deliveryUrl: `https://res.cloudinary.com/test/image/upload/v1/test_${seq}.jpg`,
    originalFilename: `test_${seq}.jpg`,
    intakeBatch: 'test',
  });
  const [p] = await db
    .insert(s.products)
    .values({
      reference: `TEST-P-${seq}`,
      slug: `test-piece-${seq}`,
      name: `Test Piece ${seq}`,
      status: 'published',
      pricePaise: 1_250_000,
      priceStatus: 'approved',
      availability: 'in_stock',
      trackInventory: true,
      stock: 5,
      publishedAt: new Date(),
      ...over,
    })
    .returning();
  await db.insert(s.productImages).values({ productId: p.id, assetId, position: 0, role: 'primary', alt: 'test' });
  return p;
}
