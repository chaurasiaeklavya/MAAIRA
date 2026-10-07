import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { Listing } from '@/components/shop/Listing';
import { parseShopQuery, populatedCategories } from '@/lib/catalogue/discovery';
import { buildListing } from '@/lib/catalogue/listing';
import { getCatalogue } from '@/server/catalogue';

async function resolve(slug: string) {
  const { products, terms } = await getCatalogue();
  const populated = [...populatedCategories(products, terms, 'style'), ...populatedCategories(products, terms, 'occasion')];
  return { products, terms, category: populated.find((c) => c.term.slug === slug) ?? null };
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await resolve((await params).category);
  if (!category) return { title: 'Not found' };
  return {
    title: category.term.label,
    description: category.term.description ?? undefined,
    alternates: { canonical: `/shop/${category.term.slug}` },
  };
}

/** Style and occasion landing pages. Only populated categories exist. */
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const slug = (await params).category;
  const { products, terms, category } = await resolve(slug);
  if (!category) {
    // Product pages used to live at /shop/<slug>.
    if (products.some((p) => p.slug === slug)) permanentRedirect(`/products/${slug}`);
    notFound();
  }
  const query = parseShopQuery(await searchParams);
  const data = buildListing(products, terms, query, { kind: category.term.kind, slug: category.term.slug });
  const eyebrow = category.term.kind === 'style' ? 'Shop by style' : 'Shop by occasion';
  return (
    <PageShell>
      <PageHeader
        compact
        eyebrow={eyebrow}
        title={category.term.label}
        lede={category.term.description ?? undefined}
        crumbs={[
          { href: '/shop', label: 'Shop' },
          { href: `/shop/${category.term.slug}`, label: category.term.label },
        ]}
      />
      <Listing data={data} query={query} basePath={`/shop/${category.term.slug}`} />
    </PageShell>
  );
}
