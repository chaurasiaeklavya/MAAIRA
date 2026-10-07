import Link from 'next/link';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { displayPrice } from '@/lib/commerce/money';
import { requireStaffPage } from '@/server/staff';
import { createProduct } from '../../actions';
import styles from '../../admin.module.css';

export const metadata = { title: 'Products' };

export default async function ProductsAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireStaffPage();
  const { status } = await searchParams;
  const db = getDb();
  const rows = await db
    .select({
      id: s.products.id,
      name: s.products.name,
      reference: s.products.reference,
      slug: s.products.slug,
      status: s.products.status,
      pricePaise: s.products.pricePaise,
      priceStatus: s.products.priceStatus,
      availability: s.products.availability,
      stock: s.products.stock,
      trackInventory: s.products.trackInventory,
      images: sql<number>`(select count(*)::int from product_images pi where pi.product_id = ${s.products.id})`,
      terms: sql<string>`(select string_agg(t.label || ' (' || pt.basis || ')', ', ') from product_terms pt join taxonomy_terms t on t.id = pt.term_id where pt.product_id = ${s.products.id})`,
      notes: s.products.internalNotes,
    })
    .from(s.products)
    .where(status && ['draft', 'published', 'archived'].includes(status) ? eq(s.products.status, status) : undefined)
    .orderBy(asc(s.products.featuredRank), desc(s.products.updatedAt));

  return (
    <>
      <div className={styles.titleRow}>
        <h1 className={styles.h1}>Products</h1>
        <form action={createProduct} className={styles.inline}>
          <label htmlFor="new-name" className="visually-hidden">
            New product name
          </label>
          <input id="new-name" name="name" placeholder="New product name" required minLength={2} maxLength={120} />
          <button className="btn btn--primary" type="submit">
            Create draft
          </button>
        </form>
      </div>
      <p className={styles.muted}>
        Tip: to group photographs into a product, use <Link href="/admin/media" className="text-link">Photographs</Link>, select the views of one bag, and create a product from them.
      </p>
      <nav className={styles.filters} aria-label="Filter products">
        {['all', 'published', 'draft', 'archived'].map((f) => (
          <Link key={f} href={f === 'all' ? '/admin/products' : `/admin/products?status=${f}`} aria-current={(status ?? 'all') === f ? 'page' : undefined}>
            {f}
          </Link>
        ))}
      </nav>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Status</th>
            <th scope="col">Price</th>
            <th scope="col">Availability</th>
            <th scope="col">Photos</th>
            <th scope="col">Categories</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>
                <Link href={`/admin/products/${p.id}`} className="text-link">
                  {p.name}
                </Link>
                <br />
                <span className={styles.muted}>{p.reference}</span>
                {p.notes?.startsWith('PROVISIONAL') && <span className={styles.flag}>Provisional</span>}
              </td>
              <td>
                <span className={styles.badge} data-tone={p.status}>
                  {p.status}
                </span>
              </td>
              <td>
                {displayPrice(p.pricePaise, p.priceStatus === 'approved')}
                <br />
                <span className={styles.muted}>{p.priceStatus}</span>
              </td>
              <td>
                {p.availability.replace(/_/g, ' ')}
                {p.trackInventory && <span className={styles.muted}> · stock {p.stock}</span>}
              </td>
              <td>{p.images}</td>
              <td className={styles.muted}>{p.terms ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
