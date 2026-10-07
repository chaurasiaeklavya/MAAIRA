import type { MetadataRoute } from 'next';
import { populatedCategories } from '@/lib/catalogue/discovery';
import { getCatalogue } from '@/server/catalogue';
import { siteUrl } from '@/server/auth-config';

export const dynamic = 'force-dynamic';

/** Public, indexable pages only: no cart, checkout, account, admin, search or draft policies. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const pages = ['/', '/shop', '/about', '/editorial', '/contact', '/client-services'].map((p) => ({ url: `${base}${p}` }));
  try {
    const { products, terms } = await getCatalogue();
    const cats = [...populatedCategories(products, terms, 'style'), ...populatedCategories(products, terms, 'occasion')];
    return [
      ...pages,
      ...cats.map((c) => ({ url: `${base}/shop/${c.term.slug}` })),
      ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.publishedAt ?? undefined })),
    ];
  } catch {
    return pages;
  }
}
