'use client';

import { motion } from 'motion/react';
import styles from './Contact.module.css';
import { brand, enquiryMailto } from '@/data/brand';

const EASE = [0.22, 1, 0.36, 1] as const;

const CHANNELS = [
  {
    label: 'Email',
    value: brand.contact.email,
    href: enquiryMailto(`Enquiry | ${brand.name}`),
    external: false,
  },
  {
    label: 'Telephone',
    value: brand.contact.phoneDisplay,
    href: brand.contact.phoneHref,
    external: false,
  },
  {
    label: 'Instagram',
    value: brand.contact.instagramHandle,
    href: brand.contact.instagramUrl,
    external: true,
  },
];

export function Contact() {
  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.lead}>
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            Contact
          </motion.p>
          <motion.h2
            id="contact-title"
            className={`${styles.title} display`}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.08, ease: EASE }}
          >
            Enquiries, <em>personally.</em>
          </motion.h2>
          <motion.p
            className={styles.text}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.16, ease: EASE }}
          >
            For questions about the pieces shown here, please reach the house directly.
          </motion.p>
        </div>

        <motion.ul
          className={`${styles.panel} leather stitched`}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
        >
          {CHANNELS.map((c) => (
            <li key={c.label}>
              <a
                className={styles.channel}
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className={styles.label}>{c.label}</span>
                <span className={`${styles.value} display`}>{c.value}</span>
                <svg className={styles.arrow} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.1" />
                </svg>
                {c.external && <span className="visually-hidden"> (opens in a new tab)</span>}
              </a>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
