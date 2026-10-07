'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

export function SignOutButton({ to = '/' }: { to?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="btn btn--secondary"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await authClient.signOut().catch(() => {});
        router.replace(to);
        router.refresh();
      }}
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
