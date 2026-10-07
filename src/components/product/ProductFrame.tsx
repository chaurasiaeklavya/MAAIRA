'use client';

import { motion, type MotionValue, type MotionStyle } from 'motion/react';
import { CloudImage } from '../CloudImage';
import { SharedFrame } from '../PageShell';
import styles from './ProductFrame.module.css';
import type { CatalogueImage as ResolvedImage } from '@/lib/catalogue/types';

/**
 * A photograph in its passe-partout mat — the one way product imagery is
 * framed across the site. The image itself is never cropped beyond the
 * frame's 3:4 window, recoloured or altered.
 *
 * `shareName` gives it a view-transition name so it morphs into the same
 * piece's frame on the next route.
 */
export function ProductFrame({
  image,
  sizes,
  shareName,
  priority,
  tiltStyle,
  glare,
  shadow,
  className,
  fit = 'cover',
}: {
  image: ResolvedImage | undefined;
  sizes: string;
  shareName?: string;
  priority?: boolean;
  tiltStyle?: MotionStyle;
  glare?: MotionValue<string>;
  shadow?: MotionValue<string>;
  className?: string;
  fit?: 'cover' | 'contain';
}) {
  const frame = (
    <motion.div className={styles.frame} style={shadow ? { boxShadow: shadow } : undefined}>
      <div className={styles.photo} data-fit={fit}>
        {image && <CloudImage asset={image.asset} alt={image.alt} sizes={sizes} width={960} maxWidth={1600} priority={priority} />}
      </div>
      {glare && <motion.span className={styles.glare} style={{ background: glare }} aria-hidden="true" />}
    </motion.div>
  );

  return (
    <motion.div className={`${styles.tilt} ${className ?? ''}`} style={tiltStyle}>
      {shareName ? <SharedFrame name={shareName}>{frame}</SharedFrame> : frame}
    </motion.div>
  );
}
