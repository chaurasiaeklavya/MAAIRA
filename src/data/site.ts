/** Site map shared by the header, footer, menu and sitemap. */
export interface NavItem {
  href: string;
  label: string;
}

export const primaryNav: NavItem[] = [
  { href: '/shop', label: 'Shop' },
  { href: '/house', label: 'The House' },
  { href: '/editorial', label: 'Editorial' },
  { href: '/contact', label: 'Contact' },
];

export const serviceNav: NavItem[] = [
  { href: '/client-services', label: 'Client services' },
  { href: '/client-services/shipping-returns', label: 'Shipping & returns' },
  { href: '/client-services/privacy', label: 'Privacy' },
  { href: '/client-services/terms', label: 'Terms' },
];

/** Hierarchy depth used to pick a forward/back direction for page transitions. */
export function routeDepth(pathname: string) {
  if (pathname === '/') return 0;
  return pathname.split('/').filter(Boolean).length;
}
