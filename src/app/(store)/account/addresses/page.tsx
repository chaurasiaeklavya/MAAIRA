import type { Metadata } from 'next';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { AddressForm } from '@/components/account/AddressForm';
import styles from '@/components/account/Account.module.css';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { INDIAN_STATES } from '@/lib/commerce/checkout-schema';
import { currentUser } from '@/server/auth';
import { deleteAddress } from './actions';

export const metadata: Metadata = { title: 'Saved addresses', robots: { index: false, follow: false } };

export default async function AddressesPage() {
  const user = await currentUser();
  if (!user) redirect('/account/sign-in?next=/account/addresses');
  const rows = await getDb().select().from(s.addresses).where(eq(s.addresses.userId, user.id)).orderBy(desc(s.addresses.isDefault), desc(s.addresses.createdAt));
  return (
    <PageShell>
      <PageHeader eyebrow="My account" title="Saved *addresses*" crumbs={[{ href: '/account', label: 'Account' }, { href: '/account/addresses', label: 'Addresses' }]} />
      <div className={`container ${styles.wrap}`}>
        <section aria-labelledby="saved-title">
          <h2 id="saved-title" className={styles.h2}>
            Saved
          </h2>
          {rows.length ? (
            <ul className={styles.addressList}>
              {rows.map((a) => (
                <li key={a.id}>
                  <address style={{ fontStyle: 'normal' }}>
                    {a.fullName}
                    <br />
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ''}
                    <br />
                    {a.city}, {a.state} {a.postalCode}
                    <br />
                    {a.phone}
                  </address>
                  <form action={deleteAddress}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className={styles.linkButton}>
                      Remove<span className="visually-hidden"> address for {a.fullName}</span>
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>No saved addresses yet.</p>
          )}
        </section>
        <section aria-labelledby="add-title">
          <h2 id="add-title" className={styles.h2}>
            Add an address
          </h2>
          <AddressForm states={[...INDIAN_STATES]} />
        </section>
      </div>
    </PageShell>
  );
}
