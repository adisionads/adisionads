import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campaign Packages & Pricing',
  description:
    'Outcome-based pricing for WhatsApp customer acquisition in Nigeria. Pay for reach (₦7,000), qualified signups (₦350), or paying customers (₦750) with verified click tracking, screenshot proof, and safe payment protection.',
  openGraph: {
    title: 'Adision Pricing — WhatsApp Customer Acquisition & Advertising',
    description:
      'Outcome-based advertising starting from ₦7,000. Pay for reach, signups, or paying customers with verified screenshot proof.',
    url: '/pricing',
  },
  twitter: {
    title: 'Adision Pricing — WhatsApp Customer Acquisition & Advertising',
    description:
      'Outcome-based advertising starting from ₦7,000. Verified click tracking and screenshot proof for every group.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
