import Link from 'next/link';
import { SignOutButton } from '@/components/account/SignOutButton';
import { AdminNav } from '@/components/admin/AdminNav';
import { can, requireStaffPage } from '@/server/staff';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaffPage();
  const items = [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/media', label: 'Photographs' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/enquiries', label: 'Enquiries' },
    ...(can(user, 'settings:write') ? [{ href: '/admin/settings', label: 'Store settings' }] : []),
    ...(can(user, 'audit:read') ? [{ href: '/admin/audit', label: 'Audit log' }] : []),
  ];
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.brand}>
          MAAIRA <span>admin</span>
        </Link>
        <AdminNav items={items} />
        <div className={styles.who}>
          <p>
            {user.name}
            <br />
            <span className={styles.muted}>
              {user.email} · {user.role}
            </span>
          </p>
          <Link href="/" className="text-link">
            View store
          </Link>
          <SignOutButton to="/admin/sign-in" />
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
