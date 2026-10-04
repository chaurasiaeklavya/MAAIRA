import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './ServiceLayout.module.css';
import { serviceNav } from '@/data/site';

/** Shared frame for client-service pages: section nav + readable prose column. */
export function ServiceLayout({ current, children }: { current: string; children: ReactNode }) {
  return (
    <div className={`container ${styles.layout}`}>
      <nav className={styles.nav} aria-label="Client services">
        <ul>
          {serviceNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} aria-current={item.href === current ? 'page' : undefined}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.prose}>{children}</div>
    </div>
  );
}

/** Visible notice that a policy page is not yet approved or in force. */
export function DraftNotice({ children }: { children?: ReactNode }) {
  return (
    <div className={styles.draft} role="note">
      <strong>Draft — awaiting approval.</strong>{' '}
      {children ?? 'This page is a placeholder for the business’s approved policy. It is not a published policy and makes no commitment.'}
    </div>
  );
}

export function Pending({ children = 'To be provided by Maanya Enterprises.' }: { children?: ReactNode }) {
  return <p className={styles.pending}>{children}</p>;
}
