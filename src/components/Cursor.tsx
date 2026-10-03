'use client';

import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useExperience } from './ExperienceProvider';
import styles from './Cursor.module.css';
import { cursorStore } from '@/lib/cursor-store';
import { useMediaQuery } from '@/lib/useMediaQuery';

/**
 * A soft follower ring for fine pointers. It never replaces or hides the
 * native cursor; it only adds a quiet label ("View", "Drag") over interactive
 * imagery. Disabled on touch devices and when reduced motion is preferred.
 */
export function Cursor() {
  const { reducedMotion } = useExperience();
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  if (!fine || reducedMotion) return null;
  return <Follower />;
}

function Follower() {
  const label = useSyncExternalStore(cursorStore.subscribe, cursorStore.get, () => null);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 380, damping: 34, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 380, damping: 34, mass: 0.5 });

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const leave = () => setVisible(false);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, [x, y]);

  return (
    <motion.div
      className={styles.cursor}
      style={{ x: sx, y: sy }}
      data-visible={visible || undefined}
      data-active={label ? true : undefined}
      aria-hidden="true"
    >
      <span className={styles.ring} />
      <AnimatePresence>
        {label && (
          <motion.span
            key={label}
            className={styles.label}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
