'use client';

import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { useExperience } from '../ExperienceProvider';
import { findProduct } from '@/data/products';

const PARAM = 'piece';
const URL_EVENT = 'maaira:urlchange';

/** The URL (?piece=slug) is the source of truth for which quick view is open. */
function subscribeUrl(cb: () => void) {
  window.addEventListener('popstate', cb);
  window.addEventListener(URL_EVENT, cb);
  return () => {
    window.removeEventListener('popstate', cb);
    window.removeEventListener(URL_EVENT, cb);
  };
}
/** Fallback when the History API is unavailable (e.g. a file:// preview). */
let memoryPiece: string | null | undefined;
const readPiece = () =>
  memoryPiece !== undefined ? memoryPiece : new URLSearchParams(window.location.search).get(PARAM);
const readPieceServer = () => null;

/** Returns false when the URL could not be updated and in-memory state was used instead. */
function writeUrl(slug: string | null, mode: 'push' | 'replace') {
  let ok = true;
  try {
    if (memoryPiece !== undefined) throw new Error('history unavailable');
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set(PARAM, slug);
    else url.searchParams.delete(PARAM);
    window.history[mode === 'push' ? 'pushState' : 'replaceState'](window.history.state, '', url);
  } catch {
    memoryPiece = slug;
    ok = false;
  }
  window.dispatchEvent(new Event(URL_EVENT));
  return ok;
}

/** Quick-view state with deep links, Back/Forward support and focus return. */
export function useQuickView() {
  const { play } = useExperience();
  const openSlug = useSyncExternalStore(subscribeUrl, readPiece, readPieceServer);
  const [layoutSlug, setLayoutSlug] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  /** True while the open dialog owns a history entry we pushed. */
  const pushedRef = useRef(false);

  const open = useCallback(
    (slug: string, trigger: HTMLElement | null, morph = false) => {
      triggerRef.current = trigger;
      setLayoutSlug(morph ? slug : null);
      pushedRef.current = writeUrl(slug, 'push');
      play('open');
    },
    [play],
  );

  const close = useCallback(() => {
    play('close');
    if (pushedRef.current) {
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
  }, []);

  return { active: findProduct(openSlug), layoutSlug, open, close, navigate };
}
