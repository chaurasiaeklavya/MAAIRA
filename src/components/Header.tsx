'use client';

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useExperience } from './ExperienceProvider';
import styles from './Header.module.css';
import { SoundControl } from './sound/SoundControl';
import { brand } from '@/data/brand';
import { primaryNav as NAV, serviceNav } from '@/data/site';

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function Header() {
  const { theme, toggleTheme, lockScroll, play } = useExperience();
  const pathname = usePathname();
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

  // Close the menu whenever the route changes (adjusting state during render).
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setMenuOpen(false);
    setHidden(false);
  }

  return (
    <>
      <header
        className={styles.header}
        data-scrolled={scrolled || undefined}
        data-hidden={hidden || undefined}
        data-menu={menuOpen || undefined}
        data-home={pathname === '/' || undefined}
      >
        <div className={styles.inner}>
          <Link href="/" className={styles.brand} aria-label={`${brand.name} — home`} transitionTypes={['nav-back']}>
            <span className={`logo-mask logo-mask--monogram ${styles.monogram}`} aria-hidden="true" />
            <span className={`logo-mask logo-mask--wordmark ${styles.wordmark}`} aria-hidden="true" />
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            <ul>
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.navLink}
                    aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                    transitionTypes={['nav-forward']}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.controls}>
            <SoundControl />
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
                    <Link
                      ref={i === 0 ? firstLinkRef : undefined}
                      href={item.href}
                      className={styles.menuLink}
                      aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className={styles.menuIndex}>0{i + 1}</span>
                      {item.label}
                    </Link>
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
              <Link href={serviceNav[0].href} onClick={() => setMenuOpen(false)}>
                {serviceNav[0].label}
              </Link>
              <a href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a>
              <a href={brand.contact.phoneHref}>{brand.contact.phoneDisplay}</a>
              <a href={brand.contact.instagramUrl} target="_blank" rel="noopener noreferrer">
                Instagram<span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
