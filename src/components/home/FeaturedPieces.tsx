import Link from 'next/link';
import { RevealText } from '../motion/RevealText';
import { ProductCard, type CardSize } from '../product/ProductCard';
import type { CatalogueProduct } from '@/lib/catalogue/types';
import styles from './FeaturedPieces.module.css';

const SIZES: CardSize[] = ['hero', 'medium', 'large'];

/** Home: the leading pieces in an asymmetric editorial composition. */
export function FeaturedPieces({
  products,
  eyebrow = 'A first look',
  title = 'Selected *pieces*',
  lede = 'Pieces from the house, each shown in its own light. Open one to see every photographed view.',
  id = 'featured-title',
  shared = true,
}: {
  products: CatalogueProduct[];
  eyebrow?: string;
  /** Wrap words in *asterisks* for the italic display emphasis. */
  title?: string;
  lede?: string;
  id?: string;
  /** Shared-element morph names; off when the same pieces may appear twice on the page. */
  shared?: boolean;
}) {
  if (!products.length) return null;
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className="container">
        <header className={styles.head}>
          <p className="eyebrow">{eyebrow}</p>
          <RevealText as="h2" id={id} className={`${styles.title} display`}>
            {title}
          </RevealText>
          <p className={styles.lede}>{lede}</p>
        </header>

        <div className={styles.grid}>
          {products.slice(0, 3).map((p, i) => (
            <div key={p.id} className={styles.slot} data-slot={i}>
              <ProductCard product={p} index={i} size={SIZES[i] ?? 'medium'} priority={i === 0} sharedTransition={shared} />
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
