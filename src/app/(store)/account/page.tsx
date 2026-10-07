import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDb } from '@/db';
import styles from '@/components/account/Account.module.css';
import { SignOutButton } from '@/components/account/SignOutButton';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { formatPaise } from '@/lib/commerce/money';
import { STATUS_LABELS, type OrderStatus } from '@/lib/commerce/order-state';
import { currentUser } from '@/server/auth';
import { listOrdersForUser } from '@/server/commerce/orders-repo';

export const metadata: Metadata = { title: 'My account', robots: { index: false, follow: false } };

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect('/account/sign-in?next=/account');
  const orders = await listOrdersForUser(getDb(), user.id);
  return (
    <PageShell>
      <PageHeader compact eyebrow="My account" title={`Hello, ${user.name.split(' ')[0]}`} />
      <div className={`container ${styles.dash}`}>
        <section aria-labelledby="orders-title">
          <h2 id="orders-title" className={styles.h2}>
            Orders
          </h2>
          {orders.length ? (
            <ul className={styles.orders}>
              {orders.map((o) => (
                <li key={o.number}>
                  <Link href={`/orders/${o.number}`}>
                    <span className={styles.orderNo}>{o.number}</span>
                    <span>{formatPaise(o.totalPaise)}</span>
                    <span className={styles.muted}>
                      {STATUS_LABELS[o.status as OrderStatus]} · {o.itemCount} {o.itemCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className={styles.muted}>{o.placedAt?.toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>
              No orders yet. <Link href="/shop" className="text-link">Explore bags</Link>
            </p>
          )}
        </section>
        <aside className={styles.aside}>
          <div className={styles.card}>
            <h2 className={styles.h2}>Details</h2>
            <p>
              {user.name}
              <br />
              {user.email}
            </p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.h2}>Shortcuts</h2>
            <Link href="/account/addresses" className="text-link">
              Saved addresses
            </Link>
            <Link href="/wishlist" className="text-link">
              Wishlist
            </Link>
            <Link href="/contact" className="text-link">
              Contact the house
            </Link>
          </div>
          <SignOutButton />
        </aside>
      </div>
    </PageShell>
  );
}
