'use client';

import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { PieceDetail } from '../detail/PieceDetail';
import { useExperience } from '../ExperienceProvider';
import { PieceCard } from './PieceCard';
import styles from './Showcase.module.css';
import { findProduct, products } from '@/data/products';

const PARAM = 'piece';
const URL_EVENT = 'maaira:urlchange';
const EASE = [0.22, 1, 0.36, 1] as const;

/** The URL (?piece=slug) is the source of truth for which piece is open. */
function subscribeUrl(cb: () => void) {
  window.addEventListener('popstate', cb);
  window.addEventListener(URL_EVENT, cb);
  return () => {
    window.removeEventListener('popstate', cb);
    window.removeEventListener(URL_EVENT, cb);
  };
}
const readPiece = () => new URLSearchParams(window.location.search).get(PARAM);
const readPieceServer = () => null;

function writeUrl(slug: string | null, mode: 'push' | 'replace') {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set(PARAM, slug);
  else url.searchParams.delete(PARAM);
  window.history[mode === 'push' ? 'pushState' : 'replaceState']({ piece: slug }, '', url);
  window.dispatchEvent(new Event(URL_EVENT));
}

export function Showcase() {
  const { play } = useExperience();
  const openSlug = useSyncExternalStore(subscribeUrl, readPiece, readPieceServer);
  const [layoutSlug, setLayoutSlug] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  /** True while the open dialog owns a history entry we pushed. */
  const pushedRef = useRef(false);

  const open = useCallback(
    (slug: string, trigger: HTMLElement | null) => {
      triggerRef.current = trigger;
      setLayoutSlug(slug);
      writeUrl(slug, 'push');
      pushedRef.current = true;
      play('open');
    },
    [play],
  );

  const close = useCallback(() => {
    play('close');
    if (pushedRef.current) {
      // Step back through our own history entry so Back/Forward stay coherent.
      pushedRef.current = false;
      window.history.back();
    } else {
      writeUrl(null, 'replace');
    }
    window.setTimeout(() => triggerRef.current?.focus({ preventScroll: true }), 50);
  }, [play]);

  const navigate = useCallback((slug: string) => {
    setLayoutSlug(null);
    writeUrl(slug, 'replace');
    triggerRef.current = document.querySelector<HTMLElement>(`#${slug}-name`)?.closest('article')?.querySelector('button') ?? null;
  }, []);

  const active = findProduct(openSlug);

  return (
    <section id="pieces" className={styles.section} aria-labelledby="pieces-title">
      <div className="container">
        <header className={styles.intro}>
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            A first look
          </motion.p>
          <motion.h2
            id="pieces-title"
            className={`${styles.title} display`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.08, ease: EASE }}
          >
            Selected <em>pieces</em>
          </motion.h2>
          <motion.p
            className={styles.lede}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.16, ease: EASE }}
          >
            A curated preview of the house. Select a piece to see it in detail — the complete collection will follow.
          </motion.p>
        </header>

        <LayoutGroup>
          <div className={styles.list}>
            {products.map((p, i) => (
              <PieceCard
                key={p.id}
                product={p}
                index={i}
                total={products.length}
                active={!!active && layoutSlug === p.slug}
                onOpen={open}
              />
            ))}
          </div>

          <AnimatePresence>
            {active && (
              <PieceDetail
                key="detail"
                product={active}
                layoutSlug={layoutSlug}
                onClose={close}
                onNavigate={navigate}
              />
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  );
}
