'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { useRef } from 'react';
import { CloudImage } from '../CloudImage';
import { useExperience } from '../ExperienceProvider';
import { RevealText } from '../motion/RevealText';
import { Stage } from '../showcase/Stage';
import styles from './EditorialStudies.module.css';
import type { CatalogueImage as ResolvedImage, CatalogueProduct as Product } from '@/lib/catalogue/types';

/**
 * Campaign-style studies composed only from the house's own photographs.
 * Each piece gets a distinct composition; nothing is generated or retouched.
 */
export function EditorialStudies({ products }: { products: Product[] }) {
  const [a, b, c] = products;
  return (
    <>
      {a && <PresenceStudy product={a} numeral="I" />}
      {b && <FormStudy product={b} numeral="II" />}
      {c && <ContrastStudy product={c} numeral="III" />}
    </>
  );
}

function Mat({ image, sizes, className }: { image?: ResolvedImage; sizes: string; className?: string }) {
  return (
    <div className={`${styles.mat} ${className ?? ''}`}>
      <div className={styles.photo}>{image && <CloudImage asset={image.asset} alt={image.alt} sizes={sizes} width={960} maxWidth={1600} />}</div>
    </div>
  );
}

function StudyText({ product, numeral, title, line }: { product: Product; numeral: string; title: string; line: string }) {
  return (
    <div className={styles.text}>
      <p className={styles.kicker}>
        Study {numeral}
      </p>
      <RevealText as="h2" className={`${styles.title} display`}>
        {title}
      </RevealText>
      <p className={styles.line}>{line}</p>
      <Link href={`/products/${product.slug}`} className={styles.link}>
        View {product.name}
        <svg viewBox="0 0 32 12" width="28" height="12" aria-hidden="true">
          <path d="M0 6h30m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </Link>
    </div>
  );
}

function PresenceStudy({ product, numeral }: { product: Product; numeral: string }) {
  const { reducedMotion } = useExperience();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const numY = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const frameY = useTransform(scrollYProgress, [0, 1], [80, -40]);
  const images = product.images;
  return (
    <section ref={ref} className={`${styles.study} ${styles.presence} leather`} aria-label={`Study ${numeral}`}>
      <motion.span className={`${styles.bigNum} display`} style={reducedMotion ? undefined : { y: numY }} aria-hidden="true">
        {numeral}
      </motion.span>
      <div className={`container ${styles.presenceGrid}`}>
        <StudyText product={product} numeral={numeral} title="A study in *presence*" line="One piece, given the whole room." />
        <motion.div className={styles.presenceFrame} style={reducedMotion ? undefined : { y: frameY }}>
          <Mat image={images[0]} sizes="(max-width: 900px) 80vw, 36vw" />
        </motion.div>
      </div>
    </section>
  );
}

function FormStudy({ product, numeral }: { product: Product; numeral: string }) {
  const { reducedMotion } = useExperience();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const speeds = [useTransform(scrollYProgress, [0, 1], [90, -90]), useTransform(scrollYProgress, [0, 1], [0, 0]), useTransform(scrollYProgress, [0, 1], [-60, 120])];
  const images = product.images;
  return (
    <section ref={ref} className={`${styles.study} ${styles.form}`} aria-label={`Study ${numeral}`}>
      <div className="container">
        <StudyText product={product} numeral={numeral} title="A study in *form*" line="Turned, and turned again — each photographed view side by side." />
        <div className={styles.triptych}>
          {images.slice(0, 3).map((img, i) => (
            <motion.figure key={img.assetId} className={styles.tripItem} data-i={i} style={reducedMotion ? undefined : { y: speeds[i] }}>
              <Mat image={img} sizes="(max-width: 900px) 80vw, 28vw" />
              <figcaption>
                View {i + 1} of {images.length}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContrastStudy({ product, numeral }: { product: Product; numeral: string }) {
  const { reducedMotion } = useExperience();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const beamX = useTransform(scrollYProgress, [0, 1], ['-30%', '60%']);
  const insetY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const images = product.images;
  return (
    <section ref={ref} className={`${styles.study} ${styles.contrast}`} aria-label={`Study ${numeral}`}>
      <div className={`${styles.contrastDark} leather`}>
        <motion.span className={styles.beam} style={reducedMotion ? undefined : { x: beamX }} aria-hidden="true" />
        <StudyText product={product} numeral={numeral} title="A study in *contrast*" line="Espresso and ivory: the two worlds of the house, one piece between them." />
      </div>
      <div className={styles.contrastLight}>
        <Stage preset="ivory-plaster" className={styles.contrastStage} />
        <div className={styles.contrastFrame}>
          <Mat image={images[0]} sizes="(max-width: 900px) 70vw, 30vw" />
        </div>
        {images[1] && (
          <motion.div className={styles.inset} style={reducedMotion ? undefined : { y: insetY }}>
            <Mat image={images[1]} sizes="200px" />
          </motion.div>
        )}
      </div>
    </section>
  );
}
