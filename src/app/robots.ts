import type { MetadataRoute } from 'next';
import { siteUrl } from '@/server/auth-config';

/** Crawling stays closed until NEXT_PUBLIC_ALLOW_INDEXING=true (placeholder prices/unconfirmed data). */
export default function robots(): MetadataRoute.Robots {
  const allow = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';
  return {
    rules: allow
      ? [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/account', '/cart', '/checkout', '/orders', '/wishlist', '/search'] }]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: allow ? `${siteUrl()}/sitemap.xml` : undefined,
  };
}
