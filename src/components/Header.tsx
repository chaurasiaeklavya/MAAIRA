'use client';

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useExperience } from './ExperienceProvider';
import styles from './Header.module.css';
import { brand } from '@/data/brand';

const NAV = [
  { href: '#pieces', label: 'The Pieces' },
  { href: '#house', label: 'The House' },
  { href: '#collection', label: 'Collection' },
  { href: '#contact', label: 'Contact' },
];

export function Header() {
  const { theme, toggleTheme, soundOn, toggleSound, scrollTo, lockScroll, play } = useExperience();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 480 && y > prev + 2 && !menuOpen);
    if (y < prev - 2) setHidden(false);
  });

  useEffect(() => {
    if (!menuOpen) return;
    lockScroll(true);
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lockScroll(false);
    };
  }, [menuOpen, lockScroll]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    // let the menu close before scrolling so the lock is released
    requestAnimationFrame(() => scrollTo(href));
  };

  return (
    <>
      <header
        className={styles.header}
        data-scrolled={scrolled || undefined}
        data-hidden={hidden || undefined}
        data-menu={menuOpen || undefined}
      >
        <div className={styles.inner}>
          <a
            href="#top"
            className={styles.brand}
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              scrollTo(0);
            }}
            aria-label={`${brand.name} — back to top`}
          >
            <span className={`logo-mask logo-mask--monogram ${styles.monogram}`} aria-hidden="true" />
            <span className={`logo-mask logo-mask--wordmark ${styles.wordmark}`} aria-hidden="true" />
          </a>

          <nav className={styles.nav} aria-label="Primary">
            <ul>
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={go(item.href)} className={styles.navLink}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.controls}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={toggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? 'Sound on — turn interface sound off' : 'Sound off — turn interface sound on'}
              title={soundOn ? 'Sound on' : 'Sound off'}
            >
              <span className={styles.soundBars} data-on={soundOn || undefined} aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
            </button>
            <button
              type="button"
              className={styles.iconButton}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
              }}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Ivory theme' : 'Espresso theme'}
            >
              <span className={styles.themeGlyph} data-theme-glyph={theme} aria-hidden="true" />
            </button>
            <button
              ref={menuButtonRef}
              type="button"
              className={styles.menuButton}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => {
                setMenuOpen((o) => !o);
                play('tick');
              }}
            >
              <span className="visually-hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
              <span className={styles.burger} aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="site-menu"
            className={`${styles.menu} leather`}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] } }}
            transition={{ duration: 0.75, ease: [0.65, 0, 0.35, 1] }}
          >
            <nav aria-label="Menu">
              <ul className={styles.menuList}>
                {NAV.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.25 + i * 0.07, duration: 0.7 } }}
                    exit={{ opacity: 0, y: 12, transition: { duration: 0.25 } }}
                  >
                    <a
                      ref={i === 0 ? firstLinkRef : undefined}
                      href={item.href}
                      onClick={go(item.href)}
                      className={styles.menuLink}
                    >
                      <span className={styles.menuIndex}>0{i + 1}</span>
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <motion.div
              className={styles.menuFoot}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.55 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <a href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a>
              <a href={brand.contact.phoneHref}>{brand.contact.phoneDisplay}</a>
              <a href={brand.contact.instagramUrl} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
