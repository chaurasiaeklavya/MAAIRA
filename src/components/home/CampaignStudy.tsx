'use client';

import { motion, useMotionTemplate, useScroll, useTransform, type MotionValue } from 'motion/react';
import Link from 'next/link';
import { useRef } from 'react';
import { CloudImage } from '../CloudImage';
import { useExperience } from '../ExperienceProvider';
import styles from './CampaignStudy.module.css';
import { products, resolveImages, type ResolvedImage } from '@/data/products';
import { windowRange } from '@/lib/ranges';

const CHAPTERS = ['Seen first in the light.', 'Then turned, and turned again.', 'Every view, ready for a closer look.'];

/**
 * Scroll-driven study of one piece: as the visitor scrolls, the photographed
 * views of the same bag succeed one another under a travelling light. Only
 * real photographs are used; nothing is generated or retouched.
 */
export function CampaignStudy() {
  const { reducedMotion } = useExperience();
  const product = [...products].sort((a, b) => b.images.length - a.images.length)[0];
  const images = resolveImages(product);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const lightX = useTransform(scrollYProgress, [0, 1], [18, 82]);
  const light = useMotionTemplate`radial-gradient(55% 70% at ${lightX}% 30%, var(--study-light), transparent 70%)`;
  const scale = useTransform(scrollYProgress, [0, 0.3, 1], [0.86, 1, 1]);
  const rotateY = useTransform(scrollYProgress, [0, 0.3], [-10, 0]);
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (reducedMotion) {
    return (
      <section ref={ref} className={styles.staticSection} aria-labelledby="study-title">
        <div className="container">
          <p className="eyebrow">Study {product.number}</p>
          <h2 id="study-title" className={`${styles.title} display`}>
            {product.displayName}, <em>in every view</em>
          </h2>
          <div className={styles.staticRow}>
            {images.map((img) => (
              <figure key={img.assetId} className={styles.staticFigure}>
                <div className={styles.mat}>
                  <div className={styles.photo}>
                    <CloudImage asset={img.asset} alt={img.alt} sizes="30vw" width={720} maxWidth={1280} />
                  </div>
                </div>
                <figcaption>{img.alt}</figcaption>
              </figure>
            ))}
          </div>
          <Link href={`/shop/${product.slug}`} className={styles.link}>
            View {product.displayName}
          </Link>
        </div>
      </section>
    );
  }

  const n = images.length;
  return (
    <section ref={ref} className={styles.section} style={{ height: `${100 + n * 70}vh` }} aria-labelledby="study-title">
      <div className={`${styles.sticky} leather`}>
        <motion.div className={styles.light} style={{ background: light }} aria-hidden="true" />
        <div className={`container ${styles.layout}`}>
          <div className={styles.text}>
            <p className="eyebrow">Study {product.number}</p>
            <h2 id="study-title" className={`${styles.title} display`}>
              {product.displayName}, <em>in every view</em>
            </h2>
            <div className={styles.chapters}>
              {CHAPTERS.slice(0, Math.max(1, n)).map((line, i) => (
                <Chapter key={line} index={i} count={Math.min(n, CHAPTERS.length)} progress={scrollYProgress}>
                  {line}
                </Chapter>
              ))}
            </div>
            <div className={styles.progress} aria-hidden="true">
              <span className={styles.track}>
                <motion.i style={{ scaleX: barScale }} />
              </span>
            </div>
            <Link href={`/shop/${product.slug}`} className={styles.link} transitionTypes={['nav-forward']}>
              View {product.displayName}
              <svg viewBox="0 0 32 12" width="28" height="12" aria-hidden="true">
                <path d="M0 6h30m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </Link>
          </div>

          <div className={styles.frameCol}>
            <motion.div className={styles.mat} style={{ scale, rotateY }}>
              <div className={styles.photo}>
                {images.map((img, i) => (
                  <View key={img.assetId} image={img} index={i} count={n} progress={scrollYProgress} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Chapter({
  index,
  count,
  progress,
  children,
}: {
  index: number;
  count: number;
  progress: MotionValue<number>;
  children: string;
}) {
  const w = windowRange(index, count, 0.05);
  const opacity = useTransform(progress, w.input, w.output);
  const y = useTransform(progress, w.input, w.output.map((o, k) => (o === 1 ? 0 : k === 0 ? 24 : -24)));
  return (
    <motion.p className={`${styles.chapter} display`} style={{ opacity, y }}>
      <span className={styles.numeral}>{['I', 'II', 'III', 'IV'][index]}</span>
      {children}
    </motion.p>
  );
}

function View({
  image,
  index,
  count,
  progress,
}: {
  image: ResolvedImage;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const w = windowRange(index, count, 0.05);
  const opacity = useTransform(progress, w.input, w.output);
  return (
    <motion.div className={styles.view} style={{ opacity }}>
      <CloudImage asset={image.asset} alt={image.alt} sizes="(max-width: 900px) 70vw, 34vw" width={960} maxWidth={1600} />
    </motion.div>
  );
}
