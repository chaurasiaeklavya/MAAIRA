import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { DraftNotice, Pending, ServiceLayout } from '@/components/services/ServiceLayout';

export const metadata: Metadata = { title: 'Cancellation', robots: { index: false, follow: true } };

export default function CancellationPage() {
  return (
    <PageShell>
      <PageHeader compact eyebrow="Client services" title="Cancellation" />
      <ServiceLayout current="/client-services/cancellation">
        <DraftNotice />
        <h2>Unpaid orders</h2>
        <p>
          An order that is not paid within 30 minutes of checkout is cancelled automatically, and any piece reserved for it is
          released. Nothing is charged.
        </p>
        <h2>Cancelling a paid order</h2>
        <Pending>whether and until when a paid order can be cancelled (e.g. before dispatch), and how to request it</Pending>
        <h2>Cancellation by the house</h2>
        <Pending>circumstances in which the business may cancel an order, and the refund process in that case</Pending>
      </ServiceLayout>
    </PageShell>
  );
}
