import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { Listing } from '@/components/shop/Listing';
import { parseShopQuery } from '@/lib/catalogue/discovery';
import { buildListing } from '@/lib/catalogue/listing';
import { getCatalogue } from '@/server/catalogue';

export const metadata: Metadata = {
  title: 'Shop all bags',
  description: 'Shop MAAIRA FASHION BAGS — every piece, with filters by style and occasion.',
  alternates: { canonical: '/shop' },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = parseShopQuery(await searchParams);
  const { products, terms } = await getCatalogue();
  const data = buildListing(products, terms, query);
  return (
    <PageShell>
      <PageHeader
        eyebrow="Shop"
        title="The *pieces*"
        lede="Every piece the house has published. Open one for each photographed view, save it, or enquire directly — a price shows as ₹XXXX until the house confirms it."
      />
      <Listing data={data} query={query} basePath="/shop" hidden={query.q ? { q: query.q } : {}} forthcoming={!data.facets.some((f) => f.options.some((o) => o.selected))} />
    </PageShell>
  );
}
