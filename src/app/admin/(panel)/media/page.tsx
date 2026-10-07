import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { CloudImage } from '@/components/CloudImage';
import { requireStaffPage } from '@/server/staff';
import { createProductFromAssets, reviewAsset } from '../../actions';
import styles from '../../admin.module.css';

export const metadata = { title: 'Photographs' };

/**
 * Every supplied photograph, with its source and review status. Staff group
 * the views of one physical bag into a product here — your browser loads the
 * Cloudinary images directly, so this works even where the build server
 * couldn't see them.
 */
export default async function MediaAdmin({ searchParams }: { searchParams: Promise<{ status?: string; error?: string }> }) {
  await requireStaffPage('catalogue:write');
  const { status, error } = await searchParams;
  const db = getDb();
  const rows = await db
    .select({ a: s.mediaAssets, productId: s.products.id, productName: s.products.name })
    .from(s.mediaAssets)
    .leftJoin(s.productImages, eq(s.productImages.assetId, s.mediaAssets.id))
    .leftJoin(s.products, eq(s.products.id, s.productImages.productId))
    .orderBy(asc(s.mediaAssets.id));
  const shown = status ? rows.filter((r) => r.a.reviewStatus === status) : rows;
  const counts = rows.reduce<Record<string, number>>((m, r) => ({ ...m, [r.a.reviewStatus]: (m[r.a.reviewStatus] ?? 0) + 1 }), {});

  return (
    <>
      <h1 className={styles.h1}>Photographs</h1>
      <p className={styles.muted}>
        {rows.length} photographs from {new Set(rows.map((r) => r.a.intakeBatch)).size} intake batches. Select every view of one bag, name it, and create a draft product — then complete its details and publish.
      </p>
      {error && <p className={styles.err}>Select at least one photograph and enter a product name.</p>}
      <nav className={styles.filters} aria-label="Filter photographs">
        {['all', 'pending', 'assigned', 'held', 'rejected'].map((f) => (
          <Link key={f} href={f === 'all' ? '/admin/media' : `/admin/media?status=${f}`} aria-current={(status ?? 'all') === f ? 'page' : undefined}>
            {f} {f === 'all' ? `(${rows.length})` : `(${counts[f] ?? 0})`}
          </Link>
        ))}
      </nav>

      <form action={createProductFromAssets} id="group-form" className={`${styles.card} ${styles.groupBar}`}>
        <label>
          New product from selected photographs
          <input name="name" placeholder="Product name (working title)" minLength={2} maxLength={120} />
        </label>
        <button type="submit" className="btn btn--primary">
          Create product
        </button>
      </form>

      <ul className={styles.mediaGrid}>
        {shown.map(({ a, productId, productName }) => (
          <li key={a.id} className={styles.mediaItem} data-status={a.reviewStatus}>
            <label className={styles.mediaPick}>
              {!productId && a.reviewStatus !== 'rejected' && <input type="checkbox" name="assetId" value={a.id} form="group-form" aria-label={`Select ${a.originalFilename}`} />}
              <span className={styles.thumbLg}>
                <CloudImage asset={a} alt={a.originalFilename} sizes="200px" width={480} maxWidth={720} variant="natural" />
              </span>
            </label>
            <p>
              <strong>{a.originalFilename}</strong> <span className={styles.badge} data-tone={a.reviewStatus}>{a.reviewStatus}</span>
            </p>
            <p className={styles.muted}>
              {a.intakeBatch}
              {a.alternateUrls.length > 0 && ' · also in an earlier batch'}
            </p>
            {productId ? (
              <p>
                In <Link href={`/admin/products/${productId}`} className="text-link">{productName}</Link>
              </p>
            ) : (
              <form action={reviewAsset.bind(null, a.id)} className={styles.inline}>
                <select name="reviewStatus" defaultValue={a.reviewStatus} aria-label={`Review status for ${a.originalFilename}`}>
                  <option value="pending">pending</option>
                  <option value="held">held (needs client)</option>
                  <option value="rejected">rejected (not a product photo)</option>
                </select>
                <input name="reviewNotes" defaultValue={a.reviewNotes ?? ''} placeholder="Note" maxLength={500} aria-label="Review note" />
                <button type="submit">Save</button>
              </form>
            )}
            <a href={a.deliveryUrl} target="_blank" rel="noopener noreferrer" className={styles.muted}>
              Original ↗
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
