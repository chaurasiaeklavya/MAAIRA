import { desc } from 'drizzle-orm';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { requireStaffPage } from '@/server/staff';
import styles from '../../admin.module.css';

export const metadata = { title: 'Audit log' };

export default async function AuditAdmin() {
  await requireStaffPage('audit:read');
  const rows = await getDb().select().from(s.auditLog).orderBy(desc(s.auditLog.createdAt)).limit(300);
  return (
    <>
      <h1 className={styles.h1}>Audit log</h1>
      <p className={styles.muted}>The latest 300 staff actions. Entries can’t be edited or deleted from the admin.</p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">When</th>
            <th scope="col">Who</th>
            <th scope="col">Action</th>
            <th scope="col">Target</th>
            <th scope="col">Result</th>
            <th scope="col">Detail</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.createdAt.toLocaleString('en-IN')}</td>
              <td>{r.actorEmail}</td>
              <td>{r.action}</td>
              <td>
                {r.targetType} {r.targetId}
              </td>
              <td>{r.result}</td>
              <td className={styles.detail}>{r.detail ? JSON.stringify(r.detail) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
