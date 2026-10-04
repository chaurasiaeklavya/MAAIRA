'use client';

import type { PanInfo } from 'motion/react';
import { useCallback, useState } from 'react';
import { useExperience } from '../ExperienceProvider';
import { useMediaQuery } from '@/lib/useMediaQuery';

/** Gallery state shared by the quick-view dialog and product pages. */
export function useGallery(count: number) {
  const { reducedMotion, play } = useExperience();
  // Hover magnifier only where a precise hovering pointer exists; touch gets swipe.
  const canZoom = useMediaQuery('(hover: hover) and (pointer: fine)') && !reducedMotion;
  const [[index, direction], setView] = useState<[number, number]>([0, 0]);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setView(([i]) => [(i + delta + count) % count, delta]);
      setZoom(null);
      play('tick');
    },
    [count, play],
  );

  const select = useCallback(
    (i: number) => {
      setView(([prev]) => (i === prev ? [prev, 0] : [i, i > prev ? 1 : -1]));
      setZoom(null);
      play('tick');
    },
    [play],
  );

  const reset = useCallback(() => {
    setView([0, 0]);
    setZoom(null);
  }, []);

  const onZoomMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!canZoom || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
  };

  /** Arrow-key handling for a focused gallery region. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    }
  };

  const variants = {
    enter: (dir: number) => (reducedMotion ? { opacity: 0 } : { opacity: 0, x: dir >= 0 ? 60 : -60, scale: 1.02 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir: number) => (reducedMotion ? { opacity: 0 } : { opacity: 0, x: dir >= 0 ? -60 : 60, scale: 0.99 }),
  };

  return {
    index,
    direction,
    count,
    zoom,
    canZoom,
    go,
    select,
    reset,
    onZoomMove,
    clearZoom: () => setZoom(null),
    onDragEnd,
    onKeyDown,
    variants,
  };
}

export type GalleryState = ReturnType<typeof useGallery>;
