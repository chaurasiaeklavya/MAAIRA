import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { DraftNotice, Pending, ServiceLayout } from '@/components/services/ServiceLayout';

export const metadata: Metadata = { title: 'Shipping', robots: { index: false, follow: true } };

export default function ShippingPage() {
  return (
    <PageShell>
      <PageHeader compact eyebrow="Client services" title="Shipping" />
      <ServiceLayout current="/client-services/shipping">
        <DraftNotice />
        <h2>Where we deliver</h2>
        <Pending>shipping coverage (cities, states, international or not)</Pending>
        <h2>Delivery charges</h2>
        <p>Any delivery charge is shown at checkout before you pay.</p>
        <Pending>delivery charge and any free-delivery threshold</Pending>
        <h2>Dispatch and delivery times</h2>
        <Pending>dispatch time and typical delivery time — no estimate is shown until confirmed</Pending>
        <h2>Courier and tracking</h2>
        <Pending>courier partner(s) and how tracking details are shared</Pending>
      </ServiceLayout>
    </PageShell>
  );
}
