import Link from 'next/link';
import { ProductCard } from '../product/ProductCard';
import type { CatalogueProduct } from '@/lib/catalogue/types';
import styles from './FeaturedPieces.module.css';

/** Home: real products straight after the hero — the fastest route to shopping. */
export function FeaturedPieces({ products, title = 'Featured', eyebrow = 'Shop', id = 'featured-title' }: { products: CatalogueProduct[]; title?: string; eyebrow?: string; id?: string }) {
  if (!products.length) return null;
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className="container">
        <header className={styles.head}>
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id={id} className={`${styles.title} display`}>
              {title}
            </h2>
          </div>
          <Link href="/shop" className="btn btn--secondary">
            Shop all bags
          </Link>
        </header>
        <ul className={styles.grid} data-count={Math.min(products.length, 4)}>
          {products.slice(0, 4).map((p, i) => (
            <li key={p.id}>
              <ProductCard product={p} priority={i < 2} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
