import Link from 'next/link';
import type { NavData } from './Header';
import { SoundControl } from './sound/SoundControl';
import { brand } from '@/data/brand';
import { aboutNav, careNav, legalNav } from '@/data/site';
import styles from './Footer.module.css';

export function Footer({ nav }: { nav: NavData }) {
  const shop = [
    { href: '/shop', label: 'Shop all bags' },
    ...(nav.hasArrivals ? [{ href: '/new-arrivals', label: 'New arrivals' }] : []),
    ...[...nav.styles, ...nav.occasions].slice(0, 6).map((c) => ({ href: `/shop/${c.slug}`, label: c.label })),
  ];
  const cols = [
    { title: 'Shop', items: shop },
    { title: 'Customer care', items: careNav },
    { title: 'About', items: aboutNav },
  ];
  return (
    <footer className={styles.footer}>
      <div className={`${styles.band} leather`} aria-hidden="true">
        <span className={`logo-mask logo-mask--monogram ${styles.stamp}`} />
      </div>

      <div className={`container ${styles.inner}`}>
        <div className={styles.lead}>
          <Link href="/" className={styles.lockupLink} aria-label={`${brand.name} — home`}>
            <span className={`logo-mask logo-mask--lockup ${styles.lockup}`} aria-hidden="true" />
          </Link>
          <p className={styles.muted}>
            {brand.descriptor}.
            <br />A brand of {brand.businessName}.
          </p>
          <ul className={styles.links}>
            <li>
              <a href={brand.contact.phoneHref}>{brand.contact.phoneDisplay}</a>
            </li>
            <li>
              <a href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a>
            </li>
            <li>
              <a href={brand.contact.instagramUrl} target="_blank" rel="noopener noreferrer">
                Instagram {brand.contact.instagramHandle}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>

        <nav className={styles.cols} aria-label="Footer">
          {cols.map((c) => (
            <div key={c.title}>
              <h2 className={styles.heading}>{c.title}</h2>
              <ul className={styles.links}>
                {c.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className={styles.legal}>
          <p>
            © {new Date().getFullYear()} {brand.businessName}. All rights reserved.
          </p>
          <ul className={styles.legalLinks}>
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
          <div className={styles.prefs}>
            <span>Sound</span>
            <SoundControl placement="up" />
          </div>
        </div>
      </div>
    </footer>
  );
}
