import { getDb } from '@/db';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { razorpayConfig, isLiveMode } from '@/server/commerce/razorpay';
import { checkoutReadiness, loadSettings } from '@/server/commerce/settings';
import { emailConfigured } from '@/server/email';
import { requireStaffPage } from '@/server/staff';
import styles from '../../admin.module.css';

export const metadata = { title: 'Store settings' };

export default async function SettingsAdmin() {
  await requireStaffPage('settings:write');
  const settings = await loadSettings(getDb());
  const rp = razorpayConfig();
  const readiness = checkoutReadiness(settings, rp !== null);
  return (
    <>
      <h1 className={styles.h1}>Store settings</h1>
      <div className={styles.split}>
        <section className={styles.card}>
          <h2 className={styles.h2}>Checkout rules</h2>
          <SettingsForm
            initial={{
              checkoutEnabled: settings.checkoutEnabled,
              shippingFee: settings.shippingFlatPaise === null ? '' : String(settings.shippingFlatPaise / 100),
              taxInclusive: settings.taxMode === 'inclusive',
              policiesApproved: settings.policiesApproved,
            }}
          />
        </section>
        <section className={styles.card}>
          <h2 className={styles.h2}>Integrations (from the server environment)</h2>
          <ul className={styles.stack}>
            <li>
              Payments (Razorpay): {rp ? <strong>{isLiveMode(rp) ? 'live keys' : 'test keys'}</strong> : <strong>not configured</strong>}
              {rp && !rp.webhookSecret && ' — webhook secret missing'}
            </li>
            <li>Transactional email (Resend): {emailConfigured() ? 'configured' : 'not configured'}</li>
          </ul>
          <h2 className={styles.h2}>Readiness</h2>
          {readiness.ready ? (
            <p className={styles.good}>Checkout is open.</p>
          ) : (
            <ul className={styles.blockers}>
              {readiness.blockers.map((b) => (
                <li key={b.key}>{b.label}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
