import { Collection } from '@/components/collection/Collection';
import { Hero } from '@/components/hero/Hero';
import { CampaignStudy } from '@/components/home/CampaignStudy';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { EnquiryBand } from '@/components/home/EnquiryBand';
import { FeaturedPieces } from '@/components/home/FeaturedPieces';
import { GalleryRing } from '@/components/home/GalleryRing';
import { House } from '@/components/House';
import { PageShell } from '@/components/PageShell';
import { featuredOrder, newArrivals, populatedCategories } from '@/lib/catalogue/discovery';
import { getCatalogue } from '@/server/catalogue';

/**
 * The house's front door: the cinematic hero, the leading pieces, a study of
 * one piece in every view, the house, every photograph in the round, the
 * collection pauses and enquiries. Shop-by-style/occasion shortcuts appear
 * only for categories real products carry.
 */
export default async function Home() {
  const { products, terms } = await getCatalogue();
  const featured = [...products].sort(featuredOrder);
  const styles = populatedCategories(products, terms, 'style');
  const occasions = populatedCategories(products, terms, 'occasion');
  const arrivals = newArrivals(products);
  const studied = [...products].sort((a, b) => b.images.length - a.images.length)[0];
  const photographs = products.reduce((n, p) => n + p.images.length, 0);

  return (
    <PageShell>
      <Hero count={products.length} />
      <FeaturedPieces products={featured} />
      <CategoryTiles id="by-style" eyebrow="Shop by style" title="Find your *shape*" categories={styles} />
      <CategoryTiles id="by-occasion" eyebrow="Shop by occasion" title="For every *occasion*" categories={occasions} />
      {arrivals.length > 0 && <FeaturedPieces products={arrivals} eyebrow="Just in" title="New *arrivals*" lede="The latest pieces from the house." id="arrivals-title" shared={false} />}
      {studied && studied.images.length > 1 && <CampaignStudy product={studied} />}
      <House teaser />
      {photographs >= 3 && <GalleryRing products={featured} />}
      <Collection />
      <EnquiryBand />
    </PageShell>
  );
}
