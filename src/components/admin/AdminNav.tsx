'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/app/admin/admin.module.css';

export function AdminNav({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin">
      <ul className={styles.nav}>
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} aria-current={(i.href === '/admin' ? path === '/admin' : path.startsWith(i.href)) ? 'page' : undefined}>
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
