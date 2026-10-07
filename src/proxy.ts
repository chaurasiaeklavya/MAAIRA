import { NextResponse, type NextRequest } from 'next/server';

/**
 * First gate for the admin: requests without a session cookie never reach
 * admin pages or APIs. This is a cheap pre-check only — every admin page,
 * server action and API handler verifies the session and role itself.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.getAll().some((c) => /^(__Secure-)?maaira\.session_token$/.test(c.name));
  const isSignIn = pathname === '/admin/sign-in';

  if (!hasSession && !isSignIn) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ ok: false, code: 'unauthorised' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/admin/sign-in';
    url.search = '';
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};
