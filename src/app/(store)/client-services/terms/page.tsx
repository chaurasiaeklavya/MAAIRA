import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { DraftNotice, Pending, ServiceLayout } from '@/components/services/ServiceLayout';
import { brand } from '@/data/brand';

export const metadata: Metadata = { title: 'Terms', robots: { index: false, follow: true } };

export default function TermsPage() {
  return (
    <PageShell>
      <PageHeader compact eyebrow="Client services" title="Terms" />
      <ServiceLayout current="/client-services/terms">
        <DraftNotice />
        <h2>About this website</h2>
        <p>
          This website is operated for {brand.name}, a brand of {brand.businessName}. Prices shown as ₹XXXX are placeholders
          and do not constitute an offer; such pieces can’t be bought online until a price is confirmed.
        </p>
        <h2>Orders and payment</h2>
        <p>
          Prices are charged in Indian rupees. An order is confirmed only after the payment provider confirms your payment; the
          amount is always calculated by our server from the current price.
        </p>
        <Pending>contract formation, pricing errors, and tax treatment (whether prices include GST)</Pending>
        <h2>Delivery, returns and cancellation</h2>
        <p>
          See <a href="/client-services/shipping">Shipping</a>, <a href="/client-services/returns">Returns &amp; refunds</a> and{' '}
          <a href="/client-services/cancellation">Cancellation</a>.
        </p>
        <h2>Intellectual property</h2>
        <Pending>ownership of the brand, logo, photographs and content</Pending>
        <h2>Liability and governing law</h2>
        <Pending>limitation of liability, governing law and jurisdiction, and grievance redressal contact</Pending>
      </ServiceLayout>
    </PageShell>
  );
}
