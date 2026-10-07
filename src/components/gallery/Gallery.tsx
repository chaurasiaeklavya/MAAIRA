'use client';

import { AnimatePresence, motion } from 'motion/react';
import { CloudImage } from '../CloudImage';
import styles from './Gallery.module.css';
import type { GalleryState } from './useGallery';
import type { CatalogueImage as ResolvedImage } from '@/lib/catalogue/types';
import { cursorLabel } from '@/lib/cursor-store';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The photograph area: animated slides (swipe on touch), and a hover
 * magnifier on fine pointers that reveals the actual photo at higher
 * resolution. Arrows and thumbnails (GalleryControls) are the accessible controls.
 */
export function GalleryPhoto({
  images,
  gallery,
  sizes,
  priority = false,
  idPrefix,
}: {
  images: ResolvedImage[];
  gallery: GalleryState;
  sizes: string;
  priority?: boolean;
  idPrefix: string;
}) {
  const current = images[gallery.index] ?? images[0];
  const dragCursor = cursorLabel(images.length > 1 && !gallery.canZoom ? 'Drag' : 'Zoom');

  return (
    <div
      className={styles.photo}
      onPointerMove={gallery.onZoomMove}
      onPointerEnter={dragCursor.onPointerEnter}
      onPointerLeave={() => {
        gallery.clearZoom();
        dragCursor.onPointerLeave();
      }}
    >
      <AnimatePresence initial={false} custom={gallery.direction} mode="popLayout">
        {current && (
          <motion.div
            key={`${idPrefix}-${gallery.index}`}
            className={styles.slide}
            custom={gallery.direction}
            variants={gallery.variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: EASE }}
            drag={images.length > 1 && !gallery.canZoom ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={gallery.onDragEnd}
          >
            <CloudImage
              asset={current.asset}
              alt={current.alt}
              sizes={sizes}
              width={1280}
              maxWidth={2000}
              priority={priority}
              draggable={false}
              className={styles.photoImg}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {gallery.zoom && current && gallery.canZoom && (
        <div className={styles.zoom} aria-hidden="true">
          <div className={styles.zoomInner} style={{ transformOrigin: `${gallery.zoom.x}% ${gallery.zoom.y}%` }}>
            <CloudImage
              asset={current.asset}
              alt=""
              sizes="100vw"
              width={2000}
              maxWidth={2000}
              draggable={false}
              className={styles.photoImg}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function GalleryControls({ images, gallery }: { images: ResolvedImage[]; gallery: GalleryState }) {
  if (images.length < 2) return null;
  return (
    <div className={styles.controls}>
      <button type="button" className={styles.arrow} onClick={() => gallery.go(-1)} aria-label="Previous image">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      </button>

      <div className={styles.thumbs} role="group" aria-label="Choose a view">
        {images.map((img, i) => (
          <button
            key={img.assetId}
            type="button"
            className={styles.thumb}
            aria-label={`Show ${img.alt}`}
            aria-current={i === gallery.index ? 'true' : undefined}
            onClick={() => gallery.select(i)}
          >
            <CloudImage asset={img.asset} alt="" sizes="72px" width={240} maxWidth={480} />
          </button>
        ))}
      </div>

      <p className={styles.counter} aria-live="polite">
        <span>{String(gallery.index + 1).padStart(2, '0')}</span> / {String(images.length).padStart(2, '0')}
      </p>

      <button type="button" className={styles.arrow} onClick={() => gallery.go(1)} aria-label="Next image">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      </button>
    </div>
  );
}

export { styles as galleryStyles };
