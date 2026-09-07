import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Early Access Waitlist',
  description:
    'Reserve your priority early access spot on Adision. Advertise to targeted Nigerian WhatsApp communities or monetize your WhatsApp group with direct bank payouts.',
  openGraph: {
    title: 'Join the Adision Early Access Waitlist',
    description:
      'The performance marketplace for WhatsApp groups and channels. Connect with real communities or earn from your audience with verified payouts.',
    url: '/waitlist',
  },
  twitter: {
    title: 'Join the Adision Early Access Waitlist',
    description:
      'The performance marketplace for WhatsApp groups and channels. Connect with real communities or earn from your audience.',
  },
};

export default function WaitlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
