'use client';

import { motion } from 'motion/react';
import { useExperience } from '../ExperienceProvider';
import styles from './IdentityStudy.module.css';
import { brand } from '@/data/brand';

/** The supplied logo shown in its two material treatments — the house's mark, as given. */
export function IdentityStudy() {
  const { reducedMotion } = useExperience();
  const reveal = (delay: number) => ({
    initial: reducedMotion ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
    whileInView: reducedMotion ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(0 0 0% 0)' },
    viewport: { once: true, margin: '-15% 0px' },
    transition: { duration: 1.3, delay, ease: [0.65, 0, 0.35, 1] as const },
  });

  return (
    <section className={styles.section} aria-labelledby="identity-title">
      <div className="container">
        <header className={styles.head}>
          <p className="eyebrow">The identity</p>
          <h2 id="identity-title" className={`${styles.title} display`}>
            One mark, <em>two materials</em>
          </h2>
          <p className={styles.lede}>
            The {brand.logoLockup} lockup — monogram above wordmark — set in silver on espresso leather, and in espresso
            on ivory.
          </p>
        </header>
        <div className={styles.pair}>
          <motion.figure className={`${styles.panel} ${styles.dark} leather`} {...reveal(0)}>
            <span className={`logo-mask logo-mask--lockup ${styles.lockup} ${styles.silver}`} role="img" aria-label="MAAIRA LUXURY logo in silver on espresso leather" />
            <figcaption>Silver on espresso</figcaption>
          </motion.figure>
          <motion.figure className={`${styles.panel} ${styles.light} leather`} {...reveal(0.12)}>
            <span className={`logo-mask logo-mask--lockup ${styles.lockup} ${styles.espresso}`} role="img" aria-label="MAAIRA LUXURY logo in espresso on ivory" />
            <figcaption>Espresso on ivory</figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
