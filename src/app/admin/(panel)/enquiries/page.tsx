import Link from 'next/link';
import { getDb } from '@/db';
import { ENQUIRY_STATUSES, listEnquiries, type EnquiryStatus } from '@/server/enquiries-repo';
import { requireStaffPage } from '@/server/staff';
import { updateEnquiry } from '../../actions';
import styles from '../../admin.module.css';

export const metadata = { title: 'Enquiries' };

export default async function EnquiriesAdmin({ searchParams }: { searchParams: Promise<{ status?: string; kind?: string }> }) {
  await requireStaffPage('enquiries:write');
  const sp = await searchParams;
  const status = ENQUIRY_STATUSES.includes(sp.status as EnquiryStatus) ? (sp.status as EnquiryStatus) : undefined;
  const kind = sp.kind === 'enquiry' || sp.kind === 'callback' ? sp.kind : undefined;
  const rows = await listEnquiries(getDb(), { status, kind });
  return (
    <>
      <h1 className={styles.h1}>Enquiries &amp; callbacks</h1>
      <nav className={styles.filters} aria-label="Filter enquiries">
        <Link href="/admin/enquiries" aria-current={!status && !kind ? 'page' : undefined}>
          all
        </Link>
        {ENQUIRY_STATUSES.map((s) => (
          <Link key={s} href={`/admin/enquiries?status=${s}`} aria-current={status === s ? 'page' : undefined}>
            {s}
          </Link>
        ))}
        <Link href="/admin/enquiries?kind=callback" aria-current={kind === 'callback' ? 'page' : undefined}>
          callbacks
        </Link>
      </nav>
      {rows.length === 0 ? (
        <p className={styles.muted}>Nothing here yet.</p>
      ) : (
        <ul className={styles.enquiryList}>
          {rows.map((r) => (
            <li key={r.id} className={styles.card}>
              <p>
                <strong>{r.id}</strong> · {r.kind === 'callback' ? 'Callback request' : 'Enquiry'} · {r.createdAt.toLocaleString('en-IN')}{' '}
                <span className={styles.badge} data-tone={r.status}>{r.status}</span>
              </p>
              <p>
                {r.name}
                {r.email && (
                  <>
                    {' '}
                    · <a href={`mailto:${r.email}`} className="text-link">{r.email}</a>
                  </>
                )}
                {r.phone && (
                  <>
                    {' '}
                    · <a href={`tel:${r.phone}`} className="text-link">{r.phone}</a>
                  </>
                )}
              </p>
              {r.productLabel && <p className={styles.muted}>Piece: {r.productLabel}</p>}
              {r.callbackWindow && <p className={styles.muted}>Preferred time: {r.callbackWindow}</p>}
              {r.preferredContact && <p className={styles.muted}>Prefers: {r.preferredContact}</p>}
              {r.message && <p className={styles.message}>{r.message}</p>}
              <form action={updateEnquiry.bind(null, r.id)} className={styles.inline}>
                <label>
                  Status
                  <select name="status" defaultValue={r.status}>
                    {ENQUIRY_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <button type="submit">Update</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
