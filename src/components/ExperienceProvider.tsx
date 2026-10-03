'use client';

import Lenis from 'lenis';
import { MotionConfig } from 'motion/react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { play, setSoundEnabled, type SoundName } from '@/lib/sound';
import { useMediaQuery } from '@/lib/useMediaQuery';

export type Theme = 'light' | 'dark';

interface Experience {
  theme: Theme;
  toggleTheme: (origin?: { x: number; y: number }) => void;
  soundOn: boolean;
  toggleSound: () => void;
  play: (name: SoundName) => void;
  reducedMotion: boolean;
  /** Pause/resume smooth scrolling (e.g. while a dialog is open). */
  lockScroll: (locked: boolean) => void;
  scrollTo: (target: string | HTMLElement | number) => void;
}

const ExperienceContext = createContext<Experience | null>(null);

const THEME_KEY = 'maaira-theme';
const SOUND_KEY = 'maaira-sound';

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function ExperienceProvider({ children }: { children: ReactNode }) {
  // Hydration-safe: server and first client render agree on `false`, then sync.
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [theme, setTheme] = useState<Theme>('dark');
  const [soundOn, setSoundOn] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  // Sync with the pre-paint theme script and stored sound preference.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with DOM state set before hydration
    setTheme(readTheme());
    try {
      const on = localStorage.getItem(SOUND_KEY) === 'on';
      setSoundOn(on);
      setSoundEnabled(on);
    } catch {
      /* storage unavailable — keep defaults */
    }
  }, []);

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
        startViewTransition?: (cb: () => void) => { ready: Promise<void> };
      };
      if (!doc.startViewTransition || reducedMotion) {
        apply();
        return;
      }
      const x = origin?.x ?? window.innerWidth - 40;
      const y = origin?.y ?? 40;
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const transition = doc.startViewTransition(() => flushSync(apply));
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

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      setSoundEnabled(next);
      try {
        localStorage.setItem(SOUND_KEY, next ? 'on' : 'off');
      } catch {}
      if (next) play('tick');
      return next;
    });
  }, []);

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
        lenis.scrollTo(target, { offset: typeof target === 'number' ? 0 : -64, duration: 1.4 });
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
    () => ({ theme, toggleTheme, soundOn, toggleSound, play, reducedMotion, lockScroll, scrollTo }),
    [theme, toggleTheme, soundOn, toggleSound, reducedMotion, lockScroll, scrollTo],
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
