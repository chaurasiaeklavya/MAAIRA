'use client';

import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'motion/react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CloudImage } from '../CloudImage';
import { useExperience } from '../ExperienceProvider';
import { RevealText } from '../motion/RevealText';
import styles from './GalleryRing.module.css';
import type { CatalogueImage as ResolvedImage, CatalogueProduct as Product } from '@/lib/catalogue/types';
import { cursorLabel } from '@/lib/cursor-store';

interface Plate {
  product: Product;
  image: ResolvedImage;
  view: number;
  views: number;
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * "In the round": every photographed view of the sample pieces hung on a
 * cylinder in CSS 3D. Drag (or swipe), use the arrows or keys, or let it
 * drift; selecting a plate opens that piece. The photographs are flat planes
 * — nothing about the bags is modelled or invented.
 */
export function GalleryRing({ products }: { products: Product[] }) {
  const { reducedMotion, play } = useExperience();
  const plates = useMemo<Plate[]>(
    () => products.flatMap((p) => p.images.map((image, i, arr) => ({ product: p, image, view: i + 1, views: arr.length }))),
    [products],
  );
  const N = plates.length;
  const step = 360 / N;

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { margin: '-20% 0px' });
  const rot = useMotionValue(0);
  const [active, setActive] = useState(0);
  const [plateW, setPlateW] = useState(220);
  const [paused, setPaused] = useState(false);
  const drag = useRef<{ x: number; start: number; moved: boolean; lastX: number; lastT: number; v: number } | null>(null);
  const suppressClick = useRef(false);

  const radius = (plateW / 2 / Math.tan(Math.PI / N)) * 1.14;
  const ringTransform = useMotionTemplate`translateZ(${-radius}px) rotateY(${rot}deg)`;

  useMotionValueEvent(rot, 'change', (v) => setActive(mod(Math.round(-v / step), N)));

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setPlateW(Math.round(Math.min(280, Math.max(140, w * (w < 700 ? 0.34 : 0.19)))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Slow idle drift while in view and untouched.
  useAnimationFrame((_, delta) => {
    if (reducedMotion || !inView || paused || drag.current) return;
    rot.set(rot.get() - Math.min(delta, 50) * 0.0055);
  });

  const snapTo = (target: number) => {
    animate(rot, target, reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 70, damping: 18 });
  };
  const nearest = (index: number) => {
    const current = rot.get();
    const base = -index * step;
    const turns = Math.round((current - base) / 360);
    return base + turns * 360;
  };
  const stepBy = (dir: number) => {
    play('tick');
    snapTo(Math.round(rot.get() / step) * step - dir * step);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, start: rot.get(), moved: false, lastX: e.clientX, lastT: performance.now(), v: 0 };
    rot.stop();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    const now = performance.now();
    d.v = (e.clientX - d.lastX) / Math.max(1, now - d.lastT);
    d.lastX = e.clientX;
    d.lastT = now;
    rot.set(d.start + dx * (180 / Math.max(320, plateW * 3)));
  };
  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) {
      suppressClick.current = true;
      window.setTimeout(() => (suppressClick.current = false), 50);
      const projected = rot.get() + d.v * 220;
      snapTo(Math.round(projected / step) * step);
    }
  };

  const current = plates[active];
  const dragCursor = cursorLabel('Drag');

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="ring-title">
      <div className="container">
        <header className={styles.head}>
          <p className="eyebrow">In the round</p>
          <RevealText as="h2" id="ring-title" className={`${styles.title} display`}>
            {'Every view, *in one turn*'}
          </RevealText>
          <p className={styles.lede}>
            Each photograph of the pieces, hung in the round. Drag to turn, or choose a view to open its piece.
          </p>
        </header>
      </div>

      {/* Pointer drag is an enhancement; the arrow buttons and the plate links are the accessible controls. */}
      <div
        ref={stageRef}
        className={styles.stage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={(e) => {
          dragCursor.onPointerEnter(e);
          setPaused(true);
        }}
        onPointerLeave={() => {
          dragCursor.onPointerLeave();
          setPaused(false);
          endDrag();
        }}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <div className={styles.floor} aria-hidden="true" />
        <motion.ul className={styles.ring} style={{ transform: ringTransform }} aria-label="Views of the pieces">
          {plates.map((plate, i) => (
            <PlateItem
              key={plate.image.assetId}
              plate={plate}
              index={i}
              step={step}
              radius={radius}
              width={plateW}
              rot={rot}
              onFocus={() => snapTo(nearest(i))}
            />
          ))}
        </motion.ul>
      </div>

      <div className={`container ${styles.controls}`}>
        <button type="button" className={styles.arrow} onClick={() => stepBy(-1)} aria-label="Turn to previous view">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.1" />
          </svg>
        </button>
        <p className={styles.caption} aria-live="polite">
          {current && (
            <>
              <span className={styles.captionName}>{current.product.name}</span>
              <span className={styles.captionView}>
                View {current.view} of {current.views}
              </span>
            </>
          )}
        </p>
        <button type="button" className={styles.arrow} onClick={() => stepBy(1)} aria-label="Turn to next view">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.1" />
          </svg>
        </button>
      </div>
    </section>
  );
}

function PlateItem({
  plate,
  index,
  step,
  radius,
  width,
  rot,
  onFocus,
}: {
  plate: Plate;
  index: number;
  step: number;
  radius: number;
  width: number;
  rot: MotionValue<number>;
  onFocus: () => void;
}) {
  const angle = index * step;
  // Shade plates as they turn away from the viewer (front = fully lit).
  const shade = useTransform(rot, (r) => {
    const facing = Math.cos(((angle + r) * Math.PI) / 180);
    return 0.72 * (1 - (facing + 1) / 2);
  });
  return (
    <li
      className={styles.plate}
      style={{ width, transform: `rotateY(${angle}deg) translateZ(${radius}px) translate(-50%, -50%)` }}
    >
      <Link
        href={`/products/${plate.product.slug}`}
        className={styles.plateLink}
        onFocus={onFocus}
        draggable={false}
        aria-label={`${plate.image.alt} — open ${plate.product.name}`}
      >
        <span className={styles.plateMat}>
          <span className={styles.platePhoto}>
            <CloudImage asset={plate.image.asset} alt="" sizes="280px" width={480} maxWidth={720} draggable={false} />
          </span>
        </span>
        <motion.span className={styles.shade} style={{ opacity: shade }} aria-hidden="true" />
      </Link>
    </li>
  );
}
