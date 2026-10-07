/** Static site map shared by the header, footer and sitemap. Shop categories are added from live data. */
export interface NavItem {
  href: string;
  label: string;
}

export const primaryNav: NavItem[] = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export const careNav: NavItem[] = [
  { href: '/contact', label: 'Contact us' },
  { href: '/contact?mode=callback', label: 'Request a call back' },
  { href: '/client-services', label: 'FAQs' },
  { href: '/client-services/shipping', label: 'Shipping' },
  { href: '/client-services/returns', label: 'Returns & refunds' },
  { href: '/client-services/cancellation', label: 'Cancellation' },
];

export const aboutNav: NavItem[] = [
  { href: '/about', label: 'About MAAIRA' },
  { href: '/editorial', label: 'Editorial' },
];

export const legalNav: NavItem[] = [
  { href: '/client-services/privacy', label: 'Privacy' },
  { href: '/client-services/terms', label: 'Terms' },
  { href: '/client-services/cookies', label: 'Cookies' },
];
