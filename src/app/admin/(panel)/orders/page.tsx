import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { formatPaise } from '@/lib/commerce/money';
import { STATUS_LABELS, type OrderStatus } from '@/lib/commerce/order-state';
import { requireStaffPage } from '@/server/staff';
import styles from '../../admin.module.css';

export const metadata = { title: 'Orders' };

export default async function OrdersAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireStaffPage('orders:write');
  const { status } = await searchParams;
  const valid = status && status in STATUS_LABELS ? status : null;
  const rows = await getDb()
    .select()
    .from(s.orders)
    .where(valid ? eq(s.orders.status, valid) : undefined)
    .orderBy(desc(s.orders.createdAt))
    .limit(200);
  return (
    <>
      <h1 className={styles.h1}>Orders</h1>
      <nav className={styles.filters} aria-label="Filter orders">
        <Link href="/admin/orders" aria-current={!valid ? 'page' : undefined}>
          all
        </Link>
        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((k) => (
          <Link key={k} href={`/admin/orders?status=${k}`} aria-current={valid === k ? 'page' : undefined}>
            {STATUS_LABELS[k].toLowerCase()}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className={styles.muted}>No orders{valid ? ' with this status' : ' yet'}.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Placed</th>
              <th scope="col">Customer</th>
              <th scope="col">Total</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link href={`/admin/orders/${o.id}`} className="text-link">
                    {o.number}
                  </Link>
                </td>
                <td>{o.placedAt?.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td>{o.fullName}</td>
                <td>{formatPaise(o.totalPaise)}</td>
                <td>
                  <span className={styles.badge} data-tone={o.status}>
                    {STATUS_LABELS[o.status as OrderStatus]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
