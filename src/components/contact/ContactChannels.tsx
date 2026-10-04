import styles from './ContactChannels.module.css';
import { brand, enquiryMailto } from '@/data/brand';

const CHANNELS = [
  { label: 'Email', value: brand.contact.email, href: enquiryMailto(`Enquiry | ${brand.name}`), external: false },
  { label: 'Telephone', value: brand.contact.phoneDisplay, href: brand.contact.phoneHref, external: false },
  { label: 'Instagram', value: brand.contact.instagramHandle, href: brand.contact.instagramUrl, external: true },
];

/** Verified, client-supplied contact routes. WhatsApp is omitted until the number is confirmed. */
export function ContactChannels() {
  return (
    <div className={`${styles.panel} leather stitched`}>
      <ul>
        {CHANNELS.map((c) => (
          <li key={c.label}>
            <a className={styles.channel} href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              <span className={styles.label}>{c.label}</span>
              <span className={`${styles.value} display`}>{c.value}</span>
              <svg className={styles.arrow} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.1" />
              </svg>
              {c.external && <span className="visually-hidden"> (opens in a new tab)</span>}
            </a>
          </li>
        ))}
      </ul>
      <p className={styles.business}>
        {brand.name} · {brand.businessName}
      </p>
    </div>
  );
}
