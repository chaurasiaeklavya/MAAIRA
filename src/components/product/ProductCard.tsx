'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useExperience } from '../ExperienceProvider';
import { useTilt } from '../motion/useTilt';
import { Stage } from '../showcase/Stage';
import { ProductFrame } from './ProductFrame';
import styles from './ProductCard.module.css';
import { resolveImages, type Product } from '@/data/products';
import { cursorLabel } from '@/lib/cursor-store';

export type CardSize = 'hero' | 'large' | 'medium' | 'compact';

/**
 * A piece presented on its material stage. The whole card is one link to the
 * product page (stretched link on the title); "Quick view" is a separate
 * control when provided. The framed photo carries a view-transition name so
 * it morphs into the product page.
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
  product: Product;
  index: number;
  size?: CardSize;
  priority?: boolean;
  onQuickView?: (slug: string, trigger: HTMLElement) => void;
  as?: 'h2' | 'h3';
  sharedTransition?: boolean;
}) {
  const { reducedMotion } = useExperience();
  const tilt = useTilt({ max: size === 'compact' ? 5 : 7 });
  const images = resolveImages(product);
  const primary = images.find((i) => i.role === 'primary') ?? images[0];
  const href = `/shop/${product.slug}`;
  const view = cursorLabel('View');

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
            Quick view<span className="visually-hidden"> of {product.displayName}</span>
          </button>
        )}
      </motion.div>

      <div className={styles.caption}>
        <p className={styles.number}>{product.number}</p>
        <Heading id={`card-${product.slug}`} className={`${styles.name} display`}>
          <Link href={href} className={styles.stretched} transitionTypes={['nav-forward']} onClick={() => tilt.reset(true)}>
            {product.displayName}
          </Link>
        </Heading>
        <p className={styles.tagline}>{product.tagline}</p>
        <p className={styles.price}>
          <span className="visually-hidden">Price: </span>
          {product.price.display}
          {product.price.status === 'placeholder' && <span className={styles.priceNote}> · to be confirmed</span>}
        </p>
      </div>
    </article>
  );
}
