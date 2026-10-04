'use client';

import Link from 'next/link';
import { RevealText } from '../motion/RevealText';
import { ProductCard, type CardSize } from '../product/ProductCard';
import styles from './FeaturedPieces.module.css';
import { products } from '@/data/products';

const SIZES: CardSize[] = ['hero', 'medium', 'large'];

/** Home: the three sample pieces in an asymmetric editorial composition. */
export function FeaturedPieces() {
  return (
    <section className={styles.section} aria-labelledby="featured-title">
      <div className="container">
        <header className={styles.head}>
          <p className="eyebrow">A first look</p>
          <RevealText as="h2" id="featured-title" className={`${styles.title} display`}>
            {'Selected *pieces*'}
          </RevealText>
          <p className={styles.lede}>
            A curated preview of the house — each piece shown in its own light. Select one to see every view.
          </p>
        </header>

        <div className={styles.grid}>
          {products.map((p, i) => (
            <div key={p.id} className={styles.slot} data-slot={i}>
              <ProductCard product={p} index={i} size={SIZES[i] ?? 'medium'} />
            </div>
          ))}
        </div>

        <div className={styles.more}>
          <Link href="/shop" className={styles.moreLink} transitionTypes={['nav-forward']}>
            <span>All pieces</span>
            <svg viewBox="0 0 32 12" width="28" height="12" aria-hidden="true">
              <path d="M0 6h30m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
