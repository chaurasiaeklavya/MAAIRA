import { PageShell } from '@/components/PageShell';
import { Collection } from '@/components/collection/Collection';
import { Hero } from '@/components/hero/Hero';
import { CampaignStudy } from '@/components/home/CampaignStudy';
import { EnquiryBand } from '@/components/home/EnquiryBand';
import { FeaturedPieces } from '@/components/home/FeaturedPieces';
import { GalleryRing } from '@/components/home/GalleryRing';
import { House } from '@/components/House';

export default function Home() {
  return (
    <PageShell>
      <Hero />
      <FeaturedPieces />
      <CampaignStudy />
      <House teaser />
      <GalleryRing />
      <Collection />
      <EnquiryBand />
    </PageShell>
  );
}
