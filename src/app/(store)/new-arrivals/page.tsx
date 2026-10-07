import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { Listing } from '@/components/shop/Listing';
import { newArrivals, parseShopQuery } from '@/lib/catalogue/discovery';
import { buildListing } from '@/lib/catalogue/listing';
import { getCatalogue } from '@/server/catalogue';

export const metadata: Metadata = { title: 'New arrivals', alternates: { canonical: '/new-arrivals' } };

/** Exists only when staff have actually marked pieces as new arrivals. */
export default async function NewArrivalsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { products, terms } = await getCatalogue();
  const arrivals = newArrivals(products);
  if (!arrivals.length) notFound();
  const query = parseShopQuery(await searchParams);
  const data = buildListing(arrivals, terms, { ...query, sort: query.sort === 'featured' ? 'newest' : query.sort });
  return (
    <PageShell>
      <PageHeader eyebrow="Shop" title="New *arrivals*" crumbs={[{ href: '/shop', label: 'Shop' }, { href: '/new-arrivals', label: 'New arrivals' }]} />
      <Listing data={data} query={query} basePath="/new-arrivals" />
    </PageShell>
  );
}
