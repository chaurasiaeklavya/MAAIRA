import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/account/AuthForm';
import styles from '@/components/account/Account.module.css';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { authConfigured, currentUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await currentUser()) redirect(next?.startsWith('/') && !next.startsWith('//') ? next : '/account');
  return (
    <PageShell>
      <PageHeader compact eyebrow="Account" title="Sign in" />
      <div className={`container ${styles.wrap}`}>
        {authConfigured() ? (
          <div>
            <AuthForm mode="sign-in" next={next} />
            <p className={styles.links}>
              <Link href="/account/forgot-password" className="text-link">
                Forgotten your password?
              </Link>
            </p>
          </div>
        ) : (
          <p>Accounts are not available yet. You can still shop and check out as a guest.</p>
        )}
        <aside className={styles.aside}>
          <h2 className={styles.asideTitle}>New to MAAIRA?</h2>
          <p>An account keeps your orders, saved addresses and wishlist in one place. You can also check out as a guest.</p>
          <Link href={`/account/register${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="btn btn--secondary">
            Create an account
          </Link>
        </aside>
      </div>
    </PageShell>
  );
}
