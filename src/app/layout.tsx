import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/store/app-context';
import { AuthProvider } from '@/lib/auth/auth-context';
import { ThemeProvider } from '@/lib/theme/theme-context';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { PWAInstallBanner } from '@/components/shared/PWAInstallBanner';

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const rawUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adision.xyz';
const siteUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`;

let metadataBaseUrl: URL;
try {
  metadataBaseUrl = new URL(siteUrl);
} catch {
  metadataBaseUrl = new URL('https://adision.xyz');
}

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl,
  title: {
    default: 'Adision | Performance Community Advertising Marketplace',
    template: '%s | Adision',
  },
  description:
    'The premier performance advertising marketplace for WhatsApp Groups and Channels in Nigeria. Connect businesses with verified communities, track genuine link clicks, and guarantee secure bank payouts.',
  applicationName: 'Adision',
  authors: [
    { name: 'Rektina', url: 'https://rektina.com' },
    { name: 'Adision', url: siteUrl },
  ],
  creator: 'Rektina',
  publisher: 'Rektina',
  keywords: [
    'WhatsApp advertising Nigeria',
    'WhatsApp marketing marketplace',
    'WhatsApp group ads',
    'WhatsApp channel promotion',
    'monetize WhatsApp group Nigeria',
    'WhatsApp broadcast ads',
    'campus student advertising Nigeria',
    'tech community marketing Nigeria',
    'Nigeria performance marketing',
    'safe payment advertising',
    'Adision',
    'Adision Ads',
    'Adision Nigeria',
    'adision.xyz',
    'Adision platform',
    'Adision marketplace',
    'Adision marketing',
    'Adision WhatsApp',
    'Adision Rektina',
    'Rektina Adision',
    'WhatsApp advertising Nigeria',
    'WhatsApp marketing marketplace',
    'WhatsApp group ads Nigeria',
    'WhatsApp channel promotion Nigeria',
    'monetize WhatsApp group Nigeria',
    'WhatsApp broadcast ads',
    'campus student advertising Nigeria',
    'tech community marketing Nigeria',
    'Nigeria performance marketing',
    'safe payment advertising',
    'PocketFi WhatsApp ads',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: '/',
    siteName: 'Adision',
    title: 'Adision | #1 Performance Advertising Marketplace for WhatsApp Communities',
    description:
      'Broadcast targeted ads across verified WhatsApp groups and channels. Track real human visits with screenshot proof and safe bank payouts.',
    images: [
      {
        url: '/brand/logo-square.jpg',
        width: 800,
        height: 800,
        alt: 'Adision — Community Advertising Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adision | #1 Performance Advertising Marketplace for WhatsApp Communities',
    description:
      'Broadcast targeted ads across verified WhatsApp groups and channels. Track real visits with screenshot proof and safe bank payouts.',
    images: ['/brand/logo-square.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Adision',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Adision',
  alternateName: ['Adision Ads', 'Adision Nigeria', 'Adision.xyz', 'Adision Marketplace'],
  legalName: 'Adision (Owned by Rektina)',
  url: siteUrl,
  logo: `${siteUrl}/brand/logo-square.jpg`,
  image: `${siteUrl}/brand/logo-horizontal.jpg`,
  description:
    'Adision is Nigeria\'s premier performance-driven community advertising marketplace connecting businesses with verified WhatsApp Groups and Channels with guaranteed placement proof and secure payouts.',
  parentOrganization: {
    '@type': 'Organization',
    name: 'Rektina',
    url: 'https://rektina.com',
  },
  sameAs: [
    'https://rektina.com',
    'https://twitter.com/adisionads',
    'https://instagram.com/adisionads',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'adisionads@gmail.com',
    contactType: 'customer support',
    areaServed: 'NG',
    availableLanguage: ['en'],
  },
};

const jsonLdSoftwareApp = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Adision',
  alternateName: 'Adision Community Advertising Platform',
  url: siteUrl,
  applicationCategory: 'BusinessApplication, AdvertisingApplication',
  operatingSystem: 'All (Web Application)',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  description:
    'Adision enables businesses to broadcast targeted campaigns across verified WhatsApp communities and empowers community owners to monetize group broadcasts with guaranteed proof.',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '128',
    bestRating: '5',
    worstRating: '1',
  },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'NGN',
    lowPrice: '50',
    highPrice: '17500',
    offerCount: '4',
  },
  author: {
    '@type': 'Organization',
    name: 'Rektina',
    url: 'https://rektina.com',
  },
};

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Adision',
  alternateName: ['Adision Ads', 'Adision.xyz', 'Adision Marketplace'],
  url: siteUrl,
  inLanguage: 'en-NG',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftwareApp) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body
        className={`${fontSans.className} min-h-screen flex flex-col bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-slate-100 antialiased selection:bg-brand-500 selection:text-dark-900 overflow-x-hidden w-full max-w-full`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <AppProvider>
              <Navbar />
              <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
              <Footer />
              <PWAInstallBanner />
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
