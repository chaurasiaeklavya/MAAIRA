import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { getReadiness } from '@/server/checkout-service';
import { emailConfigured } from '@/server/email';
import { expireUnpaidOrders } from '@/server/commerce/orders-repo';
import { requireStaffPage } from '@/server/staff';
import styles from '../admin.module.css';

export const metadata = { title: 'Overview' };

export default async function AdminHome() {
  await requireStaffPage();
  const db = getDb();
  await expireUnpaidOrders(db);
  const [counts] = await db.execute<Record<string, number>>(sql`select
    (select count(*)::int from products where status = 'published') as published,
    (select count(*)::int from products where status = 'draft') as drafts,
    (select count(*)::int from products where status = 'published' and price_status = 'approved') as priced,
    (select count(*)::int from media_assets where review_status = 'pending') as pending_media,
    (select count(*)::int from media_assets) as media,
    (select count(*)::int from orders where status = 'paid') as to_fulfil,
    (select count(*)::int from orders where status = 'processing') as processing,
    (select count(*)::int from enquiries where status = 'new') as new_enquiries`);
  const { readiness } = await getReadiness();

  const tiles: [string, number, string][] = [
    ['Orders to fulfil', counts.to_fulfil, '/admin/orders?status=paid'],
    ['Being prepared', counts.processing, '/admin/orders?status=processing'],
    ['New enquiries', counts.new_enquiries, '/admin/enquiries?status=new'],
    ['Photographs to review', counts.pending_media, '/admin/media?status=pending'],
    ['Published products', counts.published, '/admin/products?status=published'],
    ['Draft products', counts.drafts, '/admin/products?status=draft'],
  ];

  return (
    <>
      <h1 className={styles.h1}>Overview</h1>
      <ul className={styles.tiles}>
        {tiles.map(([label, n, href]) => (
          <li key={label}>
            <Link href={href} className={styles.tile}>
              <span className={styles.tileN}>{n}</span>
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className={styles.card} aria-labelledby="ready-title">
        <h2 id="ready-title" className={styles.h2}>
          Online checkout readiness
        </h2>
        {readiness.ready ? (
          <p className={styles.good}>Checkout is open to customers.</p>
        ) : (
          <>
            <p>Checkout stays closed (customers see an honest “not open yet” page) until every item below is resolved:</p>
            <ul className={styles.blockers}>
              {readiness.blockers.map((b) => (
                <li key={b.key}>{b.label}</li>
              ))}
            </ul>
          </>
        )}
        <p className={styles.muted}>
          Published products with an approved price: {counts.priced} of {counts.published}. Transactional email: {emailConfigured() ? 'configured' : 'not configured'}.
        </p>
      </section>
    </>
  );
}
