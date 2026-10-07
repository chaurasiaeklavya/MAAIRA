'use client';

import { useEffect, useRef, useState } from 'react';
import type { ImageAsset } from '@/lib/catalogue/types';
import { cloudinarySrcSet, cloudinaryUrl } from '@/lib/cloudinary';
import styles from './CloudImage.module.css';

interface Props {
  asset: ImageAsset;
  alt: string;
  sizes: string;
  /** Fallback src width when srcset isn't used. */
  width?: number;
  maxWidth?: number;
  priority?: boolean;
  className?: string;
  draggable?: boolean;
  onLoad?: () => void;
  /** 'fill' covers its box; 'natural' keeps the photo's own proportions inside it (never cropped). */
  variant?: 'fill' | 'natural';
}

type Stage = 'transformed' | 'original' | 'failed';

/**
 * Product photograph delivered from Cloudinary.
 *
 * Failure handling: if the transformed (responsive) URL fails — e.g. strict
 * transformations enabled on the account — it retries once with the exact
 * supplied delivery URL; if that fails too, a composed brand panel is shown
 * instead of a broken image icon, with the alt text kept for screen readers.
 */
export function CloudImage({
  asset,
  alt,
  sizes,
  width = 1280,
  maxWidth,
  priority = false,
  className,
  draggable,
  onLoad,
  variant = 'fill',
}: Props) {
  const [stage, setStage] = useState<Stage>('transformed');
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Catch load/error events that fired before hydration attached handlers.
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth > 0) setLoaded(true);
    else if (img.currentSrc || img.src) setStage((s) => (s === 'transformed' ? 'original' : 'failed'));
  }, [stage]);

  if (stage === 'failed') {
    return (
      <span className={`${styles.fallback} ${className ?? ''}`} role="img" aria-label={`${alt} (image unavailable)`}>
        <span className={`logo-mask logo-mask--monogram ${styles.fallbackMark}`} aria-hidden="true" />
      </span>
    );
  }

  const src = stage === 'transformed' ? cloudinaryUrl(asset, width) : asset.deliveryUrl;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Cloudinary performs format/size optimisation
    <img
      key={stage}
      ref={imgRef}
      src={src}
      srcSet={stage === 'transformed' ? cloudinarySrcSet(asset, maxWidth) : undefined}
      sizes={stage === 'transformed' ? sizes : undefined}
      alt={alt}
      width={asset.width ?? undefined}
      height={asset.height ?? undefined}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      draggable={draggable}
      className={`${styles.img} ${variant === 'natural' ? styles.natural : ''} ${className ?? ''}`}
      data-loaded={loaded || undefined}
      onLoad={() => {
        setLoaded(true);
        onLoad?.();
      }}
      onError={() => setStage((s) => (s === 'transformed' ? 'original' : 'failed'))}
    />
  );
}
