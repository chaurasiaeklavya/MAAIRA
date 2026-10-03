'use client';

import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef, useState, type ReactNode } from 'react';
import { useExperience } from '../ExperienceProvider';
import styles from './Collection.module.css';
import { brand } from '@/data/brand';
import { cursorLabel } from '@/lib/cursor-store';
import { useMediaQuery } from '@/lib/useMediaQuery';

/**
 * Editorial pauses that anticipate the full catalogue. They intentionally hold
 * no products, counts or collection names — only atmosphere and typography.
 */
type Tone = 'espresso' | 'plaster' | 'podium' | 'caramel';

interface Slide {
  tone: Tone;
  title: ReactNode;
  line: string;
  cta?: { href: string; label: string };
}

const SLIDES: Slide[] = [
  {
    tone: 'espresso',
    title: (
      <>
        A world of <em>elegance</em>
      </>
    ),
    line: 'The collection, in full, follows.',
  },
  {
    tone: 'plaster',
    title: (
      <>
        The art of everyday <em>luxury</em>
      </>
    ),
    line: 'Considered pieces for every chapter of the day.',
  },
  {
    tone: 'podium',
    title: (
      <>
        More to <em>discover</em>
      </>
    ),
    line: 'A place is being kept.',
  },
  {
    tone: 'caramel',
    title: (
      <>
        Something beautiful <em>awaits</em>
      </>
    ),
    line: 'Follow the house for what comes next.',
    cta: { href: brand.contact.instagramUrl, label: `Instagram ${brand.contact.instagramHandle}` },
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function Collection() {
  const { reducedMotion } = useExperience();
  const wide = useMediaQuery('(min-width: 900px) and (hover: hover)');
  const pinned = wide && !reducedMotion;

  return (
    <section id="collection" className={styles.section} aria-labelledby="collection-title" data-mode={pinned ? 'pinned' : 'carousel'}>
      <h2 id="collection-title" className="visually-hidden">
        The Collection
      </h2>
      {pinned ? <Pinned /> : <Carousel />}
    </section>
  );
}

function SlideView({
  slide,
  index,
  progress,
}: {
  slide: Slide;
  index: number;
  progress?: MotionValue<number>;
}) {
  // Per-slide parallax: type drifts against the surface as the track moves.
  const n = SLIDES.length;
  const center = n > 1 ? index / (n - 1) : 0;
  const still = useMotionValue(center);
  const source = progress ?? still;
  const titleX = useTransform(source, [center - 0.5, center, center + 0.5], [140, 0, -140]);
  const motifX = useTransform(source, [center - 0.5, center + 0.5], [-60, 60]);

  return (
    <article className={styles.slide} data-tone={slide.tone} aria-roledescription="slide" aria-label={`${index + 1} of ${n}`}>
      <div className={styles.surface} aria-hidden="true">
        {slide.tone === 'espresso' && (
          <>
            <span className={`${styles.leatherField} leather`} />
            <motion.span className={`logo-mask logo-mask--monogram ${styles.bigDeboss}`} style={progress ? { x: motifX } : undefined} />
            <span className={styles.stitchFrame} />
          </>
        )}
        {slide.tone === 'plaster' && (
          <>
            <span className={styles.plaster} />
            <motion.span className={styles.windowLight} style={progress ? { x: motifX } : undefined} />
            <span className={styles.archLine} />
          </>
        )}
        {slide.tone === 'podium' && (
          <>
            <span className={styles.spot} />
            <motion.span className={styles.plinth} style={progress ? { x: motifX } : undefined}>
              <i />
            </motion.span>
          </>
        )}
        {slide.tone === 'caramel' && (
          <>
            <span className={`${styles.leatherField} ${styles.caramelLeather} leather`} />
            <span className={styles.embossLine} />
          </>
        )}
      </div>

      <motion.div className={styles.text} style={progress ? { x: titleX } : undefined}>
        <p className={styles.index}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <i />
          <span>The Collection</span>
        </p>
        <h3 className={`${styles.title} display`}>{slide.title}</h3>
        <p className={styles.line}>{slide.line}</p>
        {slide.cta && (
          <a className={styles.cta} href={slide.cta.href} target="_blank" rel="noopener noreferrer">
            {slide.cta.label}
            <span className="visually-hidden"> (opens in a new tab)</span>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.1" />
            </svg>
          </a>
        )}
      </motion.div>
    </article>
  );
}

function Pinned() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const n = SLIDES.length;
  const x = useTransform(scrollYProgress, [0, 1], ['0vw', `${-(n - 1) * 100}vw`]);
  const bar = useTransform(scrollYProgress, [0, 1], [1 / n, 1]);
  const [current, setCurrent] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setCurrent(Math.min(n - 1, Math.round(v * (n - 1)))));

  return (
    <div ref={ref} className={styles.pinTrack} style={{ height: `${n * 100}vh` }}>
      <div className={styles.sticky}>
        <motion.div className={styles.rail} style={{ x, width: `${n * 100}vw` }}>
          {SLIDES.map((s, i) => (
            <div key={i} className={styles.cell}>
              <SlideView slide={s} index={i} progress={scrollYProgress} />
            </div>
          ))}
        </motion.div>
        <div className={styles.progress} aria-hidden="true">
          <span className={styles.progressCount}>
            {String(current + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </span>
          <span className={styles.progressTrack}>
            <motion.i style={{ scaleX: bar }} />
          </span>
        </div>
      </div>
    </div>
  );
}

function Carousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const n = SLIDES.length;

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const w = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth : el.clientWidth;
    setCurrent(Math.min(n - 1, Math.max(0, Math.round(el.scrollLeft / Math.max(1, w)))));
  };

  const goTo = (i: number) => {
    const el = scroller.current;
    const target = el?.children[i] as HTMLElement | undefined;
    if (el && target) el.scrollTo({ left: target.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  };

  return (
    <div className={styles.carousel}>
      <motion.div
        ref={scroller}
        className={styles.scroller}
        onScroll={onScroll}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 1.1, ease: EASE }}
        role="region"
        aria-label="The Collection — editorial slides"
        tabIndex={0}
        {...cursorLabel('Drag')}
      >
        {SLIDES.map((s, i) => (
          <div key={i} className={styles.snapCell}>
            <SlideView slide={s} index={i} />
          </div>
        ))}
      </motion.div>
      <div className={styles.carouselNav}>
        <button type="button" onClick={() => goTo(Math.max(0, current - 1))} disabled={current === 0} aria-label="Previous slide">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.1" />
          </svg>
        </button>
        <div className={styles.dots}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={styles.dot}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button type="button" onClick={() => goTo(Math.min(n - 1, current + 1))} disabled={current === n - 1} aria-label="Next slide">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
