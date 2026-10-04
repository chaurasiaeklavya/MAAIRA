import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { DraftNotice, Pending, ServiceLayout } from '@/components/services/ServiceLayout';
import { brand } from '@/data/brand';

export const metadata: Metadata = { title: 'Terms', robots: { index: false, follow: true } };

export default function TermsPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Client services" title="Terms of *use*" />
      <ServiceLayout current="/client-services/terms">
        <DraftNotice />
        <h2>About this website</h2>
        <p>
          This website is operated for {brand.name}, a brand of {brand.businessName}. It currently presents a preview
          selection of pieces; prices shown as ₹XXXX are placeholders and do not constitute an offer.
        </p>
        <h2>Orders and pricing</h2>
        <Pending />
        <h2>Intellectual property</h2>
        <Pending />
        <h2>Liability and governing law</h2>
        <Pending />
      </ServiceLayout>
    </PageShell>
  );
}
