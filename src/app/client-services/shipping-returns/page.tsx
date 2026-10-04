import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { DraftNotice, Pending, ServiceLayout } from '@/components/services/ServiceLayout';

export const metadata: Metadata = { title: 'Shipping & returns', robots: { index: false, follow: true } };

export default function ShippingReturnsPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Client services" title="Shipping &amp; *returns*" />
      <ServiceLayout current="/client-services/shipping-returns">
        <DraftNotice />
        <h2>Delivery</h2>
        <p>Where the house delivers, how long it takes and what it costs.</p>
        <Pending />
        <h2>Returns &amp; exchanges</h2>
        <p>Eligibility, time limits and how to start a return.</p>
        <Pending />
        <h2>Cancellations &amp; refunds</h2>
        <p>How orders can be cancelled and how refunds are made.</p>
        <Pending />
        <h2>Warranty &amp; care</h2>
        <Pending />
      </ServiceLayout>
    </PageShell>
  );
}
