import { CategoryTiles } from '@/components/home/CategoryTiles';
import { EditorialBand } from '@/components/home/EditorialBand';
import { EnquiryBand } from '@/components/home/EnquiryBand';
import { FeaturedPieces } from '@/components/home/FeaturedPieces';
import { Hero } from '@/components/hero/Hero';
import { House } from '@/components/House';
import { PageShell } from '@/components/PageShell';
import { newArrivals, populatedCategories } from '@/lib/catalogue/discovery';
import { getCatalogue } from '@/server/catalogue';

/**
 * Home is a shopping entry point: brand + "Shop bags" first, then real
 * products, then discovery shortcuts (only for populated categories), then
 * the story, credentials and support.
 */
export default async function Home() {
  const { products, terms } = await getCatalogue();
  const styles = populatedCategories(products, terms, 'style');
  const occasions = populatedCategories(products, terms, 'occasion');
  const arrivals = newArrivals(products);
  const editorialPiece = [...products].sort((a, b) => b.images.length - a.images.length)[0];

  return (
    <PageShell>
      <Hero />
      <FeaturedPieces products={products} />
      <CategoryTiles id="by-style" eyebrow="Shop by style" title="Find your shape" categories={styles} />
      <CategoryTiles id="by-occasion" eyebrow="Shop by occasion" title="What are you looking for?" categories={occasions} />
      {arrivals.length > 0 && <FeaturedPieces products={arrivals} title="New arrivals" eyebrow="Just in" id="arrivals-title" />}
      {editorialPiece && <EditorialBand product={editorialPiece} />}
      <House teaser />
      <EnquiryBand />
    </PageShell>
  );
}
