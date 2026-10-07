import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { DraftNotice, Pending, ServiceLayout } from '@/components/services/ServiceLayout';
import { brand } from '@/data/brand';

export const metadata: Metadata = { title: 'Privacy', robots: { index: false, follow: true } };

/**
 * Factual description of what this website does with data, written from the
 * implementation. Legal wording, retention periods and rights are pending the
 * business's approved policy.
 */
export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Client services" title="Privacy" />
      <ServiceLayout current="/client-services/privacy">
        <DraftNotice>
          The sections below describe how this website currently handles information. The full privacy policy of{' '}
          {brand.businessName} has not yet been approved or published.
        </DraftNotice>

        <h2>What we collect, and why</h2>
        <ul>
          <li>
            <strong>Enquiries and callback requests:</strong> your name, email and/or phone number, the piece you ask about, your
            message and your contact/callback preference — to respond to you.
          </li>
          <li>
            <strong>Orders:</strong> your name, email, phone number and delivery address, and what you ordered — to fulfil and
            support the order.
          </li>
          <li>
            <strong>Accounts (optional):</strong> your name, email and a securely hashed password; saved addresses, your wishlist and
            order history.
          </li>
        </ul>
        <h2>Payments</h2>
        <p>
          Card, UPI and other payment details are entered with the payment provider (Razorpay) and are never seen or stored by this
          website. We keep the payment reference and status needed to confirm your order.
        </p>
        <h2>Email</h2>
        <p>Order and account emails are sent through a transactional email provider when configured. We do not send marketing emails.</p>
        <h2>Cookies and storage</h2>
        <p>
          See <Link href="/client-services/cookies">Cookies &amp; storage</Link> for everything the site stores in your browser.
        </p>
        <h2>Analytics and advertising</h2>
        <p>The website uses no analytics, advertising or tracking scripts.</p>
        <h2>Product images</h2>
        <p>Product photographs are delivered by Cloudinary, which receives standard request information (such as your IP address) when an image loads.</p>
        <h2>Who is responsible</h2>
        <Pending>data controller details (registered name and address of Maanya Enterprises) and grievance officer contact</Pending>
        <h2>Retention and your rights</h2>
        <Pending>how long each kind of data is kept, and how to request access, correction or deletion</Pending>
      </ServiceLayout>
    </PageShell>
  );
}
