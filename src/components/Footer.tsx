import Link from 'next/link';
import styles from './Footer.module.css';
import { brand } from '@/data/brand';
import { primaryNav, serviceNav } from '@/data/site';

export function Footer() {
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
        </div>

        <nav className={styles.cols} aria-label="Footer">
          <div>
            <p className={styles.heading}>The house</p>
            <ul className={styles.links}>
              <li>
                <Link href="/">Home</Link>
              </li>
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={styles.heading}>Client services</p>
            <ul className={styles.links}>
              {serviceNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={styles.heading}>Contact</p>
            <ul className={styles.links}>
              <li>
                <a href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a>
              </li>
              <li>
                <a href={brand.contact.phoneHref}>{brand.contact.phoneDisplay}</a>
              </li>
              <li>
                <a href={brand.contact.instagramUrl} target="_blank" rel="noopener noreferrer">
                  Instagram {brand.contact.instagramHandle}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className={styles.legal}>
          <p>
            © {new Date().getFullYear()} {brand.businessName}. All rights reserved.
          </p>
          <p>Preview edition — prices shown as ₹XXXX are placeholders; product details are to be confirmed.</p>
        </div>
      </div>
    </footer>
  );
}
