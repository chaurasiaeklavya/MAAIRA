'use client';

import { motion, useInView, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { useRef } from 'react';
import { useExperience } from './ExperienceProvider';
import styles from './House.module.css';
import { brand } from '@/data/brand';

const EASE = [0.22, 1, 0.36, 1] as const;

const STATEMENT = ['An object of', 'quiet confidence —', 'designed to be carried,', 'made to be remembered.'];

/** Brand introduction with the client-supplied credentials. `teaser` adds a link to the full House page. */
export function House({ teaser = false }: { teaser?: boolean }) {
  const { reducedMotion } = useExperience();
  const statementRef = useRef<HTMLHeadingElement>(null);
  const statementInView = useInView(statementRef, { once: true, margin: '0px 0px -10% 0px' });
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
          <h2 ref={statementRef} id="house-title" className={`${styles.statement} display`}>
            {STATEMENT.map((line, i) => (
              <span key={line} className={styles.lineMask}>
                <motion.span
                  className={styles.line}
                  initial={reducedMotion ? { opacity: 0 } : { y: '105%' }}
                  animate={statementInView ? { opacity: 1, y: '0%' } : reducedMotion ? { opacity: 0 } : { y: '105%' }}
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
          <p>Explore the collection online, or ask the house about any piece — by message, by phone or with a call back.</p>
          {teaser && (
            <Link href="/about" className={styles.more} transitionTypes={['nav-forward']}>
              Discover the house
              <svg viewBox="0 0 32 12" width="28" height="12" aria-hidden="true">
                <path d="M0 6h30m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </Link>
          )}
        </motion.div>

        <ul className={styles.credentials} aria-label="Recognition">
          {brand.credentials.map((c, i) => (
            <motion.li
              key={c.id}
              className={`${styles.tag} leather stitched`}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 40, rotateX: 18 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
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
