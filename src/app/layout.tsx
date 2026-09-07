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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adisionads.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Adision | Performance Community Advertising Marketplace',
    template: '%s | Adision',
  },
  description:
    'The premier performance advertising marketplace for WhatsApp Groups and Channels in Nigeria. Connect businesses with verified communities, track genuine link clicks, and guarantee secure bank payouts.',
  applicationName: 'Adision',
  authors: [{ name: 'Adision', url: siteUrl }],
  creator: 'Adision',
  publisher: 'Adision',
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
    'community advertising network',
    'escrow protected advertising',
    'Adision',
    'Adision ads',
    'Adision Nigeria',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: '/',
    siteName: 'Adision',
    title: 'Adision | Reach Real Communities on WhatsApp',
    description:
      'Run targeted ads across verified WhatsApp groups and channels. Track real visits with screenshot proof and secure escrow payouts.',
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
    title: 'Adision | Reach Real Communities on WhatsApp',
    description:
      'Run targeted ads across verified WhatsApp groups and channels. Track real visits with screenshot proof.',
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
  url: siteUrl,
  logo: `${siteUrl}/brand/logo-square.jpg`,
  description:
    'Performance-driven Community Advertising Marketplace connecting businesses with verified WhatsApp Groups and Channels.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'adisionads@gmail.com',
    contactType: 'customer support',
  },
};

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Adision',
  url: siteUrl,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body className={`${fontSans.className} min-h-screen flex flex-col bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-slate-100 antialiased selection:bg-brand-500 selection:text-dark-900`}>
        <ThemeProvider>
          <AuthProvider>
            <AppProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <PWAInstallBanner />
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
