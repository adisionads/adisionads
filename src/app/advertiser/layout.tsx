import React from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';

export default function AdvertiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={['ADVERTISER', 'ADMIN']}>
      {children}
    </AuthGuard>
  );
}
