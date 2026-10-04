import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { ProductPage } from '@/components/product/ProductPage';
import { brand } from '@/data/brand';
import { findProduct, products } from '@/data/products';

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = findProduct((await params).slug);
  if (!product) return {};
  return {
    title: product.displayName,
    description: `${product.displayName} — ${product.tagline} ${brand.name}.`,
  };
}

export default async function ProductRoute({ params }: { params: Promise<{ slug: string }> }) {
  const product = findProduct((await params).slug);
  if (!product) notFound();
  return (
    <PageShell>
      <ProductPage product={product} />
    </PageShell>
  );
}
