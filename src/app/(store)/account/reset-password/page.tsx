import type { Metadata } from 'next';
import { AuthForm } from '@/components/account/AuthForm';
import styles from '@/components/account/Account.module.css';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';

export const metadata: Metadata = { title: 'Choose a new password', robots: { index: false, follow: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;
  return (
    <PageShell>
      <PageHeader compact eyebrow="Account" title="Choose a new password" />
      <div className={`container ${styles.narrow}`}>
        {token && !error ? <AuthForm mode="reset" token={token} /> : <p>This reset link is invalid or has expired. Please request a new one.</p>}
      </div>
    </PageShell>
  );
}
