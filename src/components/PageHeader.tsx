import Link from 'next/link';
import type { ReactNode } from 'react';
import { RevealText } from './motion/RevealText';
import styles from './PageHeader.module.css';

/** Opening block for inner pages: breadcrumb, eyebrow, masked title, lede. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  crumbs,
  align = 'start',
  children,
}: {
  eyebrow: string;
  /** Wrap words in *asterisks* for italics. */
  title: string;
  lede?: ReactNode;
  crumbs?: { href: string; label: string }[];
  align?: 'start' | 'center';
  children?: ReactNode;
}) {
  return (
    <header className={`container ${styles.header}`} data-align={align}>
      {crumbs && (
        <nav aria-label="Breadcrumb" className={styles.crumbs}>
          <ol>
            {crumbs.map((c, i) => (
              <li key={c.href}>
                {i < crumbs.length - 1 ? (
                  <Link href={c.href} transitionTypes={['nav-back']}>
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page">{c.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <p className="eyebrow">{eyebrow}</p>
      <RevealText as="h1" className={`${styles.title} display`} trigger="mount" delay={0.15}>
        {title}
      </RevealText>
      {lede && <div className={styles.lede}>{lede}</div>}
      {children}
    </header>
  );
}
