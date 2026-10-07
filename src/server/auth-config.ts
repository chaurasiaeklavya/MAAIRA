/**
 * Authentication (Better Auth): email + password for customers and staff.
 *
 *  - Passwords hashed with scrypt by Better Auth; never logged or returned.
 *  - Sessions in Postgres, httpOnly cookies (Secure in production), 7 days.
 *  - Origin checks on every state-changing request (CSRF).
 *  - Database-backed rate limits on sign-in, sign-up and password reset.
 *  - `role` (customer | staff | admin) can't be supplied at sign-up; staff
 *    are created with `npm run staff:create`.
 *  - Password reset email only when transactional email is configured.
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import type { Database } from '../db/connect';
import * as schema from '../db/schema';
import { emailConfigured, sendEmail } from './email';

export function siteUrl(env: Record<string, string | undefined> = process.env) {
  return (env.NEXT_PUBLIC_SITE_URL || env.BETTER_AUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function createAuth(db: Database, env: Record<string, string | undefined> = process.env) {
  const secret = env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error('BETTER_AUTH_SECRET must be set (32+ characters).');
  const production = env.NODE_ENV === 'production';

  return betterAuth({
    appName: 'MAAIRA FASHION BAGS',
    secret,
    baseURL: env.BETTER_AUTH_URL || siteUrl(env),
    trustedOrigins: [...new Set([siteUrl(env), env.BETTER_AUTH_URL].filter((o): o is string => Boolean(o)).map((o) => o.replace(/\/$/, '')))],
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification, rateLimit: schema.rateLimit },
    }),
    user: {
      additionalFields: {
        role: { type: 'string', required: false, defaultValue: 'customer', input: false },
      },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
      autoSignIn: true,
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: 60 * 30,
      sendResetPassword: emailConfigured(env)
        ? async ({ user, url }) => {
            await sendEmail({
              to: user.email,
              subject: 'Reset your MAAIRA password',
              intro: 'We received a request to reset your password. The link below is valid for 30 minutes. If you didn’t ask for this, you can ignore this email.',
              action: { label: 'Choose a new password', url },
            });
          }
        : undefined,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    rateLimit: {
      enabled: true,
      storage: 'database',
      window: 60,
      max: 60,
      customRules: {
        '/sign-in/email': { window: 300, max: 8 },
        '/sign-up/email': { window: 3600, max: 5 },
        '/request-password-reset': { window: 3600, max: 3 },
        '/reset-password': { window: 3600, max: 5 },
        '/change-password': { window: 3600, max: 5 },
      },
    },
    advanced: {
      cookiePrefix: 'maaira',
      useSecureCookies: production,
      ipAddress: { ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'] },
    },
    plugins: [nextCookies()],
  });
}

export type Auth = ReturnType<typeof createAuth>;
