import type { Metadata } from 'next';
import { AuthForm } from '@/components/account/AuthForm';
import styles from '@/components/account/Account.module.css';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { brand } from '@/data/brand';
import { emailConfigured } from '@/server/email';

export const metadata: Metadata = { title: 'Reset your password', robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return (
    <PageShell>
      <PageHeader compact eyebrow="Account" title="Reset your password" />
      <div className={`container ${styles.narrow}`}>
        {emailConfigured() ? (
          <>
            <p style={{ marginBottom: 20 }}>Enter your account email and we’ll send a link to choose a new password.</p>
            <AuthForm mode="forgot" />
          </>
        ) : (
          <p>
            Password reset by email isn’t available yet. Please contact the house at{' '}
            <a href={`mailto:${brand.contact.email}`} className="text-link">
              {brand.contact.email}
            </a>{' '}
            or <a href={brand.contact.phoneHref} className="text-link">{brand.contact.phoneDisplay}</a> and we’ll help you.
          </p>
        )}
      </div>
    </PageShell>
  );
}
