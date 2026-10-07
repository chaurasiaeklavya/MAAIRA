import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { OrderStatusForm } from '@/components/admin/OrderStatusForm';
import { formatPaise } from '@/lib/commerce/money';
import { nextStatuses, STATUS_LABELS, type OrderStatus } from '@/lib/commerce/order-state';
import { requireStaffPage } from '@/server/staff';
import styles from '../../../admin.module.css';

export const metadata = { title: 'Order' };

export default async function OrderAdmin({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffPage('orders:write');
  const id = z.uuid().safeParse((await params).id);
  if (!id.success) notFound();
  const db = getDb();
  const [order] = await db.select().from(s.orders).where(eq(s.orders.id, id.data));
  if (!order) notFound();
  const [items, events, payments] = await Promise.all([
    db.select().from(s.orderItems).where(eq(s.orderItems.orderId, order.id)),
    db.select().from(s.orderEvents).where(eq(s.orderEvents.orderId, order.id)).orderBy(asc(s.orderEvents.createdAt)),
    db.select().from(s.payments).where(eq(s.payments.orderId, order.id)).orderBy(asc(s.payments.createdAt)),
  ]);
  const a = order.shippingAddress as Record<string, string>;
  return (
    <>
      <p className={styles.crumbs}>
        <Link href="/admin/orders">Orders</Link> / {order.number}
      </p>
      <h1 className={styles.h1}>
        {order.number} <span className={styles.badge} data-tone={order.status}>{STATUS_LABELS[order.status as OrderStatus]}</span>
      </h1>
      <div className={styles.split}>
        <div className={styles.stack}>
          <section className={styles.card}>
            <h2 className={styles.h2}>Items</h2>
            <table className={styles.table}>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td>
                      {i.name}
                      <br />
                      <span className={styles.muted}>
                        {i.reference}
                        {i.sku ? ` · SKU ${i.sku}` : ''}
                      </span>
                    </td>
                    <td>× {i.quantity}</td>
                    <td>{formatPaise(i.lineTotalPaise)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2}>Delivery</td>
                  <td>{formatPaise(order.shippingPaise)}</td>
                </tr>
                <tr>
                  <th scope="row" colSpan={2}>
                    Total
                  </th>
                  <td>
                    <strong>{formatPaise(order.totalPaise)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          <section className={styles.card}>
            <h2 className={styles.h2}>Payments</h2>
            {payments.length ? (
              <ul>
                {payments.map((p) => (
                  <li key={p.id}>
                    {p.provider} · {p.status} · {formatPaise(p.amountPaise)} · {p.providerPaymentId ?? p.providerOrderId}
                    {p.errorDescription ? ` — ${p.errorDescription}` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.muted}>No payment recorded.</p>
            )}
          </section>
          <section className={styles.card}>
            <h2 className={styles.h2}>History</h2>
            <ol>
              {events.map((e) => (
                <li key={e.id}>
                  {e.createdAt.toLocaleString('en-IN')} — {STATUS_LABELS[e.toStatus as OrderStatus]} ({e.actorType})
                  {e.note ? `: ${e.note}` : ''}
                </li>
              ))}
            </ol>
          </section>
        </div>
        <div className={styles.stack}>
          <section className={styles.card}>
            <h2 className={styles.h2}>Customer &amp; delivery</h2>
            <p>
              {order.fullName}
              <br />
              <a href={`mailto:${order.email}`} className="text-link">{order.email}</a>
              <br />
              <a href={`tel:${order.phone}`} className="text-link">{order.phone}</a>
            </p>
            <address className={styles.address}>
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ''}
              <br />
              {a.city}, {a.state} {a.postalCode}
            </address>
          </section>
          <section className={styles.card}>
            <h2 className={styles.h2}>Update status</h2>
            <OrderStatusForm orderId={order.id} next={nextStatuses(order.status as OrderStatus, 'staff')} />
          </section>
        </div>
      </div>
    </>
  );
}
