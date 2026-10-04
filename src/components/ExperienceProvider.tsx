'use client';

import Lenis from 'lenis';
import { MotionConfig } from 'motion/react';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { hydrateSoundPreferences, play, type Cue } from '@/lib/sound/engine';
import { useMediaQuery } from '@/lib/useMediaQuery';

export type Theme = 'light' | 'dark';

interface Experience {
  theme: Theme;
  toggleTheme: (origin?: { x: number; y: number }) => void;
  play: (name: Cue) => void;
  reducedMotion: boolean;
  /** Pause/resume smooth scrolling (e.g. while a dialog is open). */
  lockScroll: (locked: boolean) => void;
  scrollTo: (target: string | HTMLElement | number) => void;
}

const ExperienceContext = createContext<Experience | null>(null);

const THEME_KEY = 'maaira-theme';

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function ExperienceProvider({ children }: { children: ReactNode }) {
  // Hydration-safe: server and first client render agree on `false`, then sync.
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [theme, setTheme] = useState<Theme>('dark');
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const lastPath = useRef(pathname);

  // Sync with the pre-paint theme script and stored sound preference.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with DOM state set before hydration
    setTheme(readTheme());
    hydrateSoundPreferences();
  }, []);

  // Route change: resync smooth scrolling with the new page and play the page cue.
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.resize();
      if (!window.location.hash) lenis.scrollTo(0, { immediate: true, force: true });
    }
    play('page');
  }, [pathname]);

  // Follow OS theme changes until the visitor picks one explicitly.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(THEME_KEY);
      } catch {}
      if (stored) return;
      const next: Theme = mq.matches ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Smooth scrolling — desktop wheel only; touch keeps native momentum.
  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      smoothWheel: true,
      anchors: { offset: -64 },
    });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  const toggleTheme = useCallback(
    (origin?: { x: number; y: number }) => {
      const next: Theme = readTheme() === 'dark' ? 'light' : 'dark';
      const apply = () => {
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch {}
        setTheme(next);
      };
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
      };
      if (!doc.startViewTransition || reducedMotion) {
        apply();
        return;
      }
      const x = origin?.x ?? window.innerWidth - 40;
      const y = origin?.y ?? 40;
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      // Scopes the circle-reveal CSS to this transition only (route transitions keep theirs).
      const root = document.documentElement;
      root.classList.add('theme-transition');
      const transition = doc.startViewTransition(() => flushSync(apply));
      transition.finished.finally(() => root.classList.remove('theme-transition')).catch(() => {});
      transition.ready
        .then(() => {
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
            { duration: 760, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
          );
        })
        .catch(() => {});
      play('tick');
    },
    [reducedMotion],
  );


  const lockScroll = useCallback((locked: boolean) => {
    const lenis = lenisRef.current;
    if (locked) {
      lenis?.stop();
      const sbw = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-comp', `${sbw}px`);
      document.documentElement.classList.add('is-locked');
    } else {
      lenis?.start();
      document.documentElement.classList.remove('is-locked');
      document.documentElement.style.removeProperty('--scrollbar-comp');
    }
  }, []);

  const scrollTo = useCallback(
    (target: string | HTMLElement | number) => {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, { offset: typeof target === 'number' ? 0 : -96, duration: 1.4 });
        return;
      }
      if (typeof target === 'number') window.scrollTo({ top: target });
      else {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        el?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    },
    [reducedMotion],
  );

  const value = useMemo<Experience>(
    () => ({ theme, toggleTheme, play, reducedMotion, lockScroll, scrollTo }),
    [theme, toggleTheme, reducedMotion, lockScroll, scrollTo],
  );

  return (
    <ExperienceContext.Provider value={value}>
      <MotionConfig reducedMotion="user" transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.8 }}>
        {children}
      </MotionConfig>
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error('useExperience must be used inside <ExperienceProvider>');
  return ctx;
}
