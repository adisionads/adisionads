'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { useAuth } from '@/lib/auth/auth-context';
import { authFetch } from '@/lib/auth/auth-fetch';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Campaign } from '@/types';
import { formatCategoryName, formatCurrency, formatNumber } from '@/lib/utils';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  Megaphone,
  MousePointerClick,
  PlusCircle,
  TrendingUp,
  Users,
  RefreshCw,
  Wallet as WalletIcon,
  X,
} from 'lucide-react';

function AdvertiserDashboardContent() {
  const searchParams = useSearchParams();
  const rawPaymentId = searchParams.get('payment_id');
  const rawPaymentRef = searchParams.get('ref');
  const paymentStatus = searchParams.get('payment_status');

  // Robust multi-format parameter extraction (handles any query string formatting)
  let resolvedPaymentId = rawPaymentId;
  let resolvedPaymentRef = rawPaymentRef;
  if (typeof window !== 'undefined') {
    if (!resolvedPaymentId) {
      const match = window.location.href.match(/[?&]payment_id=([^&#]+)/);
      if (match) resolvedPaymentId = decodeURIComponent(match[1]);
    }
    if (!resolvedPaymentRef) {
      const match = window.location.href.match(/[?&]ref=([^&#]+)/);
      if (match) resolvedPaymentRef = decodeURIComponent(match[1]);
    }
  }

  const { campaigns: contextCampaigns } = useApp();
  const { user } = useAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>(contextCampaigns);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentBanner, setPaymentBanner] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured()) {
      setCampaigns(contextCampaigns);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        setCampaigns(data as Campaign[]);
      } else {
        setCampaigns(contextCampaigns);
      }

      // Fetch advertiser wallet balance
      const { data: walletData } = await supabase
        .from('wallets')
        .select('available_balance, lifetime_spent')
        .eq('user_id', user.id)
        .maybeSingle();

      if (walletData) {
        setWalletBalance(Number(walletData.available_balance || 0));
      }
    } catch (err) {
      console.warn('[AdvertiserDashboard] Error loading live campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, contextCampaigns]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Automatically verify payment when returning from PocketFi checkout redirect
  useEffect(() => {
    if (resolvedPaymentId || resolvedPaymentRef || paymentStatus === 'success') {
      const verifyReturn = async () => {
        try {
          const res = await authFetch('/api/campaigns/confirm-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: resolvedPaymentId || undefined,
              reference: resolvedPaymentRef || undefined,
            }),
          });
          const data = await res.json();
          if (data.status === 'PAID' || data.success) {
            setPaymentBanner('🎉 Payment confirmed by PocketFi! Your campaign deposit is secured and your campaign is now active.');
            fetchCampaigns();
            if (typeof window !== 'undefined' && window.history?.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } else {
            setPaymentBanner('Return from payment received. Status: ' + (data.message || 'Settlement in progress...'));
          }
        } catch {
          setPaymentBanner('Return from payment received. Checking status in the background.');
        }
      };

      verifyReturn();
    }
  }, [resolvedPaymentId, resolvedPaymentRef, paymentStatus, fetchCampaigns]);

  const totalClicks = campaigns.reduce((sum, c) => sum + (c.total_clicks || 0), 0);
  const totalUniqueClicks = campaigns.reduce((sum, c) => sum + (c.unique_clicks || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.budget_amount, 0);
  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE').length;

  return (
    <div className="py-8 sm:py-12 bg-dark-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Payment Confirmation Banner */}
        {paymentBanner && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold">{paymentBanner}</span>
            </div>
            <button
              onClick={() => setPaymentBanner(null)}
              className="p-1 rounded-lg text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header with Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Advertiser Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Track your active campaigns, link clicks, and WhatsApp community posts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <WalletIcon className="w-4 h-4 text-brand-400" />
              <span className="text-slate-400">Wallet:</span>
              <span className="font-extrabold text-white">{formatCurrency(walletBalance)}</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={fetchCampaigns}
              disabled={isLoading}
              className="text-xs text-slate-400 hover:text-white gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Link href="/advertiser/campaigns/new">
              <Button size="md" variant="primary" className="font-bold shadow-lg shadow-brand-500/20">
                <PlusCircle className="w-4 h-4" />
                <span>Create New Campaign</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <StatsCard
            title="Wallet Balance"
            value={formatCurrency(walletBalance)}
            description="Available to fund ad campaigns"
            icon={WalletIcon}
            highlight
          />
          <StatsCard
            title="Total Link Clicks"
            value={formatNumber(totalClicks)}
            description={totalClicks > 0 ? `${formatNumber(totalUniqueClicks)} unique visitors` : 'Ready to track'}
            icon={MousePointerClick}
          />
          <StatsCard
            title="Active Campaigns"
            value={activeCampaigns}
            description="Running in verified WhatsApp groups"
            icon={Megaphone}
          />
          <StatsCard
            title="Active Groups"
            value={campaigns.reduce((sum, c) => sum + (c.assigned_count || 0), 0)}
            description="Communities broadcasting your ad"
            icon={Users}
          />
          <StatsCard
            title="Total Ad Spend"
            value={formatCurrency(totalSpent)}
            description="Held safely until ads are posted"
            icon={TrendingUp}
          />
        </div>

        {/* Campaigns Table */}
        <Card className="p-0 overflow-hidden border-slate-800">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Your Campaigns</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time status, payments, and click performance</p>
            </div>
            <Link href="/advertiser/campaigns/new">
              <span className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
                New Campaign <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-60" />
              <h3 className="text-base font-bold text-white">No campaigns created yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-6">
                Launch your first targeted community ad campaign to start receiving clicks and verified placements.
              </p>
              <Link href="/advertiser/campaigns/new">
                <Button size="md" variant="primary" className="font-bold">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  <span>Create Your First Campaign</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[640px]">
                <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Campaign Name & Target</th>
                    <th className="px-6 py-4">Package & Budget</th>
                    <th className="px-6 py-4">Campaign Status</th>
                    <th className="px-6 py-4">Payment Status</th>
                    <th className="px-6 py-4">Clicks (Unique)</th>
                    <th className="px-6 py-4">Communities</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{camp.title}</div>
                        <div className="text-xs text-brand-400 font-medium mt-0.5">
                          {formatCategoryName(camp.category)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{formatCurrency(camp.budget_amount)}</div>
                        <div className="text-xs text-slate-400">{camp.package_name} ({camp.duration_days}d)</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={camp.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            camp.payment_status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {camp.payment_status === 'PAID' ? 'PAID (HELD SAFELY)' : camp.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">
                          {camp.total_clicks || 0}{' '}
                          <span className="text-xs text-slate-400 font-normal">
                            ({camp.unique_clicks || 0} unique)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-300">
                          {camp.assigned_count || 1} Assigned
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/advertiser/campaigns/${camp.id}`}>
                          <Button size="sm" variant="outline" className="gap-1 text-xs">
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Analytics</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function AdvertiserDashboard() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-400 text-xs">Loading dashboard...</div>}>
      <AdvertiserDashboardContent />
    </Suspense>
  );
}
