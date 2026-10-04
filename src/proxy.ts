import { NextResponse, type NextRequest } from 'next/server';
import { adminConfigured, isAuthorised } from '@/lib/server/admin-auth';

/**
 * Gate for the enquiry admin. Disabled (404) unless ADMIN_USER and
 * ADMIN_PASSWORD are configured; otherwise requires HTTP Basic auth.
 * Handlers re-check authorisation themselves (defence in depth).
 */
export function proxy(request: NextRequest) {
  if (!adminConfigured()) {
    return new NextResponse('Not found', { status: 404 });
  }
  if (!isAuthorised(request.headers.get('authorization'))) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="MAAIRA admin", charset="UTF-8"', 'Cache-Control': 'no-store' },
    });
  }
  const res = NextResponse.next();
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
