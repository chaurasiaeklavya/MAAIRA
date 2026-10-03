import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/cormorant-garamond/wght.css';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import '@fontsource-variable/jost/wght.css';
import './globals.css';
import { ExperienceProvider } from '@/components/ExperienceProvider';
import { brand } from '@/data/brand';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
// The showcase uses placeholder prices, so it stays out of search indexes until approved.
const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${brand.name} — ${brand.descriptor}`,
  description: `${brand.name} by ${brand.businessName}. ${brand.descriptor}. A first look at selected pieces from the house.`,
  applicationName: brand.name,
  robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: brand.name,
    title: brand.name,
    description: brand.descriptor,
    images: [{ url: '/brand/maaira-logo-original.jpg', width: 1080, height: 1080, alt: 'MAAIRA LUXURY logo' }],
  },
  twitter: { card: 'summary', title: brand.name, description: brand.descriptor },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#17110e' },
    { media: '(prefers-color-scheme: light)', color: '#f6f1e9' },
  ],
};

/** Applied before first paint so the chosen theme never flashes. */
const themeScript = `(function(){try{var t=localStorage.getItem('maaira-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <ExperienceProvider>{children}</ExperienceProvider>
      </body>
    </html>
  );
}
