import type { Metadata } from 'next';
import { House } from '@/components/House';
import { EnquiryBand } from '@/components/home/EnquiryBand';
import { IdentityStudy } from '@/components/house/IdentityStudy';
import { RevealText } from '@/components/motion/RevealText';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { ProductCard } from '@/components/product/ProductCard';
import { brand } from '@/data/brand';
import { featuredOrder } from '@/lib/catalogue/discovery';
import { getCatalogue } from '@/server/catalogue';
import styles from './house.module.css';

export const metadata: Metadata = {
  title: 'The House',
  description: `${brand.name} — ${brand.descriptor}. A brand of ${brand.businessName}.`,
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const { products } = await getCatalogue();
  const pieces = [...products].sort(featuredOrder).slice(0, 3);
  return (
    <PageShell>
      <PageHeader
        eyebrow="The House"
        title="MAAIRA *Fashion Bags*"
        lede={
          <p>
            {brand.descriptor}. A brand of {brand.businessName}.
          </p>
        }
      />
      <House />
      <IdentityStudy />
      {pieces.length > 0 && (
        <section className={styles.pieces} aria-labelledby="house-pieces-title">
          <div className="container">
            <header className={styles.head}>
              <p className="eyebrow">From the house</p>
              <RevealText as="h2" id="house-pieces-title" className={`${styles.title} display`}>
                {'Selected *pieces*'}
              </RevealText>
            </header>
            <div className={styles.grid}>
              {pieces.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} size="compact" />
              ))}
            </div>
          </div>
        </section>
      )}
      <EnquiryBand />
    </PageShell>
  );
}
