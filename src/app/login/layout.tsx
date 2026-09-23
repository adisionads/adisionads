import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In to Adision | Advertiser & Community Portal',
  description: 'Sign in to your Adision account to manage WhatsApp ad campaigns, real-time click tracking, and wallet payouts.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/login',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
