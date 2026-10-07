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
  compact = false,
  children,
}: {
  eyebrow: string;
  /** Wrap words in *asterisks* for italics. */
  title: string;
  lede?: ReactNode;
  crumbs?: { href: string; label: string }[];
  align?: 'start' | 'center';
  /** Commerce pages: smaller, no entrance animation, products sooner. */
  compact?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className={`container ${styles.header}`} data-align={align} data-compact={compact || undefined}>
      {crumbs && (
        <nav aria-label="Breadcrumb" className={styles.crumbs}>
          <ol>
            {crumbs.map((c, i) => (
              <li key={c.href}>
                {i < crumbs.length - 1 ? (
                  <Link href={c.href}>
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
      {compact ? (
        <h1 className={`${styles.title} display`}>{title.replace(/\*/g, '')}</h1>
      ) : (
        <RevealText as="h1" className={`${styles.title} display`} trigger="mount" delay={0.15}>
          {title}
        </RevealText>
      )}
      {lede && <div className={styles.lede}>{lede}</div>}
      {children}
    </header>
  );
}
