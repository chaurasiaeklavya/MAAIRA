import type { Metadata } from 'next';
import { EditorialStudies } from '@/components/editorial/EditorialStudies';
import { CampaignStudy } from '@/components/home/CampaignStudy';
import { EnquiryBand } from '@/components/home/EnquiryBand';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { getCatalogue } from '@/server/catalogue';

export const metadata: Metadata = {
  title: 'Editorial',
  description: 'Studies composed from the house’s own photographs of each piece.',
  alternates: { canonical: '/editorial' },
};

export default async function EditorialPage() {
  const { products } = await getCatalogue();
  const withViews = [...products].filter((p) => p.images.length > 1).sort((a, b) => b.images.length - a.images.length)[0];
  return (
    <PageShell>
      <PageHeader eyebrow="Editorial" title="Studies in *light*" lede="Composed only from the house’s own photographs of each piece." />
      <EditorialStudies products={products} />
      {withViews && <CampaignStudy product={withViews} />}
      <EnquiryBand />
    </PageShell>
  );
}
