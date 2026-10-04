'use client';

import { motion } from 'motion/react';
import { Fragment, type ElementType } from 'react';
import { useExperience } from '../ExperienceProvider';
import styles from './RevealText.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Masked word reveal for headlines: each word rises from behind its own mask.
 * Wrap a phrase in *asterisks* to set it in italic. With reduced motion the
 * words simply fade in together.
 */
export function RevealText({
  children,
  as = 'p',
  className,
  id,
  delay = 0,
  stagger = 0.045,
  trigger = 'inView',
}: {
  children: string;
  as?: ElementType;
  className?: string;
  id?: string;
  delay?: number;
  stagger?: number;
  trigger?: 'mount' | 'inView';
}) {
  const { reducedMotion } = useExperience();
  const Tag = as;
  const segments = children.split(/(\*[^*]+\*)/g).filter(Boolean);
  let i = 0;

  const animate = { y: '0%', opacity: 1 };
  const initial = reducedMotion ? { opacity: 0 } : { y: '108%', opacity: 1 };
  const play =
    trigger === 'mount'
      ? { initial, animate }
      : { initial, whileInView: animate, viewport: { once: true, margin: '-8% 0px' } };

  return (
    <Tag className={className} id={id}>
      {segments.map((seg, s) => {
        const italic = seg.startsWith('*') && seg.endsWith('*');
        const words = (italic ? seg.slice(1, -1) : seg).split(/(\s+)/);
        const content = words.map((w, k) => {
          if (!w.trim()) return <Fragment key={k}>{w}</Fragment>;
          const index = i++;
          return (
            <span key={k} className={styles.mask}>
              <motion.span
                className={styles.word}
                {...play}
                transition={{ duration: reducedMotion ? 0.4 : 1.05, delay: delay + (reducedMotion ? 0 : index * stagger), ease: EASE }}
              >
                {w}
              </motion.span>
            </span>
          );
        });
        return italic ? <em key={s}>{content}</em> : <Fragment key={s}>{content}</Fragment>;
      })}
    </Tag>
  );
}
