import React from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={['COMMUNITY_PARTNER', 'ADMIN']}>
      {children}
    </AuthGuard>
  );
}
