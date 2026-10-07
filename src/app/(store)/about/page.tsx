import type { Metadata } from 'next';
import { House } from '@/components/House';
import { EnquiryBand } from '@/components/home/EnquiryBand';
import { FeaturedPieces } from '@/components/home/FeaturedPieces';
import { IdentityStudy } from '@/components/house/IdentityStudy';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { brand } from '@/data/brand';
import { getCatalogue } from '@/server/catalogue';

export const metadata: Metadata = {
  title: 'About MAAIRA',
  description: `${brand.name} — ${brand.descriptor}. A brand of ${brand.businessName}.`,
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const { products } = await getCatalogue();
  return (
    <PageShell>
      <PageHeader
        eyebrow="About"
        title="MAAIRA *Fashion Bags*"
        lede={
          <p>
            {brand.descriptor}. A brand of {brand.businessName}.
          </p>
        }
      />
      <House />
      <IdentityStudy />
      <FeaturedPieces products={products} title="From the house" eyebrow="Shop" id="about-pieces-title" />
      <EnquiryBand />
    </PageShell>
  );
}
