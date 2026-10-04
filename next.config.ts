import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
/** `STATIC_EXPORT=1` emits a static site in out/ (used for the single-file HTML build). */
const isStaticExport = process.env.STATIC_EXPORT === '1';

/**
 * Content Security Policy. Product imagery is delivered from Cloudinary;
 * everything else (fonts, textures, logo) is self-hosted. Inline scripts are
 * required for the pre-paint theme script and Next.js hydration payloads.
 */
const csp = [
  "default-src 'self'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  ...(isProd ? [{ key: 'Content-Security-Policy', value: csp }] : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(isStaticExport
    ? { output: 'export' as const }
    : {
        async headers() {
          return [{ source: '/:path*', headers: securityHeaders }];
        },
      }),
};

export default nextConfig;
