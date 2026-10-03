/**
 * Brand facts supplied by the client in the master brief.
 * Everything here is client-provided; items marked `requiresVerification`
 * must be confirmed by the client before public release.
 */
export const brand = {
  name: 'MAAIRA FASHION BAGS',
  /** Logo lockup text — a visual treatment, never used as a business name. */
  logoLockup: 'MAAIRA LUXURY',
  businessName: 'Maanya Enterprises',
  descriptor: 'Manufacturer of Luxury Designer Handbags',
  contact: {
    email: 'maairabags@gmail.com',
    phoneDisplay: '+91 98711 71112',
    phoneHref: 'tel:+919871171112',
    instagramHandle: '@maairafashionbags',
    instagramUrl: 'https://www.instagram.com/maairafashionbags',
    /**
     * WhatsApp click-to-chat stays disabled until the client confirms the
     * number is WhatsApp-enabled (master brief §8.7).
     */
    whatsappEnabled: false,
  },
  /** Supplied credentials — display exactly as provided. */
  credentials: [
    {
      id: 'award',
      lead: 'Won',
      value: 'Most Elegant Bags Award',
      requiresVerification: true,
    },
    {
      id: 'delivered',
      lead: 'Delivered',
      value: '10,00,000+',
      unit: 'Bags',
      requiresVerification: true,
    },
  ],
} as const;

export function enquiryMailto(subject: string, body?: string) {
  const params = new URLSearchParams({ subject });
  if (body) params.set('body', body);
  // URLSearchParams encodes spaces as "+", which some mail clients show literally.
  return `mailto:${brand.contact.email}?${params.toString().replace(/\+/g, '%20')}`;
}
