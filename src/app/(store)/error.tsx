'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import styles from '../status.module.css';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[page] render error', error.digest ?? error.message);
  }, [error]);
  return (
    <section className={`${styles.status} leather`} aria-labelledby="err-title">
      <span className={`logo-mask logo-mask--monogram ${styles.mark}`} aria-hidden="true" />
      <p className="eyebrow">Something went wrong</p>
      <h1 id="err-title" className={`${styles.title} display`}>
        This page couldn’t be <em>shown.</em>
      </h1>
      <p className={styles.text}>Please try again. If it keeps happening, call the house on +91 98711 71112 — nothing in your cart has been lost.</p>
      <div className={styles.actions}>
        <button type="button" onClick={reset} className={styles.primary}>
          Try again
        </button>
        <Link href="/" className={styles.secondary}>
          Return home
        </Link>
      </div>
    </section>
  );
}
