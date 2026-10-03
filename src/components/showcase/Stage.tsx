import type { ReactNode } from 'react';
import type { StagePreset } from '@/data/products';
import styles from './Stage.module.css';

/**
 * Material backdrop for a product. These are CSS/procedural treatments around
 * the untouched photograph — the product image itself is never composited,
 * recoloured or altered.
 */
export function Stage({ preset, children, className }: { preset: StagePreset; children?: ReactNode; className?: string }) {
  return (
    <div className={`${styles.stage} ${className ?? ''}`} data-stage={preset}>
      <div className={styles.backdrop} aria-hidden="true">
        {preset === 'ivory-plaster' && <span className={styles.arch} />}
        {preset === 'champagne-studio' && <span className={styles.sweep} />}
        {preset === 'espresso-leather' && <span className={`${styles.leatherField} leather`} />}
        <span className={styles.light} />
        <span className={styles.floor} />
      </div>
      {children}
    </div>
  );
}
