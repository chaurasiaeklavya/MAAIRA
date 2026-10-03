'use client';

import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { useRef } from 'react';
import { CloudImage } from '../CloudImage';
import { useExperience } from '../ExperienceProvider';
import { Stage } from './Stage';
import styles from './PieceCard.module.css';
import { cursorLabel } from '@/lib/cursor-store';
import { resolveImages, type Product } from '@/data/products';

interface Props {
  product: Product;
  index: number;
  total: number;
  active: boolean;
  onOpen: (slug: string, trigger: HTMLElement | null) => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function PieceCard({ product, index, total, active, onOpen }: Props) {
  const { reducedMotion } = useExperience();
  const ref = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const images = resolveImages(product);
  const primary = images.find((i) => i.role === 'primary') ?? images[0];
  const flipped = index % 2 === 1;

  // Scroll parallax: the framed photograph drifts against its backdrop.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const frameY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const backdropY = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  // Pointer tilt + glare (fine pointers only).
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 120, damping: 16 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-9, 9]), { stiffness: 120, damping: 16 });
  const glareX = useTransform(mx, (v) => `${v * 100}%`);
  const glareY = useTransform(my, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(60% 50% at ${glareX} ${glareY}, rgb(255 255 255 / 0.22), transparent 70%)`;
  const shadowX = useTransform(mx, [0, 1], [18, -18]);
  const shadowY = useTransform(my, [0, 1], [34, 14]);
  const shadow = useMotionTemplate`${shadowX}px ${shadowY}px 60px -18px rgb(var(--shadow-rgb) / 0.55)`;

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || reducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const resetTilt = (instant = false) => {
    if (instant) {
      mx.jump(0.5);
      my.jump(0.5);
      rotateX.jump(0);
      rotateY.jump(0);
    } else {
      mx.set(0.5);
      my.set(0.5);
    }
  };

  const open = () => {
    resetTilt(true);
    onOpen(product.slug, buttonRef.current);
  };

  const n = String(index + 1).padStart(2, '0');
  const viewCursor = cursorLabel('View');

  return (
    <article ref={ref} className={styles.card} data-flipped={flipped || undefined} aria-labelledby={`${product.slug}-name`}>
      <motion.div
        className={styles.stageWrap}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(14% 10% 14% 10%)' }}
        whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
        viewport={{ once: true, margin: '-12% 0px' }}
        transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
      >
        {/* Mouse convenience; the "View the piece" button is the keyboard/screen-reader control. */}
        <div
          className={styles.stageHit}
          onClick={open}
          onPointerMove={onMove}
          onPointerEnter={viewCursor.onPointerEnter}
          onPointerLeave={() => {
            resetTilt();
            viewCursor.onPointerLeave();
          }}
        >
          <motion.div className={styles.backdropLayer} style={reducedMotion ? undefined : { y: backdropY }}>
            <Stage preset={product.stage} className={styles.stage} />
          </motion.div>

          <motion.div className={styles.frameParallax} style={reducedMotion ? undefined : { y: frameY }}>
            <motion.div className={styles.tilt} style={reducedMotion ? undefined : { rotateX, rotateY }}>
              {!active ? (
                <motion.div
                  layoutId={`frame-${product.slug}`}
                  className={styles.frame}
                  style={{ boxShadow: reducedMotion ? undefined : shadow }}
                  transition={{ duration: 0.85, ease: [0.65, 0, 0.35, 1] }}
                >
                  <div className={styles.photo}>
                    {primary && (
                      <motion.div
                        className={styles.photoInner}
                        initial={reducedMotion ? false : { scale: 1.18 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true, margin: '-12% 0px' }}
                        transition={{ duration: 1.8, ease: EASE }}
                      >
                        <CloudImage
                          asset={primary.asset}
                          alt={primary.alt}
                          sizes="(max-width: 900px) 80vw, 34vw"
                          width={960}
                          maxWidth={1600}
                        />
                      </motion.div>
                    )}
                  </div>
                  {!reducedMotion && <motion.span className={styles.glare} style={{ background: glare }} aria-hidden="true" />}
                </motion.div>
              ) : (
                <div className={`${styles.frame} ${styles.framePlaceholder}`} aria-hidden="true" />
              )}
            </motion.div>
          </motion.div>

          <span className={styles.viewHint} aria-hidden="true">
            View
          </span>
        </div>
      </motion.div>

      <div className={styles.copy}>
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          Piece {n} <span className={styles.of}>of {String(total).padStart(2, '0')}</span>
        </motion.p>

        <motion.h3
          id={`${product.slug}-name`}
          className={`${styles.name} display`}
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 1.1, delay: 0.08, ease: EASE }}
        >
          {product.displayName}
        </motion.h3>

        <motion.p
          className={`${styles.tagline} display`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 1.1, delay: 0.16, ease: EASE }}
        >
          <em>{product.tagline}</em>
        </motion.p>

        <motion.p
          className={styles.description}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 1.1, delay: 0.24, ease: EASE }}
        >
          {product.description}
        </motion.p>

        <motion.div
          className={styles.meta}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 1, delay: 0.32, ease: EASE }}
        >
          <p className={styles.price}>
            <span className="visually-hidden">Price: </span>
            {product.price.display}
            {product.price.status === 'placeholder' && <span className={styles.priceNote}>Price to be confirmed</span>}
          </p>
          <button ref={buttonRef} type="button" className={styles.view} onClick={open} aria-haspopup="dialog">
            <span>View the piece</span>
            <svg viewBox="0 0 32 12" width="32" height="12" aria-hidden="true">
              <path d="M0 6h30m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </motion.div>
      </div>
    </article>
  );
}
