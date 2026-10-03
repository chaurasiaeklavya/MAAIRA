'use client';

import { AnimatePresence, motion, useIsPresent, type PanInfo } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CloudImage } from '../CloudImage';
import { useExperience } from '../ExperienceProvider';
import { Stage } from '../showcase/Stage';
import styles from './PieceDetail.module.css';
import { brand, enquiryMailto } from '@/data/brand';
import { products, resolveImages, type Product } from '@/data/products';
import { cursorLabel } from '@/lib/cursor-store';
import { useMediaQuery } from '@/lib/useMediaQuery';

interface Props {
  product: Product;
  /** Slug whose card frame morphs into this view (null after in-dialog navigation). */
  layoutSlug: string | null;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_IO = [0.65, 0, 0.35, 1] as const;

export function PieceDetail({ product, layoutSlug, onClose, onNavigate }: Props) {
  const { reducedMotion, lockScroll, play } = useExperience();
  const isPresent = useIsPresent();
  // Hover magnifier only where a precise hovering pointer exists; touch gets swipe.
  const canZoom = useMediaQuery('(hover: hover) and (pointer: fine)') && !reducedMotion;
  const images = resolveImages(product);
  const [[index, direction], setView] = useState<[number, number]>([0, 0]);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const productIndex = products.findIndex((p) => p.slug === product.slug);
  const prevProduct = products[(productIndex - 1 + products.length) % products.length];
  const nextProduct = products[(productIndex + 1) % products.length];
  const n = String(productIndex + 1).padStart(2, '0');
  const total = String(products.length).padStart(2, '0');
  const current = images[index] ?? images[0];

  const go = useCallback(
    (delta: number) => {
      if (images.length < 2) return;
      setView(([i]) => [(i + delta + images.length) % images.length, delta]);
      setZoom(null);
      play('tick');
    },
    [images.length, play],
  );

  // Reset the gallery when moving to another piece (adjusting state during render).
  const [shownSlug, setShownSlug] = useState(product.slug);
  if (shownSlug !== product.slug) {
    setShownSlug(product.slug);
    setView([0, 0]);
    setZoom(null);
  }

  // Scroll lock, initial focus, focus trap, keyboard controls.
  useEffect(() => {
    lockScroll(true);
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 60);
    return () => {
      window.clearTimeout(t);
      lockScroll(false);
    };
  }, [lockScroll]);

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
          dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
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

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
  };

  const onZoomMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canZoom || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?piece=${product.slug}` : '';
  const mailto = enquiryMailto(
    `Enquiry — ${product.displayName} | ${brand.name}`,
    `Hello ${brand.name},\n\nI would like to know more about ${product.displayName} (reference ${product.id}).\n\n${pageUrl}\n\nThank you.`,
  );

  const slideVariants = {
    enter: (dir: number) => (reducedMotion ? { opacity: 0 } : { opacity: 0, x: dir >= 0 ? 60 : -60, scale: 1.02 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir: number) => (reducedMotion ? { opacity: 0 } : { opacity: 0, x: dir >= 0 ? -60 : 60, scale: 0.99 }),
  };

  const sharedFrame = layoutSlug === product.slug;
  const dragCursor = cursorLabel('Drag');

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
              {/* Hover magnifier and swipe are pointer enhancements; arrows and thumbnails are the accessible controls. */}
              <div
                className={styles.photo}
                onPointerMove={onZoomMove}
                onPointerEnter={images.length > 1 ? dragCursor.onPointerEnter : undefined}
                onPointerLeave={() => {
                  setZoom(null);
                  dragCursor.onPointerLeave();
                }}
              >
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  {current && (
                    <motion.div
                      key={`${product.slug}-${index}`}
                      className={styles.slide}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.7, ease: EASE }}
                      drag={images.length > 1 && !canZoom ? 'x' : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.18}
                      onDragEnd={onDragEnd}
                    >
                      <CloudImage
                        asset={current.asset}
                        alt={current.alt}
                        sizes="(max-width: 900px) 92vw, 46vw"
                        width={1280}
                        maxWidth={2000}
                        priority
                        draggable={false}
                        className={styles.photoImg}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {zoom && current && canZoom && (
                  <div className={styles.zoom} aria-hidden="true">
                    <div
                      className={styles.zoomInner}
                      style={{ transformOrigin: `${zoom.x}% ${zoom.y}%` }}
                    >
                      <CloudImage
                        asset={current.asset}
                        alt=""
                        sizes="100vw"
                        width={2000}
                        maxWidth={2000}
                        draggable={false}
                        className={styles.photoImg}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {images.length > 1 && (
            <motion.div
              className={styles.controls}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
            >
              <button type="button" className={styles.arrow} onClick={() => go(-1)} aria-label="Previous image">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.1" />
                </svg>
              </button>

              <div className={styles.thumbs} ref={thumbsRef} role="group" aria-label="Choose a view">
                {images.map((img, i) => (
                  <button
                    key={img.assetId}
                    type="button"
                    className={styles.thumb}
                    aria-label={`Show ${img.alt}`}
                    aria-current={i === index ? 'true' : undefined}
                    onClick={() => {
                      setView(([prev]) => [i, i > prev ? 1 : -1]);
                      setZoom(null);
                    }}
                  >
                    <CloudImage asset={img.asset} alt="" sizes="72px" width={240} maxWidth={480} />
                  </button>
                ))}
              </div>

              <p className={styles.counter} aria-live="polite">
                <span>{String(index + 1).padStart(2, '0')}</span> / {String(images.length).padStart(2, '0')}
              </p>

              <button type="button" className={styles.arrow} onClick={() => go(1)} aria-label="Next image">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.1" />
                </svg>
              </button>
            </motion.div>
          )}
        </motion.section>

        <motion.aside
          className={`${styles.info} leather`}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 60, transition: { duration: 0.42, ease: EASE_IO } }}
          transition={{ duration: 0.9, delay: 0.12, ease: EASE }}
        >
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            {...cursorLabel('Close')}
          >
            <span>Back to the pieces</span>
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
                <a className={styles.primary} href={mailto}>
                  <span>Enquire about this piece</span>
                </a>
                <a className={styles.secondary} href={brand.contact.phoneHref}>
                  Call {brand.contact.phoneDisplay}
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
