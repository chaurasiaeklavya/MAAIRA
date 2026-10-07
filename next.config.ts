import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Content Security Policy for the real application:
 *  - product imagery from Cloudinary;
 *  - Razorpay Checkout (script, its iframe and API calls) on the checkout page;
 *  - everything else self-hosted. Inline scripts are needed for the
 *    pre-paint theme script and Next.js hydration payloads.
 */
const csp = [
  "default-src 'self'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.razorpay.com",
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
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
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.razorpay.com" "https://api.razorpay.com")' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  ...(isProd
    ? [
        { key: 'Content-Security-Policy', value: csp },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      ]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ['postgres'],
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
  async redirects() {
    return [
      { source: '/house', destination: '/about', permanent: true },
      { source: '/client-services/shipping-returns', destination: '/client-services/shipping', permanent: true },
    ];
  },
};

export default nextConfig;
