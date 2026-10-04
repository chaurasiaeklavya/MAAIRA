import type { Metadata } from 'next';
import { EditorialStudies } from '@/components/editorial/EditorialStudies';
import { EnquiryBand } from '@/components/home/EnquiryBand';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Editorial',
  description: 'Campaign studies composed from the house’s own photographs of each piece.',
};

export default function EditorialPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Editorial"
        title="Studies in *light*"
        lede="Campaign studies composed from the house’s own photographs of each piece."
      />
      <EditorialStudies />
      <EnquiryBand />
    </PageShell>
  );
}
