import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create an Account',
  description: 'Join Adision as an Advertiser or Community Partner.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
