import Link from 'next/link';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { ProductEditForm } from '@/components/admin/ProductEditForm';
import { StockForm } from '@/components/admin/StockForm';
import { CloudImage } from '@/components/CloudImage';
import { requireStaffPage } from '@/server/staff';
import { addImages, updateImage } from '../../../actions';
import styles from '../../../admin.module.css';

export const metadata = { title: 'Edit product' };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffPage('catalogue:write');
  const parsed = z.uuid().safeParse((await params).id);
  if (!parsed.success) notFound();
  const id = parsed.data;
  const db = getDb();
  const [product] = await db.select().from(s.products).where(eq(s.products.id, id));
  if (!product) notFound();
  const [images, terms, assigned, free, moves] = await Promise.all([
    db
      .select({ assetId: s.productImages.assetId, position: s.productImages.position, role: s.productImages.role, alt: s.productImages.alt, a: s.mediaAssets })
      .from(s.productImages)
      .innerJoin(s.mediaAssets, eq(s.mediaAssets.id, s.productImages.assetId))
      .where(eq(s.productImages.productId, id))
      .orderBy(asc(s.productImages.position)),
    db.select().from(s.taxonomyTerms).orderBy(asc(s.taxonomyTerms.position)),
    db.select().from(s.productTerms).where(eq(s.productTerms.productId, id)),
    db
      .select()
      .from(s.mediaAssets)
      .where(sql`not exists (select 1 from product_images pi where pi.asset_id = media_assets.id) and media_assets.review_status <> 'rejected'`)
      .orderBy(asc(s.mediaAssets.id)),
    db.select().from(s.inventoryMovements).where(eq(s.inventoryMovements.productId, id)).orderBy(desc(s.inventoryMovements.createdAt)).limit(10),
  ]);

  return (
    <>
      <p className={styles.crumbs}>
        <Link href="/admin/products">Products</Link> / {product.reference}
      </p>
      <div className={styles.titleRow}>
        <h1 className={styles.h1}>{product.name}</h1>
        {product.status === 'published' && (
          <Link href={`/products/${product.slug}`} className="text-link" target="_blank">
            View in store ↗
          </Link>
        )}
      </div>
      {product.internalNotes && <p className={styles.note}>{product.internalNotes}</p>}

      <section className={styles.card} aria-labelledby="photos-title">
        <h2 id="photos-title" className={styles.h2}>
          Photographs ({images.length})
        </h2>
        <p className={styles.muted}>The first photograph marked “primary” leads on cards and the product page. Photographs are never altered — only ordered and labelled.</p>
        <ol className={styles.photoList}>
          {images.map((img, i) => (
            <li key={img.assetId} className={styles.photoItem}>
              <span className={styles.thumb}>
                <CloudImage asset={img.a} alt="" sizes="120px" width={320} maxWidth={480} variant="natural" />
              </span>
              <div className={styles.photoMeta}>
                <strong>
                  {i + 1}. {img.a.originalFilename}
                </strong>{' '}
                <span className={styles.badge} data-tone={img.role === 'primary' ? 'published' : 'draft'}>
                  {img.role}
                </span>
                <form action={updateImage.bind(null, id, img.assetId)} className={styles.inline}>
                  <input type="hidden" name="op" value="alt" />
                  <label className="visually-hidden" htmlFor={`alt-${img.assetId}`}>
                    Alt text
                  </label>
                  <input id={`alt-${img.assetId}`} name="alt" defaultValue={img.alt} maxLength={160} />
                  <select name="role" defaultValue={img.role} aria-label="Role">
                    <option value="primary">primary</option>
                    <option value="gallery">gallery</option>
                    <option value="detail">detail</option>
                    <option value="lifestyle">lifestyle</option>
                  </select>
                  <button type="submit">Save</button>
                </form>
                <div className={styles.inline}>
                  {(['up', 'down', 'remove'] as const).map((op) => (
                    <form key={op} action={updateImage.bind(null, id, img.assetId)}>
                      <input type="hidden" name="op" value={op} />
                      <button type="submit" disabled={(op === 'up' && i === 0) || (op === 'down' && i === images.length - 1)}>
                        {op === 'up' ? 'Move up' : op === 'down' ? 'Move down' : 'Remove'}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
        {free.length > 0 && (
          <details className={styles.picker}>
            <summary>Add photographs from the library ({free.length} unassigned)</summary>
            <form action={addImages.bind(null, id)}>
              <ul className={styles.pickGrid}>
                {free.map((a) => (
                  <li key={a.id}>
                    <label>
                      <input type="checkbox" name="assetId" value={a.id} />
                      <span className={styles.thumb}>
                        <CloudImage asset={a} alt="" sizes="120px" width={320} maxWidth={480} variant="natural" />
                      </span>
                      <span>{a.originalFilename}</span>
                      {a.reviewStatus === 'held' && <span className={styles.flag}>held</span>}
                    </label>
                  </li>
                ))}
              </ul>
              <button type="submit" className="btn btn--primary">
                Add selected
              </button>
            </form>
          </details>
        )}
      </section>

      <ProductEditForm
        productId={id}
        product={{
          ...product,
          price: product.pricePaise ? String(product.pricePaise / 100) : '',
          arrivedAt: product.arrivedAt ? product.arrivedAt.toISOString().slice(0, 10) : '',
        }}
        terms={terms.map((t) => ({ id: t.id, kind: t.kind, label: t.label, basis: assigned.find((a) => a.termId === t.id)?.basis ?? '' }))}
      />

      <section className={styles.card} aria-labelledby="stock-title">
        <h2 id="stock-title" className={styles.h2}>
          Inventory
        </h2>
        <p>
          {product.trackInventory ? (
            <>
              Tracking stock: <strong>{product.stock}</strong> available.
            </>
          ) : (
            'Stock is not tracked for this product. Adjusting stock turns tracking on.'
          )}
        </p>
        <StockForm productId={id} />
        {moves.length > 0 && (
          <table className={styles.table}>
            <caption className="visually-hidden">Recent stock movements</caption>
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Change</th>
                <th scope="col">After</th>
                <th scope="col">Reason</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((m) => (
                <tr key={m.id}>
                  <td>{m.createdAt.toLocaleString('en-IN')}</td>
                  <td>{m.delta > 0 ? `+${m.delta}` : m.delta}</td>
                  <td>{m.stockAfter}</td>
                  <td>
                    {m.reason}
                    {m.note ? ` — ${m.note}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
