import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDb } from '@/db';
import { PageShell } from '@/components/PageShell';
import { ProductPage } from '@/components/product/ProductPage';
import { featuredOrder, relatedProducts } from '@/lib/catalogue/discovery';
import { primaryImage } from '@/lib/catalogue/types';
import { cloudinaryUrl } from '@/lib/cloudinary';
import { brand } from '@/data/brand';
import { getCatalogue, getProduct } from '@/server/catalogue';
import { loadSettings } from '@/server/commerce/settings';
import { siteUrl } from '@/server/auth-config';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return { title: 'Not found' };
  const img = primaryImage(product);
  return {
    title: product.name,
    description: product.summary ?? `${product.name} — ${brand.name}.`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: img ? { images: [{ url: cloudinaryUrl(img.asset, 1200), alt: img.alt }] } : undefined,
  };
}

export default async function ProductRoute({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const { products } = await getCatalogue();
  const settings = await loadSettings(getDb());
  const related = relatedProducts(product, products);
  const sequence = [...products].sort(featuredOrder);
  const more = related.length ? [] : sequence.filter((p) => p.id !== product.id);
  const img = primaryImage(product);

  // Structured data from verified fields only: no ratings, no invented offers.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: { '@type': 'Brand', name: brand.name },
    ...(product.sku ? { sku: product.sku } : {}),
    ...(img ? { image: cloudinaryUrl(img.asset, 1200) } : {}),
    ...(product.description ? { description: product.description } : {}),
    ...(product.colour ? { color: product.colour } : {}),
    ...(product.material ? { material: product.material } : {}),
    ...(product.price.approved && product.availability !== 'unconfirmed'
      ? {
          offers: {
            '@type': 'Offer',
            url: `${siteUrl()}/products/${product.slug}`,
            priceCurrency: 'INR',
            price: (product.price.paise! / 100).toFixed(2),
            availability:
              product.availability === 'out_of_stock'
                ? 'https://schema.org/OutOfStock'
                : product.availability === 'made_to_order'
                  ? 'https://schema.org/PreOrder'
                  : 'https://schema.org/InStock',
          },
        }
      : {}),
  };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <ProductPage
        product={product}
        sequence={sequence}
        related={related}
        more={more}
        pieces={products.map((p) => ({ slug: p.slug, name: p.name }))}
        blocker={product.blocker}
        maxQuantity={product.maxQuantity}
        policiesApproved={settings.policiesApproved}
      />
    </PageShell>
  );
}
