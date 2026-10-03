'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useExperience } from './ExperienceProvider';
import styles from './House.module.css';
import { brand } from '@/data/brand';

const EASE = [0.22, 1, 0.36, 1] as const;

const STATEMENT = ['An object of', 'quiet confidence —', 'designed to be carried,', 'made to be remembered.'];

export function House() {
  const { reducedMotion } = useExperience();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const watermarkY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section id="house" ref={ref} className={styles.section} aria-labelledby="house-title">
      <motion.span
        className={`logo-mask logo-mask--monogram ${styles.watermark}`}
        style={reducedMotion ? undefined : { y: watermarkY }}
        aria-hidden="true"
      />

      <div className={`container ${styles.grid}`}>
        <div className={styles.lead}>
          <p className="eyebrow">The House</p>
          <h2 id="house-title" className={`${styles.statement} display`}>
            {STATEMENT.map((line, i) => (
              <span key={line} className={styles.lineMask}>
                <motion.span
                  className={styles.line}
                  initial={reducedMotion ? { opacity: 0 } : { y: '105%' }}
                  whileInView={reducedMotion ? { opacity: 1 } : { y: '0%' }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 1.2, delay: i * 0.09, ease: EASE }}
                >
                  {i === 1 ? (
                    <>
                      <em>quiet confidence</em> —
                    </>
                  ) : (
                    line
                  )}
                </motion.span>
              </span>
            ))}
          </h2>
        </div>

        <motion.div
          className={styles.body}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 1.2, delay: 0.25, ease: EASE }}
        >
          <p>
            <strong>{brand.name}</strong> is a {brand.descriptor.toLowerCase()}, operated by {brand.businessName}.
          </p>
          <p>
            This edition offers a first look at selected pieces from the house — an invitation to the collection that
            follows.
          </p>
        </motion.div>

        <ul className={styles.credentials} aria-label="Recognition">
          {brand.credentials.map((c, i) => (
            <motion.li
              key={c.id}
              className={`${styles.tag} leather stitched`}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 40, rotateX: 18 }}
              whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 1.2, delay: 0.15 + i * 0.12, ease: EASE }}
            >
              <span className={`logo-mask logo-mask--monogram ${styles.deboss}`} aria-hidden="true" />
              {c.id === 'award' ? (
                <p className={styles.tagText}>
                  <span className={styles.tagLead}>{c.lead}</span>
                  <span className={`${styles.tagValue} display`}>{c.value}</span>
                </p>
              ) : (
                <p className={styles.tagText}>
                  <span className={styles.tagLead}>{c.lead}</span>
                  <span className={`${styles.tagFigure} display`}>{c.value}</span>
                  <span className={styles.tagUnit}>{'unit' in c ? c.unit : ''}</span>
                </p>
              )}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
