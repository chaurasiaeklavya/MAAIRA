import styles from './Footer.module.css';
import { brand } from '@/data/brand';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span className={`logo-mask logo-mask--lockup ${styles.lockup}`} role="img" aria-label="MAAIRA LUXURY logo" />

        <div className={styles.cols}>
          <div>
            <p className={styles.heading}>{brand.name}</p>
            <p className={styles.muted}>
              {brand.descriptor}.<br />A brand of {brand.businessName}.
            </p>
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
                  Instagram<span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className={styles.heading}>This edition</p>
            <p className={styles.muted}>
              A preview selection for presentation. Prices shown as ₹XXXX are placeholders; product details are to be
              confirmed.
            </p>
          </div>
        </div>

        <p className={styles.legal}>
          © {new Date().getFullYear()} {brand.businessName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
