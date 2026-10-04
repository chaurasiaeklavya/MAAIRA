import type { Metadata } from 'next';
import { House } from '@/components/House';
import { EnquiryBand } from '@/components/home/EnquiryBand';
import { IdentityStudy } from '@/components/house/IdentityStudy';
import { PageHeader } from '@/components/PageHeader';
import { PageShell } from '@/components/PageShell';
import { ProductCard } from '@/components/product/ProductCard';
import { brand } from '@/data/brand';
import { products } from '@/data/products';
import styles from './house.module.css';

export const metadata: Metadata = {
  title: 'The House',
  description: `${brand.name} — ${brand.descriptor}. A brand of ${brand.businessName}.`,
};

export default function HousePage() {
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
      <section className={styles.pieces} aria-labelledby="house-pieces-title">
        <div className="container">
          <header className={styles.head}>
            <p className="eyebrow">From the house</p>
            <h2 id="house-pieces-title" className={`${styles.title} display`}>
              The preview <em>pieces</em>
            </h2>
          </header>
          <div className={styles.grid}>
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} size="compact" />
            ))}
          </div>
        </div>
      </section>
      <EnquiryBand />
    </PageShell>
  );
}
