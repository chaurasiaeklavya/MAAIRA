import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { Faq } from '@/components/services/Faq';
import { ServiceLayout } from '@/components/services/ServiceLayout';
import { brand } from '@/data/brand';

export const metadata: Metadata = { title: 'Client services' };

export default function ClientServicesPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Client services" title="How can we *help?*" />
      <ServiceLayout current="/client-services">
        <h2>Questions</h2>
        <Faq
          items={[
            {
              q: 'How do I enquire about a piece?',
              a: (
                <p>
                  Open the piece and choose “Enquire about this piece”, or use the <Link href="/contact">contact page</Link>. You
                  can also write to <a href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a> or call{' '}
                  <a href={brand.contact.phoneHref}>{brand.contact.phoneDisplay}</a>.
                </p>
              ),
            },
            {
              q: 'Are the prices shown final?',
              a: <p>Not yet. Prices in this preview are shown as ₹XXXX while they are being confirmed. Please enquire for current pricing.</p>,
            },
            {
              q: 'Can the house call me back?',
              a: (
                <p>
                  Yes — choose “Request a callback” on the <Link href="/contact?mode=callback">contact page</Link> and pick a preferred
                  time. It is a preference only; a specific time can’t be guaranteed.
                </p>
              ),
            },
            {
              q: 'Where can I see more of the collection?',
              a: (
                <p>
                  This preview shows selected pieces. Follow the house on{' '}
                  <a href={brand.contact.instagramUrl} target="_blank" rel="noopener noreferrer">
                    Instagram {brand.contact.instagramHandle}
                  </a>{' '}
                  for what comes next.
                </p>
              ),
            },
            {
              q: 'Do you deliver to my city, and what is the returns policy?',
              a: (
                <p>
                  Delivery, returns and cancellation terms will be published once approved — see{' '}
                  <Link href="/client-services/shipping-returns">Shipping &amp; returns</Link>. Until then, please ask the house
                  directly.
                </p>
              ),
            },
          ]}
        />
      </ServiceLayout>
    </PageShell>
  );
}
