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

        <h2>What the enquiry and callback forms collect</h2>
        <ul>
          <li>Your name, and the email address and/or phone number you provide</li>
          <li>The piece you ask about (if any), your message, and your contact or callback-time preference</li>
          <li>The time you agreed to be contacted about your request</li>
        </ul>
        <p>
          These details are used to respond to your request. The forms do not collect payment information. Requests are
          sent to {brand.name} over an encrypted connection when the site is served over HTTPS.
        </p>

        <h2>Preferences stored in your browser</h2>
        <p>
          Your theme choice (Espresso or Ivory) and sound settings are saved in your browser’s local storage so the site
          remembers them. They are not sent to the house.
        </p>

        <h2>Analytics and advertising</h2>
        <p>This preview edition uses no analytics, advertising or tracking scripts.</p>

        <h2>Product images</h2>
        <p>Product photographs are delivered by Cloudinary, which receives standard request information (such as your IP address) when an image loads.</p>

        <h2>Retention, your rights and contact for privacy requests</h2>
        <Pending />
      </ServiceLayout>
    </PageShell>
  );
}
