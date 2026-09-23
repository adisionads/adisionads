import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Free Account | Start Advertising or Monetize WhatsApp',
  description: 'Join Adision to broadcast ads across verified Nigerian WhatsApp groups, or monetize your own WhatsApp community with secure bank payouts.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/signup',
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
