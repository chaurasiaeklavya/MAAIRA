import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { updateStatusAction } from './actions';
import styles from './admin.module.css';
import { adminConfigured, isAuthorised } from '@/lib/server/admin-auth';
import { notifierConfigured } from '@/lib/server/notify';
import { ENQUIRY_STATUSES, getStore, type EnquiryRecord } from '@/lib/server/store';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Enquiries (admin)', robots: { index: false, follow: false } };

const fmt = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });

export default async function AdminEnquiries({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; status?: string }>;
}) {
  // Defence in depth: the proxy already gates this route.
  if (!adminConfigured() || !isAuthorised((await headers()).get('authorization'))) notFound();

  const { kind, status } = await searchParams;
  const store = getStore();
  const all: EnquiryRecord[] = store ? await store.list() : [];
  const rows = all.filter((r) => (!kind || r.kind === kind) && (!status || r.status === status));
  const counts = Object.fromEntries(ENQUIRY_STATUSES.map((s) => [s, all.filter((r) => r.status === s).length]));

  return (
    <div className={`container ${styles.admin}`}>
      <header className={styles.head}>
        <h1 className="display">Enquiries</h1>
        <p className={styles.meta}>
          Store: <strong>{store?.kind ?? 'not configured'}</strong> · Email notifications:{' '}
          <strong>{notifierConfigured() ? 'on' : 'off'}</strong> · {all.length} total · {counts.new} new
        </p>
        <form className={styles.filters} method="get">
          <label>
            Type
            <select name="kind" defaultValue={kind ?? ''}>
              <option value="">All</option>
              <option value="enquiry">Enquiries</option>
              <option value="callback">Callbacks</option>
            </select>
          </label>
          <label>
            Status
            <select name="status" defaultValue={status ?? ''}>
              <option value="">All</option>
              {ENQUIRY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Filter</button>
        </form>
      </header>

      {!store && <p className={styles.empty}>No enquiry store is configured. See README → Enquiries.</p>}
      {store && rows.length === 0 && <p className={styles.empty}>No requests match.</p>}

      {rows.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Received</th>
                <th scope="col">Reference</th>
                <th scope="col">Type</th>
                <th scope="col">Name</th>
                <th scope="col">Contact</th>
                <th scope="col">Piece</th>
                <th scope="col">Message / preference</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{fmt.format(new Date(r.createdAt))}</td>
                  <td className={styles.mono}>{r.id}</td>
                  <td>{r.kind === 'callback' ? 'Callback' : 'Enquiry'}</td>
                  <td>{r.name}</td>
                  <td>
                    {r.email && <a href={`mailto:${r.email}`}>{r.email}</a>}
                    {r.email && r.phone && <br />}
                    {r.phone && <a href={`tel:${r.phone}`}>{r.phone}</a>}
                  </td>
                  <td>{r.pieceName ?? 'General'}</td>
                  <td className={styles.message}>
                    {r.message}
                    {(r.preferredContact || r.callbackWindow) && (
                      <span className={styles.pref}>
                        {r.preferredContact && `Prefers ${r.preferredContact}`}
                        {r.callbackWindow && `Preferred time: ${r.callbackWindow}`}
                      </span>
                    )}
                  </td>
                  <td>
                    <form action={updateStatusAction} className={styles.statusForm}>
                      <input type="hidden" name="id" value={r.id} />
                      <label className="visually-hidden" htmlFor={`status-${r.id}`}>
                        Status for {r.id}
                      </label>
                      <select id={`status-${r.id}`} name="status" defaultValue={r.status}>
                        {ENQUIRY_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button type="submit">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
