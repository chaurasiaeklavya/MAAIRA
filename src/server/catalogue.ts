import 'server-only';
import { cache } from 'react';
import { getDb } from '@/db';
import { loadProducts, loadTerms } from './catalogue-repo';
import { featuredOrder } from '@/lib/catalogue/discovery';

/**
 * Request-scoped catalogue reads for pages. The published catalogue is small
 * enough to load whole per request (a few hundred products is still a single
 * fast query); filtering, facets and search run in memory on the server.
 */
export const getCatalogue = cache(async () => {
  const db = getDb();
  const [products, terms] = await Promise.all([loadProducts(db), loadTerms(db)]);
  return { products: products.sort(featuredOrder), terms };
});

export const getProduct = cache(async (slug: string) => {
  const { products } = await getCatalogue();
  return products.find((p) => p.slug === slug) ?? null;
});
