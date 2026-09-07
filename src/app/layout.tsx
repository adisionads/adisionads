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

export const metadata: Metadata = {
  title: 'Adision | Reach Real Communities on WhatsApp',
  description:
    'Run targeted ads across verified WhatsApp groups and channels. Track real visits, protect funds in escrow, and empower community monetization.',
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
