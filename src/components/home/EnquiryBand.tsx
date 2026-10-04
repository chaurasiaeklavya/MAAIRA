import Link from 'next/link';
import styles from './EnquiryBand.module.css';
import { brand } from '@/data/brand';

/** Closing call to action: the two genuine ways to engage with the house today. */
export function EnquiryBand() {
  return (
    <section className={`${styles.band} leather`} aria-labelledby="enquiry-band-title">
      <div className={`container ${styles.inner}`}>
        <div>
          <p className="eyebrow">Enquiries</p>
          <h2 id="enquiry-band-title" className={`${styles.title} display`}>
            Ask about a piece, <em>personally.</em>
          </h2>
        </div>
        <div className={styles.actions}>
          <Link href="/contact" className={styles.primary} transitionTypes={['nav-forward']}>
            Send an enquiry
          </Link>
          <Link href="/contact?mode=callback" className={styles.secondary} transitionTypes={['nav-forward']}>
            Request a callback
          </Link>
          <a href={brand.contact.phoneHref} className={styles.phone}>
            {brand.contact.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}
