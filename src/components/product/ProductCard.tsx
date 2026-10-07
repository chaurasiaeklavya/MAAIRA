'use client';

import Link from 'next/link';
import { CloudImage } from '../CloudImage';
import { Stage } from '../showcase/Stage';
import { WishlistButton } from '../commerce/WishlistButton';
import { primaryImage, type CatalogueProduct } from '@/lib/catalogue/types';
import styles from './ProductCard.module.css';

/**
 * Catalogue card: the photograph dominates; name, price and a subtle
 * wishlist toggle sit below. The whole card opens the product page.
 * On fine pointers a second photograph fades in on hover.
 */
export function ProductCard({
  product,
  sizes = '(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw',
  priority = false,
  headingLevel: H = 'h3',
}: {
  product: CatalogueProduct;
  sizes?: string;
  priority?: boolean;
  headingLevel?: 'h2' | 'h3';
}) {
  const primary = primaryImage(product);
  const secondary = product.images.find((i) => i !== primary) ?? null;
  const note =
    product.availability === 'out_of_stock' ? 'Currently unavailable' : product.availability === 'made_to_order' ? 'Made to order' : null;

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Stage preset={product.stage} className={styles.stage} />
        <div className={styles.photo}>
          {primary ? (
            <CloudImage asset={primary.asset} alt={primary.alt} sizes={sizes} width={720} maxWidth={1280} priority={priority} variant="natural" className={styles.img} />
          ) : (
            <span className={styles.noImage}>Image coming soon</span>
          )}
          {secondary && (
            <CloudImage asset={secondary.asset} alt="" sizes={sizes} width={720} maxWidth={1280} variant="natural" className={`${styles.img} ${styles.alt}`} />
          )}
        </div>
      </div>
      <div className={styles.metaRow}>
        <div className={styles.meta}>
          <H className={styles.name}>
            <Link href={`/products/${product.slug}`} className={styles.link}>
              {product.name}
            </Link>
          </H>
          <p className={styles.price}>
            {product.price.display}
            {!product.price.approved && <span className="visually-hidden"> (price to be confirmed)</span>}
          </p>
          {note && <p className={styles.note}>{note}</p>}
        </div>
        <WishlistButton productId={product.id} name={product.name} className={styles.wish} />
      </div>
    </article>
  );
}
