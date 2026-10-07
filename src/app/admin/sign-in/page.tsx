import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/account/AuthForm';
import { SignOutButton } from '@/components/account/SignOutButton';
import { currentUser } from '@/server/auth';
import { can } from '@/server/staff';
import styles from '../admin.module.css';

export const metadata = { title: 'Staff sign in' };

export default async function StaffSignIn() {
  const user = await currentUser();
  if (can(user, 'admin:view')) redirect('/admin');
  return (
    <div className={styles.signin}>
      <span className={`logo-mask logo-mask--lockup ${styles.signinLogo}`} aria-hidden="true" />
      <h1 className={styles.h1}>Staff sign in</h1>
      {user ? (
        <>
          <p>This account doesn’t have staff access.</p>
          <SignOutButton to="/admin/sign-in" />
        </>
      ) : (
        <AuthForm mode="sign-in" next="/admin" staff />
      )}
    </div>
  );
}
