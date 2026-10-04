'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useId, useState, type ReactNode } from 'react';
import styles from './Faq.module.css';

/** Accessible disclosure list (button + region), one item open at a time. */
export function Faq({ items }: { items: { q: string; a: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();
  return (
    <div className={styles.list}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className={styles.item}>
            <h3>
              <button
                type="button"
                className={styles.q}
                aria-expanded={isOpen}
                aria-controls={`${uid}-a-${i}`}
                id={`${uid}-q-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <span className={styles.icon} aria-hidden="true" data-open={isOpen || undefined} />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${uid}-a-${i}`}
                  role="region"
                  aria-labelledby={`${uid}-q-${i}`}
                  className={styles.a}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className={styles.aInner}>{item.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
