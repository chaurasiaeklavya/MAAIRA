'use client';

import { AnimatePresence, motion, useIsPresent } from 'motion/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useExperience } from '../ExperienceProvider';
import { GalleryControls, GalleryPhoto } from '../gallery/Gallery';
import { useGallery } from '../gallery/useGallery';
import { Stage } from '../showcase/Stage';
import styles from './PieceDetail.module.css';
import { brand } from '@/data/brand';
import { products, resolveImages, type Product } from '@/data/products';
import { cursorLabel } from '@/lib/cursor-store';

interface Props {
  product: Product;
  /** Slug whose card frame morphs into this view (null after in-dialog navigation). */
  layoutSlug: string | null;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_IO = [0.65, 0, 0.35, 1] as const;

/** Quick view: a full-screen dialog over the current page. */
export function PieceDetail({ product, layoutSlug, onClose, onNavigate }: Props) {
  const { reducedMotion, lockScroll } = useExperience();
  const isPresent = useIsPresent();
  const images = resolveImages(product);
  const gallery = useGallery(images.length);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const productIndex = products.findIndex((p) => p.slug === product.slug);
  const prevProduct = products[(productIndex - 1 + products.length) % products.length];
  const nextProduct = products[(productIndex + 1) % products.length];
  const n = String(productIndex + 1).padStart(2, '0');
  const total = String(products.length).padStart(2, '0');

  // Reset the gallery when moving to another piece (adjusting state during render).
  const [shownSlug, setShownSlug] = useState(product.slug);
  if (shownSlug !== product.slug) {
    setShownSlug(product.slug);
    gallery.reset();
  }

  // Scroll lock and initial focus.
  useEffect(() => {
    lockScroll(true);
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 60);
    return () => {
      window.clearTimeout(t);
      lockScroll(false);
    };
  }, [lockScroll]);

  // Escape, arrow keys and focus trap.
  const { go } = gallery;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        ).filter((el) => el.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  const sharedFrame = layoutSlug === product.slug;
  const href = `/shop/${product.slug}`;

  return (
    <motion.div
      ref={dialogRef}
      className={styles.dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="piece-title"
      aria-describedby="piece-description"
      data-lenis-prevent
      data-closing={!isPresent || undefined}
      inert={!isPresent || undefined}
    >
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.1 } }}
        transition={{ duration: 0.6 }}
        aria-hidden="true"
      />

      <div className={styles.layout}>
        <motion.section
          className={styles.gallery}
          aria-label={`${product.displayName} — images`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className={styles.stageLayer}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: EASE }}
          >
            <Stage preset={product.stage} className={styles.stage} />
          </motion.div>

          <div className={styles.frameArea}>
            <motion.div
              key={sharedFrame ? 'shared' : product.slug}
              layoutId={sharedFrame ? `frame-${product.slug}` : undefined}
              className={styles.frame}
              initial={sharedFrame ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: EASE_IO }}
            >
              <GalleryPhoto
                images={images}
                gallery={gallery}
                sizes="(max-width: 900px) 92vw, 46vw"
                priority
                idPrefix={product.slug}
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
          >
            <GalleryControls images={images} gallery={gallery} />
          </motion.div>
        </motion.section>

        <motion.aside
          className={`${styles.info} leather`}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 60, transition: { duration: 0.42, ease: EASE_IO } }}
          transition={{ duration: 0.9, delay: 0.12, ease: EASE }}
        >
          <button ref={closeRef} type="button" className={styles.close} onClick={onClose} {...cursorLabel('Close')}>
            <span>Close quick view</span>
            <span className={styles.closeIcon} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={product.slug}
              className={styles.infoBody}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <p className="eyebrow">
                Piece {n} <span className={styles.of}>of {total}</span>
              </p>
              <h2 id="piece-title" className={`${styles.title} display`}>
                {product.displayName}
              </h2>
              <p className={`${styles.tagline} display`}>
                <em>{product.tagline}</em>
              </p>
              <p id="piece-description" className={styles.description}>
                {product.description}
              </p>

              <dl className={styles.details}>
                <div>
                  <dt>Reference</dt>
                  <dd>{product.number}</dd>
                </div>
                {product.colour && (
                  <div>
                    <dt>Colour</dt>
                    <dd>{product.colour}</dd>
                  </div>
                )}
                <div>
                  <dt>Price</dt>
                  <dd className={styles.price}>
                    {product.price.display}
                    {product.price.status === 'placeholder' && <span className={styles.priceNote}>To be confirmed</span>}
                  </dd>
                </div>
              </dl>

              <div className={styles.actions}>
                <Link className={styles.primary} href={href} transitionTypes={['nav-forward']}>
                  <span>View full details</span>
                </Link>
                <Link className={styles.secondary} href={`${href}#enquire`}>
                  Enquire about this piece
                </Link>
                <a className={styles.tertiary} href={brand.contact.phoneHref}>
                  or call {brand.contact.phoneDisplay}
                </a>
              </div>
            </motion.div>
          </AnimatePresence>

          <nav className={styles.pieceNav} aria-label="Other pieces">
            <button type="button" onClick={() => onNavigate(prevProduct.slug)}>
              <span aria-hidden="true">←</span> {prevProduct.displayName}
            </button>
            <button type="button" onClick={() => onNavigate(nextProduct.slug)}>
              {nextProduct.displayName} <span aria-hidden="true">→</span>
            </button>
          </nav>
        </motion.aside>
      </div>
    </motion.div>
  );
}
