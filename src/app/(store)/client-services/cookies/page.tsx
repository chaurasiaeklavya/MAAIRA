import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { DraftNotice, ServiceLayout } from '@/components/services/ServiceLayout';

export const metadata: Metadata = { title: 'Cookies', robots: { index: false, follow: true } };

/** Written from the implementation: every cookie and storage key the site sets. */
export default function CookiesPage() {
  return (
    <PageShell>
      <PageHeader compact eyebrow="Client services" title="Cookies & storage" />
      <ServiceLayout current="/client-services/cookies">
        <DraftNotice>This describes what the website currently stores. It has not yet been reviewed as a formal cookie policy.</DraftNotice>
        <h2>Strictly necessary cookies</h2>
        <ul>
          <li>
            <strong>maaira_cart</strong> — a random identifier for your cart (30 days). It contains no personal information.
          </li>
          <li>
            <strong>maaira.session_token</strong> (and related <strong>maaira.*</strong> cookies) — keep you signed in when you
            use an account (up to 7 days).
          </li>
        </ul>
        <h2>Stored in your browser only</h2>
        <ul>
          <li>Theme (light/dark) and sound preferences</li>
          <li>Your wishlist, if you are not signed in</li>
          <li>Pieces you viewed recently on this device</li>
        </ul>
        <p>These are not sent to the house unless you sign in (your wishlist is then saved to your account).</p>
        <h2>Analytics and advertising</h2>
        <p>The website uses no analytics, advertising or tracking cookies.</p>
      </ServiceLayout>
    </PageShell>
  );
}
