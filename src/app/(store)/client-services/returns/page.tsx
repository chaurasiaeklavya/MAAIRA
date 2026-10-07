import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { DraftNotice, Pending, ServiceLayout } from '@/components/services/ServiceLayout';

export const metadata: Metadata = { title: 'Returns & refunds', robots: { index: false, follow: true } };

export default function ReturnsPage() {
  return (
    <PageShell>
      <PageHeader compact eyebrow="Client services" title="Returns & refunds" />
      <ServiceLayout current="/client-services/returns">
        <DraftNotice />
        <h2>Return window</h2>
        <Pending>return window (number of days) and from when it is counted</Pending>
        <h2>Eligibility</h2>
        <Pending>condition requirements, tags/packaging, and any non-returnable items</Pending>
        <h2>How to start a return</h2>
        <Pending>return process, pickup or drop-off, and who pays return shipping</Pending>
        <h2>Refunds</h2>
        <p>Refunds for online payments are made through the payment provider to the original payment method.</p>
        <Pending>refund timeline and any deductions</Pending>
        <h2>Exchanges, damage and warranty</h2>
        <Pending>exchange policy, damaged/defective item process and any warranty</Pending>
      </ServiceLayout>
    </PageShell>
  );
}
