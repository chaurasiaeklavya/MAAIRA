'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { PieceDetail } from '../detail/PieceDetail';
import { useQuickView } from '../detail/useQuickView';
import { useExperience } from '../ExperienceProvider';
import { ProductCard, type CardSize } from '../product/ProductCard';
import styles from './ShopView.module.css';
import type { CatalogueProduct } from '@/lib/catalogue/types';

type View = 'editorial' | 'grid';
const EDITORIAL_SIZES: CardSize[] = ['hero', 'compact', 'compact'];

/**
 * The pieces in an editorial or uniform grid view. Each card links to its
 * product page (with a shared-image morph) and offers a quick view; filters
 * and sort (server-rendered, passed in as `controls`) sit beside the toggle.
 */
export function ShopGrid({
  items,
  countLabel,
  controls,
  chips,
}: {
  items: CatalogueProduct[];
  countLabel: ReactNode;
  controls?: ReactNode;
  chips?: ReactNode;
}) {
  const { play } = useExperience();
  const [view, setView] = useState<View>('editorial');
  const quick = useQuickView(items);

  const choose = (v: View) => {
    if (v === view) return;
    play('tick');
    setView(v);
  };

  return (
    <>
      <div className={`container ${styles.toolbar}`}>
        <p className={styles.count} aria-live="polite">
          {countLabel}
        </p>
        <div className={styles.controls}>
          {controls}
          <div className={styles.views} role="group" aria-label="Layout">
            {(['editorial', 'grid'] as const).map((v) => (
              <button key={v} type="button" className={styles.viewButton} aria-pressed={view === v} onClick={() => choose(v)}>
                <span className={styles.viewIcon} data-icon={v} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                {v === 'editorial' ? 'Editorial' : 'Grid'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {chips && <div className="container">{chips}</div>}

      {/* Crossfade between layouts (cards are remounted, so no shared-element names collide). */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          className={`container ${styles.grid}`}
          data-view={view}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
        >
          {items.map((p, i) => (
            <div key={p.id} className={styles.slot} data-slot={i % 3} data-mirror={Math.floor(i / 3) % 2 === 1 || undefined}>
              <ProductCard
                product={p}
                index={i}
                size={view === 'editorial' ? (EDITORIAL_SIZES[i % 3] ?? 'compact') : 'compact'}
                priority={i === 0}
                as="h2"
                onQuickView={(slug, trigger) => quick.open(slug, trigger)}
              />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {quick.active && (
          <PieceDetail
            key="quick-view"
            product={quick.active}
            products={items}
            layoutSlug={quick.layoutSlug}
            onClose={quick.close}
            onNavigate={quick.navigate}
          />
        )}
      </AnimatePresence>
    </>
  );
}
