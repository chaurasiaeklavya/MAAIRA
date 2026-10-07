'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useExperience } from '../ExperienceProvider';
import { WishlistButton } from '../commerce/WishlistButton';
import { useTilt } from '../motion/useTilt';
import { Stage } from '../showcase/Stage';
import { ProductFrame } from './ProductFrame';
import styles from './ProductCard.module.css';
import { pieceNumber } from '@/lib/catalogue/present';
import { primaryImage, type CatalogueProduct } from '@/lib/catalogue/types';
import { cursorLabel } from '@/lib/cursor-store';

export type CardSize = 'hero' | 'large' | 'medium' | 'compact';

const AVAILABILITY_NOTE: Partial<Record<CatalogueProduct['availability'], string>> = {
  made_to_order: 'Made to order',
  out_of_stock: 'Currently unavailable',
};

/**
 * A piece presented on its material stage. The whole card is one link to the
 * product page (stretched link on the title); "Quick view" and the wishlist
 * mark are separate controls. The framed photo carries a view-transition name
 * so it morphs into the product page.
 */
export function ProductCard({
  product,
  index,
  size = 'medium',
  priority,
  onQuickView,
  as: Heading = 'h3',
  sharedTransition = true,
}: {
  product: CatalogueProduct;
  index: number;
  size?: CardSize;
  priority?: boolean;
  onQuickView?: (slug: string, trigger: HTMLElement) => void;
  as?: 'h2' | 'h3';
  sharedTransition?: boolean;
}) {
  const { reducedMotion } = useExperience();
  const tilt = useTilt({ max: size === 'compact' ? 5 : 7 });
  const primary = primaryImage(product) ?? undefined;
  const href = `/products/${product.slug}`;
  const view = cursorLabel('View');
  const number = pieceNumber(product);
  const note = AVAILABILITY_NOTE[product.availability];

  return (
    <article
      className={`${styles.card} tilt-host`}
      data-size={size}
      aria-labelledby={`card-${product.slug}`}
      onPointerMove={tilt.onPointerMove}
      onPointerEnter={view.onPointerEnter}
      onPointerLeave={() => {
        tilt.onPointerLeave();
        view.onPointerLeave();
      }}
    >
      <motion.div
        className={styles.stageBox}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(12% 8% 12% 8%)' }}
        whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 1.3, delay: (index % 3) * 0.08, ease: [0.65, 0, 0.35, 1] }}
      >
        <Stage preset={product.stage} className={styles.stage} />
        <div className={styles.framePos}>
          <ProductFrame
            image={primary}
            sizes={size === 'hero' ? '(max-width: 900px) 70vw, 30vw' : '(max-width: 900px) 60vw, 20vw'}
            shareName={sharedTransition ? `piece-${product.slug}` : undefined}
            priority={priority}
            tiltStyle={tilt.style}
            glare={tilt.enabled ? tilt.glare : undefined}
            shadow={tilt.enabled ? tilt.shadow : undefined}
          />
        </div>
        <WishlistButton productId={product.id} name={product.name} className={styles.wish} />
        {onQuickView && (
          <button
            type="button"
            className={styles.quick}
            onClick={(e) => {
              tilt.reset(true);
              onQuickView(product.slug, e.currentTarget);
            }}
            aria-haspopup="dialog"
          >
            Quick view<span className="visually-hidden"> of {product.name}</span>
          </button>
        )}
      </motion.div>

      <div className={styles.caption}>
        <p className={styles.number}>{number}</p>
        <Heading id={`card-${product.slug}`} className={`${styles.name} display`}>
          <Link href={href} className={styles.stretched} transitionTypes={['nav-forward']} onClick={() => tilt.reset(true)}>
            {product.name}
          </Link>
        </Heading>
        {product.summary && <p className={styles.tagline}>{product.summary}</p>}
        <p className={styles.price}>
          <span className="visually-hidden">Price: </span>
          {product.price.display}
          {!product.price.approved && <span className={styles.priceNote}> · to be confirmed</span>}
        </p>
        {note && <p className={styles.availability}>{note}</p>}
      </div>
    </article>
  );
}
