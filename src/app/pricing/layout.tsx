import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campaign Packages & Pricing',
  description:
    'Transparent pricing packages for WhatsApp advertising in Nigeria. Plans starting from ₦7,000 with verified click tracking, screenshot placement proof, and escrow protection.',
  openGraph: {
    title: 'Adision Pricing — Verified WhatsApp Advertising Packages',
    description:
      'Transparent campaign packages starting from ₦7,000. Reach campus students, tech developers, business founders, and crypto communities with verified proof.',
    url: '/pricing',
  },
  twitter: {
    title: 'Adision Pricing — Verified WhatsApp Advertising Packages',
    description:
      'Transparent campaign packages starting from ₦7,000. Verified click tracking and screenshot proof for every group.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
