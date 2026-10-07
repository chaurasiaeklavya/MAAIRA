import Link from 'next/link';
import styles from '../status.module.css';

export default function NotFound() {
  return (
    <section className={`${styles.status} leather`} aria-labelledby="nf-title">
      <span className={`logo-mask logo-mask--monogram ${styles.mark}`} aria-hidden="true" />
      <p className="eyebrow">404</p>
      <h1 id="nf-title" className={`${styles.title} display`}>
        This page has <em>stepped out.</em>
      </h1>
      <p className={styles.text}>The address may have changed, or the page may not exist yet.</p>
      <div className={styles.actions}>
        <Link href="/" className={styles.primary}>
          Return home
        </Link>
        <Link href="/shop" className={styles.secondary}>
          Shop all bags
        </Link>
      </div>
    </section>
  );
}
