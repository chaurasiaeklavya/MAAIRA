import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/account/AuthForm';
import styles from '@/components/account/Account.module.css';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { authConfigured, currentUser } from '@/server/auth';

export const metadata: Metadata = { title: 'Create an account', robots: { index: false, follow: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await currentUser()) redirect('/account');
  return (
    <PageShell>
      <PageHeader compact eyebrow="Account" title="Create an account" />
      <div className={`container ${styles.wrap}`}>
        {authConfigured() ? <AuthForm mode="register" next={next} /> : <p>Accounts are not available yet.</p>}
        <aside className={styles.aside}>
          <p>We only ask for what your orders need. We don’t send marketing emails.</p>
          <p>
            Already have an account?{' '}
            <Link href="/account/sign-in" className="text-link">
              Sign in
            </Link>
          </p>
          <p>
            <Link href="/client-services/privacy" className="text-link">
              How we use your information
            </Link>
          </p>
        </aside>
      </div>
    </PageShell>
  );
}
