'use client';

import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useExperience } from '../ExperienceProvider';
import { LeatherCanvas } from './LeatherCanvas';
import styles from './Hero.module.css';
import { brand } from '@/data/brand';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const { theme, reducedMotion, scrollTo } = useExperience();
  const hostRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: hostRef, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const surfaceScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  // Subtle pointer-responsive depth on the monogram (desktop only).
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 80, damping: 18, mass: 0.6 });
  const sry = useSpring(ry, { stiffness: 80, damping: 18, mass: 0.6 });

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || reducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 10);
    rx.set(-py * 8);
  };

  const reveal = (delay: number, y = 22) =>
    reducedMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 } }
      : {
          initial: { opacity: 0, y, filter: 'blur(6px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          transition: { duration: 1.2, delay, ease: EASE },
        };

  return (
    <section
      id="top"
      ref={hostRef}
      className={styles.hero}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      aria-labelledby="hero-title"
    >
      <motion.div className={`${styles.surface} leather`} style={{ scale: reducedMotion ? 1 : surfaceScale }}>
        <LeatherCanvas
          theme={theme}
          reducedMotion={reducedMotion}
          hostRef={hostRef}
          className={styles.gl}
          particlesClassName={styles.dust}
        />
        <div className={styles.vignette} aria-hidden="true" />
      </motion.div>

      <motion.div className={styles.content} style={reducedMotion ? undefined : { y: contentY, opacity: contentOpacity }}>
        <motion.div className={styles.mark} style={{ rotateX: srx, rotateY: sry }}>
          <motion.div
            className={styles.monogramWrap}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(100% 0 0 0)', y: 24 }}
            animate={
              reducedMotion
                ? { opacity: 1 }
                : { opacity: 1, clipPath: 'inset(0% 0 0 0)', y: 0, transitionEnd: { clipPath: 'none' } }
            }
            transition={{ duration: 1.5, delay: 0.25, ease: [0.65, 0, 0.35, 1] }}
          >
            <span className={styles.monogramShadow}>
              <span className={`logo-mask logo-mask--monogram ${styles.monogram}`} aria-hidden="true" />
              <span className={`${styles.sheen} ${styles.monogramSheen}`} aria-hidden="true" />
            </span>
          </motion.div>

          <h1 id="hero-title" className={styles.title}>
            <span className="visually-hidden">{brand.name}</span>
            <motion.span
              className={styles.wordmarkWrap}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scaleX: 1.08, filter: 'blur(8px)' }}
              animate={
                reducedMotion ? { opacity: 1 } : { opacity: 1, scaleX: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }
              }
              transition={{ duration: 1.6, delay: 0.85, ease: EASE }}
              aria-hidden="true"
            >
              <span className={styles.wordmarkShadow}>
                <span className={`logo-mask logo-mask--wordmark ${styles.wordmark}`} />
                <span className={`${styles.sheen} ${styles.wordmarkSheen}`} />
              </span>
            </motion.span>
          </h1>
        </motion.div>

        <div className={styles.lower}>
          <motion.p className={styles.descriptor} {...reveal(1.35)}>
            {brand.descriptor}
          </motion.p>

          <motion.div className={styles.pitch} {...reveal(1.5)}>
            <p className={`${styles.tagline} display`}>
              Quiet luxury, <em>reimagined.</em>
            </p>
            <a
              href="#pieces"
              className={styles.cta}
              onClick={(e) => {
                e.preventDefault();
                scrollTo('#pieces');
              }}
            >
              <span>Discover the pieces</span>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M12 4v16m0 0-6-6m6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.1" />
              </svg>
            </a>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className={styles.scrollCue}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        aria-hidden="true"
      >
        <span>Scroll</span>
        <i />
      </motion.div>
    </section>
  );
}
