'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import { PieceDetail } from '../detail/PieceDetail';
import { useQuickView } from '../detail/useQuickView';
import { useExperience } from '../ExperienceProvider';
import { ProductCard, type CardSize } from '../product/ProductCard';
import styles from './ShopView.module.css';
import { brand } from '@/data/brand';
import { products } from '@/data/products';

type View = 'editorial' | 'grid';
const EDITORIAL_SIZES: CardSize[] = ['hero', 'compact', 'compact'];

/**
 * The shop: the sample pieces in an editorial or uniform grid view, each card
 * linking to its product page (with a shared-image morph) and offering a
 * quick view. Filters and sorting are deliberately absent: there are three
 * pieces and no verified attributes to filter by yet.
 */
export function ShopView() {
  const { play } = useExperience();
  const [view, setView] = useState<View>('editorial');
  const quick = useQuickView();

  const choose = (v: View) => {
    if (v === view) return;
    play('tick');
    setView(v);
  };

  return (
    <>
      <div className={`container ${styles.toolbar}`}>
        <p className={styles.count}>
          {products.length} pieces <span className={styles.countNote}>· preview selection</span>
        </p>
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
          {products.map((p, i) => (
            <div key={p.id} className={styles.slot} data-slot={i}>
              <ProductCard
                product={p}
                index={i}
                size={view === 'editorial' ? EDITORIAL_SIZES[i] ?? 'compact' : 'compact'}
                priority={i === 0}
                as="h2"
                onQuickView={(slug, trigger) => quick.open(slug, trigger)}
              />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <section className={`container ${styles.forthcoming}`} aria-labelledby="forthcoming-title">
        <div className={`${styles.forthcomingPanel} leather stitched`}>
          <span className={`logo-mask logo-mask--monogram ${styles.deboss}`} aria-hidden="true" />
          <div>
            <p className="eyebrow">The collection</p>
            <h2 id="forthcoming-title" className={`${styles.forthcomingTitle} display`}>
              The full collection will be presented <em>here.</em>
            </h2>
            <p className={styles.forthcomingText}>
              This preview shows a selection of pieces. For anything you don’t yet see, the house is happy to help.
            </p>
            <div className={styles.forthcomingActions}>
              <Link href="/contact" className={styles.forthcomingLink} transitionTypes={['nav-forward']}>
                Ask the house
              </Link>
              <a href={brand.contact.instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.forthcomingLink}>
                Follow on Instagram<span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {quick.active && (
          <PieceDetail
            key="quick-view"
            product={quick.active}
            layoutSlug={quick.layoutSlug}
            onClose={quick.close}
            onNavigate={quick.navigate}
          />
        )}
      </AnimatePresence>
    </>
  );
}
