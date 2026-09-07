'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { UserRole } from '@/types';
import { ShieldAlert, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-dark-900 transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Verifying Session & Permissions...
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Role validation (if specific roles are required)
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = role && allowedRoles.includes(role);

    if (!hasRole) {
      const getCorrectPortal = () => {
        if (role === 'ADVERTISER') return '/advertiser';
        if (role === 'COMMUNITY_PARTNER') return '/partner';
        if (role === 'ADMIN') return '/admin';
        return '/';
      };

      return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-dark-900">
          <Card className="max-w-md w-full text-center p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Access Restricted
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You do not have the required permissions to view this portal.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
              Current Role: <span className="font-bold text-brand-600 dark:text-brand-400 uppercase">{role || 'Unassigned'}</span>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => router.push(getCorrectPortal())}
                variant="primary"
                size="md"
                className="w-full font-bold gap-1.5"
              >
                <span>Go to Your Assigned Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
}
