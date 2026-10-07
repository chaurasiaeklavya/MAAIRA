'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** While payment confirmation is pending, re-check the order every few seconds (up to two minutes). */
export function OrderAutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const t = window.setInterval(() => {
      n++;
      router.refresh();
      if (n >= 24) window.clearInterval(t);
    }, 5000);
    return () => window.clearInterval(t);
  }, [router]);
  return null;
}
