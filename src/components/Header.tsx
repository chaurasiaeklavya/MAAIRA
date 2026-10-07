'use client';

import Form from 'next/form';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useCart } from './commerce/CartProvider';
import { useWishlist } from './commerce/WishlistProvider';
import { useExperience } from './ExperienceProvider';
import { SoundControl } from './sound/SoundControl';
import { brand } from '@/data/brand';
import { careNav, primaryNav } from '@/data/site';
import styles from './Header.module.css';

export interface NavData {
  styles: { slug: string; label: string }[];
  occasions: { slug: string; label: string }[];
  hasArrivals: boolean;
}

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

const Icon = {
  search: <path d="M10.5 18a7.5 7.5 0 1 1 5.3-2.2L21 21" fill="none" stroke="currentColor" strokeWidth="1.3" />,
  account: (
    <>
      <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </>
  ),
  heart: <path d="M12 20.3s-7.6-4.6-9.2-9.4C1.7 7.6 3.8 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.8 1.3-1.7 2.9-2.8 4.9-2.8 3.3 0 5.4 3.1 4.3 6.4-1.6 4.8-9.2 9.4-9.2 9.4z" fill="none" stroke="currentColor" strokeWidth="1.3" />,
  cart: (
    <>
      <path d="M5 8h14l-1.2 12.2H6.2L5 8z" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </>
  ),
};

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className={styles.icon}>
    {children}
  </svg>
);

export function Header({ nav, signedIn }: { nav: NavData; signedIn: boolean }) {
  const { theme, toggleTheme, play } = useExperience();
  const { cart, open: openCart } = useCart();
  const { ids: wishlist } = useWishlist();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLDialogElement>(null);
  const shopRef = useRef<HTMLLIElement>(null);
  const cartCount = cart.lines.reduce((n, l) => n + l.quantity, 0);
  const hasMega = nav.styles.length + nav.occasions.length > 0 || nav.hasArrivals;

  // Quietly steps aside while reading down the page; returns on the way up.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 480 && y > prev + 2 && !shopOpen);
    if (y < prev - 2) setHidden(false);
  });
  // A reload mid-page starts with the scrolled treatment.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with the restored scroll position
  useEffect(() => setScrolled(window.scrollY > 40), []);

  // Close menus on navigation (adjusting state during render).
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setShopOpen(false);
    setHidden(false);
  }
  useEffect(() => {
    menuRef.current?.close();
    searchRef.current?.close();
  }, [pathname]);

  useEffect(() => {
    if (!shopOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShopOpen(false);
    const onDown = (e: PointerEvent) => !shopRef.current?.contains(e.target as Node) && setShopOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [shopOpen]);

  const openMenu = () => {
    menuRef.current?.showModal();
    play('tick');
  };

  const themeButton = (
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
  );

  const categoryLinks = (onClick?: () => void) => (
    <>
      {nav.styles.length > 0 && (
        <div className={styles.megaCol}>
          <p className={styles.megaHead}>By style</p>
          <ul>
            {nav.styles.map((c) => (
              <li key={c.slug}>
                <Link href={`/shop/${c.slug}`} onClick={onClick} transitionTypes={['nav-forward']}>
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {nav.occasions.length > 0 && (
        <div className={styles.megaCol}>
          <p className={styles.megaHead}>By occasion</p>
          <ul>
            {nav.occasions.map((c) => (
              <li key={c.slug}>
                <Link href={`/shop/${c.slug}`} onClick={onClick} transitionTypes={['nav-forward']}>
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  return (
    <>
      <header
        className={styles.header}
        data-scrolled={scrolled || undefined}
        data-hidden={hidden || undefined}
        data-home={pathname === '/' || undefined}
      >
        <div className={styles.inner}>
          <Link href="/" className={styles.brand} aria-label={`${brand.name} — home`} transitionTypes={['nav-back']}>
            <span className={`logo-mask logo-mask--monogram ${styles.monogram}`} aria-hidden="true" />
            <span className={`logo-mask logo-mask--wordmark ${styles.wordmark}`} aria-hidden="true" />
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            <ul>
              {primaryNav.map((item) =>
                item.href === '/shop' && hasMega ? (
                  <li key={item.href} ref={shopRef} className={styles.shopItem}>
                    <button
                      type="button"
                      className={styles.navLink}
                      aria-expanded={shopOpen}
                      aria-controls="shop-panel"
                      onClick={() => setShopOpen((o) => !o)}
                      aria-current={isActive(pathname, '/shop') ? 'page' : undefined}
                    >
                      {item.label}
                    </button>
                    <div id="shop-panel" className={styles.mega} hidden={!shopOpen}>
                      <div className={styles.megaCol}>
                        <p className={styles.megaHead}>The pieces</p>
                        <ul>
                          <li>
                            <Link href="/shop" transitionTypes={['nav-forward']}>
                              All pieces
                            </Link>
                          </li>
                          {nav.hasArrivals && (
                            <li>
                              <Link href="/new-arrivals" transitionTypes={['nav-forward']}>
                                New arrivals
                              </Link>
                            </li>
                          )}
                        </ul>
                      </div>
                      {categoryLinks()}
                    </div>
                  </li>
                ) : (
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
                ),
              )}
            </ul>
          </nav>

          <div className={styles.controls}>
            <button type="button" className={styles.iconButton} onClick={() => searchRef.current?.showModal()} aria-haspopup="dialog">
              <Svg>{Icon.search}</Svg>
              <span className="visually-hidden">Search</span>
            </button>
            <Link
              href={signedIn ? '/account' : '/account/sign-in'}
              className={`${styles.iconButton} ${styles.desktopOnly}`}
              aria-current={isActive(pathname, '/account') ? 'page' : undefined}
            >
              <Svg>{Icon.account}</Svg>
              <span className="visually-hidden">{signedIn ? 'Account' : 'Sign in'}</span>
            </Link>
            <Link href="/wishlist" className={`${styles.iconButton} ${styles.desktopOnly}`} aria-current={isActive(pathname, '/wishlist') ? 'page' : undefined}>
              <Svg>{Icon.heart}</Svg>
              <span className="visually-hidden">Wishlist{wishlist.length > 0 ? `, ${wishlist.length} saved` : ''}</span>
              {wishlist.length > 0 && (
                <span className={styles.badge} aria-hidden="true">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button type="button" className={styles.iconButton} onClick={openCart} aria-haspopup="dialog">
              <Svg>{Icon.cart}</Svg>
              <span className="visually-hidden">Cart, {cartCount === 1 ? '1 item' : `${cartCount} items`}</span>
              {cartCount > 0 && (
                <span className={styles.badge} aria-hidden="true">
                  {cartCount}
                </span>
              )}
            </button>
            <span className={`${styles.divider} ${styles.desktopOnly}`} aria-hidden="true" />
            <span className={styles.desktopOnly}>
              <SoundControl />
            </span>
            <span className={styles.desktopOnly}>{themeButton}</span>
            <button type="button" className={styles.menuButton} onClick={openMenu} aria-haspopup="dialog" aria-label="Menu">
              <span className={styles.burger} aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Search */}
      <dialog ref={searchRef} className={styles.searchDialog} aria-labelledby="search-title" onClick={(e) => e.target === searchRef.current && searchRef.current?.close()}>
        <div className={`container ${styles.searchInner}`}>
          <h2 id="search-title" className="visually-hidden">
            Search
          </h2>
          <Form action="/search" className={styles.searchForm} role="search" onSubmit={() => searchRef.current?.close()}>
            <label htmlFor="site-search" className="visually-hidden">
              Search bags
            </label>
            <Svg>{Icon.search}</Svg>
            <input id="site-search" name="q" type="search" placeholder="Search the house — try “office”, “crossbody”, “party”" maxLength={80} autoComplete="off" enterKeyHint="search" autoFocus />
            <button type="submit" className={styles.searchSubmit}>
              Search
            </button>
          </Form>
          <div className={styles.searchQuick}>
            <Link href="/shop" transitionTypes={['nav-forward']}>
              All pieces
            </Link>
            {[...nav.styles, ...nav.occasions].slice(0, 6).map((c) => (
              <Link key={c.slug} href={`/shop/${c.slug}`} transitionTypes={['nav-forward']}>
                {c.label}
              </Link>
            ))}
          </div>
          <button type="button" className={styles.dialogClose} onClick={() => searchRef.current?.close()}>
            Close<span className="visually-hidden"> search</span>
          </button>
        </div>
      </dialog>

      {/* Full-screen menu: leather, numbered, revealed from the top */}
      <dialog ref={menuRef} className={`${styles.menu} leather`} aria-labelledby="menu-title" data-lenis-prevent>
        <div className={styles.menuPanel}>
          <div className={styles.menuHead}>
            <h2 id="menu-title" className="visually-hidden">
              Menu
            </h2>
            <Link href="/" className={styles.brand} aria-label={`${brand.name} — home`} transitionTypes={['nav-back']}>
              <span className={`logo-mask logo-mask--monogram ${styles.monogram}`} aria-hidden="true" />
              <span className={`logo-mask logo-mask--wordmark ${styles.wordmark}`} aria-hidden="true" />
            </Link>
            <button type="button" className={styles.menuClose} onClick={() => menuRef.current?.close()}>
              <span className="visually-hidden">Close menu</span>
              <span className={styles.burger} data-open aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </div>
          <nav aria-label="Menu" className={styles.menuNav}>
            <ul className={styles.menuList}>
              {primaryNav.map((item, i) => (
                <li key={item.href} className={styles.menuItem} style={{ '--i': i } as React.CSSProperties}>
                  <Link href={item.href} className={styles.menuLink} aria-current={isActive(pathname, item.href) ? 'page' : undefined} transitionTypes={['nav-forward']}>
                    <span className={styles.menuIndex}>0{i + 1}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            {hasMega && (
              <div className={styles.menuCats}>
                {nav.hasArrivals && (
                  <div className={styles.megaCol}>
                    <p className={styles.megaHead}>Just in</p>
                    <ul>
                      <li>
                        <Link href="/new-arrivals">New arrivals</Link>
                      </li>
                    </ul>
                  </div>
                )}
                {categoryLinks()}
              </div>
            )}
            <ul className={styles.menuSecondary}>
              <li>
                <Link href={signedIn ? '/account' : '/account/sign-in'}>{signedIn ? 'My account' : 'Sign in / create account'}</Link>
              </li>
              <li>
                <Link href="/wishlist">Wishlist{wishlist.length ? ` (${wishlist.length})` : ''}</Link>
              </li>
              {careNav.slice(0, 3).map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.menuFoot}>
            <a href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a>
            <a href={brand.contact.phoneHref}>{brand.contact.phoneDisplay}</a>
            <a href={brand.contact.instagramUrl} target="_blank" rel="noopener noreferrer">
              Instagram<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
            <div className={styles.menuToggles}>
              {themeButton}
              <SoundControl placement="up" />
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
