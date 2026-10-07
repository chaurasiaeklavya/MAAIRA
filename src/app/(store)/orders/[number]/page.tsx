import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/db';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { CartSync } from '@/components/commerce/CartSync';
import { OrderAutoRefresh } from '@/components/commerce/OrderAutoRefresh';
import { formatPaise } from '@/lib/commerce/money';
import { STATUS_LABELS, type OrderStatus } from '@/lib/commerce/order-state';
import { brand } from '@/data/brand';
import { currentUser } from '@/server/auth';
import { findOrderForCustomer } from '@/server/commerce/orders-repo';
import styles from './order.module.css';

export const metadata: Metadata = { title: 'Your order', robots: { index: false, follow: false } };

const MESSAGES: Partial<Record<OrderStatus, string>> = {
  pending_payment: 'We’re waiting for the payment provider to confirm your payment. This page updates automatically.',
  payment_failed: 'The payment didn’t go through and nothing was charged. You can return to your cart and try again.',
  paid: 'Thank you — your payment is confirmed and your order is with the house.',
  processing: 'Your order is being prepared.',
  shipped: 'Your order is on its way.',
  delivered: 'Your order has been delivered.',
  cancelled: 'This order was cancelled. Any reserved piece has been released.',
  refunded: 'This order has been refunded.',
};

export default async function OrderPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string }> }) {
  const { number } = await params;
  const { t } = await searchParams;
  const user = await currentUser();
  const found = await findOrderForCustomer(getDb(), number, { userId: user?.id, token: typeof t === 'string' ? t : null });
  if (!found) notFound();
  const { order, items, events } = found;
  const status = order.status as OrderStatus;
  const address = order.shippingAddress as Record<string, string>;

  return (
    <PageShell>
      <PageHeader compact eyebrow={`Order ${order.number}`} title={STATUS_LABELS[status]} lede={MESSAGES[status]} />
      {status === 'pending_payment' && <OrderAutoRefresh />}
      <CartSync token={status} />
      <div className={`container ${styles.layout}`}>
        <section aria-labelledby="items-title">
          <h2 id="items-title" className={styles.h2}>
            Items
          </h2>
          <ul className={styles.items}>
            {items.map((i) => (
              <li key={i.id}>
                <span>
                  {i.name} <span className={styles.muted}>× {i.quantity}</span>
                </span>
                <span>{formatPaise(i.lineTotalPaise)}</span>
              </li>
            ))}
          </ul>
          <dl className={styles.totals}>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPaise(order.subtotalPaise)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{formatPaise(order.shippingPaise)}</dd>
            </div>
            <div className={styles.grand}>
              <dt>Total{order.pricesIncludeTax ? ' (inclusive of taxes)' : ''}</dt>
              <dd>{formatPaise(order.totalPaise)}</dd>
            </div>
          </dl>
        </section>
        <aside className={styles.aside}>
          <h2 className={styles.h2}>Delivery to</h2>
          <address className={styles.address}>
            {address.fullName}
            <br />
            {address.line1}
            {address.line2 ? (
              <>
                <br />
                {address.line2}
              </>
            ) : null}
            <br />
            {address.city}, {address.state} {address.postalCode}
            <br />
            {address.phone}
          </address>
          <h2 className={styles.h2}>History</h2>
          <ol className={styles.timeline}>
            {events.map((e) => (
              <li key={e.id}>
                <span>{STATUS_LABELS[e.toStatus as OrderStatus]}</span>
                <time dateTime={e.createdAt.toISOString()}>{e.createdAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</time>
              </li>
            ))}
          </ol>
          <p className={styles.help}>
            Questions? Quote <strong>{order.number}</strong> — call <a href={brand.contact.phoneHref} className="text-link">{brand.contact.phoneDisplay}</a> or{' '}
            <Link href="/contact" className="text-link">
              contact the house
            </Link>
            .
          </p>
          {!user && <p className={styles.muted}>Keep this page’s link to return to your order.</p>}
        </aside>
      </div>
    </PageShell>
  );
}
