'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { useRef } from 'react';
import { useExperience } from '../ExperienceProvider';
import { RevealText } from '../motion/RevealText';
import { LeatherCanvas } from './LeatherCanvas';
import styles from './Hero.module.css';
import { brand } from '@/data/brand';
import { products } from '@/data/products';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const { theme, reducedMotion } = useExperience();
  const hostRef = useRef<HTMLElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);

  const { scrollYProgress } = useScroll({ target: hostRef, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const surfaceScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const rise = (delay: number) =>
    reducedMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1.1, delay, ease: EASE },
        };

  return (
    <section ref={hostRef} className={styles.hero} aria-labelledby="hero-title">
      <motion.div className={`${styles.surface} leather`} style={{ scale: reducedMotion ? 1 : surfaceScale }}>
        <LeatherCanvas
          theme={theme}
          reducedMotion={reducedMotion}
          hostRef={hostRef}
          anchorRef={anchorRef}
          className={styles.gl}
          particlesClassName={styles.dust}
        />
        <div className={styles.vignette} aria-hidden="true" />
      </motion.div>

      <div className={styles.content}>
        <div className={styles.mark}>
          {/* The WebGL layer stamps the monogram into the leather at this box. */}
          <div className={styles.monogramSlot}>
            <span ref={anchorRef} className={styles.anchor} aria-hidden="true" />
            {/* DOM fallback: shown until (or unless) the stamped mark is rendered. */}
            <motion.div
              className={styles.monogramWrap}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
              animate={
                reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, clipPath: 'inset(0% 0 0 0)', transitionEnd: { clipPath: 'none' } }
              }
              transition={{ duration: 1.4, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
            >
              <span className={styles.monogramShadow}>
                <span className={`logo-mask logo-mask--monogram ${styles.monogram}`} aria-hidden="true" />
                <span className={`${styles.sheen} ${styles.monogramSheen}`} aria-hidden="true" />
              </span>
            </motion.div>
          </div>

          <motion.div style={reducedMotion ? undefined : { y: contentY, opacity: contentOpacity }}>
            <h1 id="hero-title" className={styles.title}>
              <span className="visually-hidden">{brand.name}</span>
              <motion.span
                className={styles.wordmarkWrap}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scaleX: 1.06, filter: 'blur(8px)' }}
                animate={
                  reducedMotion
                    ? { opacity: 1 }
                    : { opacity: 1, scaleX: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }
                }
                transition={{ duration: 1.6, delay: 1.25, ease: EASE }}
                aria-hidden="true"
              >
                <span className={styles.wordmarkShadow}>
                  <span className={`logo-mask logo-mask--wordmark ${styles.wordmark}`} />
                  <span className={`${styles.sheen} ${styles.wordmarkSheen}`} />
                </span>
              </motion.span>
            </h1>
          </motion.div>
        </div>

        <motion.div className={styles.lower} style={reducedMotion ? undefined : { y: contentY, opacity: contentOpacity }}>
          <motion.div className={styles.intro} {...rise(1.7)}>
            <p className={styles.descriptor}>{brand.descriptor}</p>
            <Link href="/shop" className={styles.presenting}>
              <span className={styles.presentingDot} aria-hidden="true" />
              Now presenting · {products.length} pieces from the house
            </Link>
          </motion.div>

          <div className={styles.pitch}>
            <RevealText as="p" className={`${styles.tagline} display`} trigger="mount" delay={1.8}>
              {'Quiet luxury, *reimagined.*'}
            </RevealText>
            <motion.div className={styles.ctas} {...rise(2.15)}>
              <Link href="/shop" className={styles.cta} transitionTypes={['nav-forward']}>
                <span>Explore the pieces</span>
                <svg viewBox="0 0 32 12" width="28" height="12" aria-hidden="true">
                  <path d="M0 6h30m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              </Link>
              <Link href="/house" className={styles.ctaGhost} transitionTypes={['nav-forward']}>
                The House
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className={styles.scrollCue}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        aria-hidden="true"
      >
        <span>Scroll</span>
        <i />
      </motion.div>
    </section>
  );
}
