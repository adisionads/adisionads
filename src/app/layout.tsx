import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store/app-context';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: 'Adision | Performance-Driven Community Advertising Marketplace',
  description:
    'Connect your brand with verified WhatsApp Groups and Channels. Distribute targeted campaigns, track real click performance, and empower community monetization.',
  icons: {
    icon: '/brand/logo-square.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-dark-900 text-slate-100 antialiased selection:bg-brand-500 selection:text-dark-900">
        <AppProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}

