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
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
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
  Trash2,
  Building2,
  ExternalLink,
  Copy,
  AlertCircle,
} from 'lucide-react';

function AdvertiserDashboardContent() {
  const searchParams = useSearchParams();
  const rawPaymentId = searchParams.get('payment_id');
  const rawPaymentRef = searchParams.get('ref');
  const paymentStatus = searchParams.get('payment_status');
  const walletFundedParam = searchParams.get('wallet_funded');

  const { campaigns: contextCampaigns } = useApp();
  const { user } = useAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>(contextCampaigns);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentBanner, setPaymentBanner] = useState<string | null>(null);

  // Fund Wallet State
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState<number>(5000);
  const [isFunding, setIsFunding] = useState(false);
  const [walletCheckoutData, setWalletCheckoutData] = useState<any>(null);
  const [isCheckingWalletStatus, setIsCheckingWalletStatus] = useState(false);
  const [copiedAccountNumber, setCopiedAccountNumber] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Action states for campaigns
  const [verifyingCampaignId, setVerifyingCampaignId] = useState<string | null>(null);
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);

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

      // Automatically sync any pending PocketFi wallet deposits in the background
      try {
        const syncRes = await authFetch('/api/wallet/sync', { method: 'POST' });
        const syncData = await syncRes.json();
        if (syncData.success && typeof syncData.balance === 'number') {
          setWalletBalance(syncData.balance);
          if (syncData.credited_count > 0) {
            setPaymentBanner(`🎉 PocketFi deposit confirmed! Added ₦${syncData.credited_amount.toLocaleString()} to your wallet balance.`);
          }
        }
      } catch {
        // Ignored
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

  // Handle return from PocketFi (both Campaign payments and Wallet deposits)
  useEffect(() => {
    let resolvedPaymentId = rawPaymentId;
    let resolvedPaymentRef = rawPaymentRef;
    let storedPaymentId: string | null = null;

    if (typeof window !== 'undefined') {
      if (!resolvedPaymentId) {
        const match = window.location.href.match(/[?&]payment_id=([^&#]+)/);
        if (match) resolvedPaymentId = decodeURIComponent(match[1]);
      }
      if (!resolvedPaymentRef) {
        const match = window.location.href.match(/[?&]ref=([^&#]+)/);
        if (match) resolvedPaymentRef = decodeURIComponent(match[1]);
      }
      storedPaymentId = localStorage.getItem('adision_pending_pfi_payment');
    }

    const activePaymentId = resolvedPaymentId || storedPaymentId;

    if (activePaymentId || resolvedPaymentRef || paymentStatus === 'success') {
      const verifyReturn = async () => {
        try {
          const res = await authFetch('/api/campaigns/confirm-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: activePaymentId || undefined,
              reference: resolvedPaymentRef || undefined,
            }),
          });
          const data = await res.json();
          if (data.status === 'PAID' || data.success) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('adision_pending_pfi_payment');
            }
            if (data.type === 'WALLET_DEPOSIT') {
              setPaymentBanner(`🎉 Wallet funded! Added ₦${(data.amount || fundAmount).toLocaleString()} to your available balance.`);
            } else {
              setPaymentBanner('🎉 Payment confirmed by PocketFi! Your campaign deposit is secured and your campaign is now active.');
            }
            fetchCampaigns();
            if (typeof window !== 'undefined' && window.history?.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } else if (data.message && !data.message.includes('not found')) {
            setPaymentBanner('Payment status: ' + data.message);
          }
        } catch {
          // Ignored
        }
      };

      verifyReturn();
    }
  }, [rawPaymentId, rawPaymentRef, paymentStatus, walletFundedParam, fetchCampaigns, fundAmount]);

  // Manually check status of any pending campaign
  const handleCheckCampaignPayment = async (camp: Campaign) => {
    setVerifyingCampaignId(camp.id);
    try {
      const paymentId = (camp.virtual_account_details as any)?.payment_id;
      const ref = camp.payment_reference;
      const res = await authFetch('/api/campaigns/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          reference: ref,
        }),
      });
      const data = await res.json();
      if (data.status === 'PAID' || data.success) {
        setPaymentBanner(`🎉 Payment confirmed! Campaign "${camp.title}" is now active.`);
        await fetchCampaigns();
      } else {
        alert(data.message || 'Payment not yet detected by PocketFi. If you just sent the funds, please allow 1-2 minutes for bank settlement.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to check status');
    } finally {
      setVerifyingCampaignId(null);
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    setDeletingCampaignId(id);
    try {
      const res = await authFetch(`/api/advertiser/campaigns/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.status) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
        setPaymentBanner(`Campaign "${title}" has been deleted.`);
      } else {
        alert(data.message || 'Failed to delete campaign');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting campaign');
    } finally {
      setDeletingCampaignId(null);
    }
  };

  // Proceed to Fund Wallet
  const handleProceedFundWallet = async () => {
    if (!fundAmount || fundAmount < 10) {
      alert('Minimum deposit amount is ₦10.');
      return;
    }
    setIsFunding(true);
    try {
      const res = await authFetch('/api/wallet/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: fundAmount }),
      });
      const data = await res.json();
      if (!res.ok || !data.status) {
        throw new Error(data.message || 'Failed to generate deposit link');
      }

      if (typeof window !== 'undefined' && data.data?.payment_id) {
        localStorage.setItem('adision_pending_pfi_payment', data.data.payment_id);
      }

      // 100% In-App: Keep advertiser on Adision and present dedicated Kuda virtual account
      setWalletCheckoutData(data.data);
    } catch (err: any) {
      alert(err.message || 'Failed to initiate deposit. Please try again.');
    } finally {
      setIsFunding(false);
    }
  };

  // Real-time auto-polling for wallet deposit confirmation
  useEffect(() => {
    if (!isFundModalOpen || !walletCheckoutData || depositSuccess) return;

    const interval = setInterval(async () => {
      try {
        const res = await authFetch('/api/wallet/confirm-funding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: walletCheckoutData.payment_id,
            reference: walletCheckoutData.reference,
            amount: walletCheckoutData.amount,
          }),
        });
        const data = await res.json();
        if (data.status || data.success) {
          setDepositSuccess(true);
          setPaymentBanner(`🎉 Deposit confirmed! Added ₦${(data.amount || walletCheckoutData.amount || fundAmount).toLocaleString()} to your wallet.`);
          await fetchCampaigns();
          setTimeout(() => {
            setIsFundModalOpen(false);
            setWalletCheckoutData(null);
            setDepositSuccess(false);
          }, 2400);
        }
      } catch {
        // silent background polling
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isFundModalOpen, walletCheckoutData, depositSuccess, fetchCampaigns, fundAmount]);

  // Manual Check Wallet Deposit Status
  const handleCheckWalletFundingStatus = async () => {
    if (!walletCheckoutData) return;
    setIsCheckingWalletStatus(true);
    try {
      const res = await authFetch('/api/wallet/confirm-funding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: walletCheckoutData.payment_id,
          reference: walletCheckoutData.reference,
          amount: walletCheckoutData.amount,
        }),
      });
      const data = await res.json();
      if (data.status || data.success) {
        setDepositSuccess(true);
        setPaymentBanner(`🎉 Deposit confirmed! Added ₦${(data.amount || fundAmount).toLocaleString()} to your wallet.`);
        await fetchCampaigns();
        setTimeout(() => {
          setIsFundModalOpen(false);
          setWalletCheckoutData(null);
          setDepositSuccess(false);
        }, 2200);
      } else {
        alert(data.message || 'Payment not yet detected by PocketFi. If you just completed the transfer, please allow 1-2 minutes.');
      }
    } catch (err: any) {
      alert(err.message || 'Could not verify deposit right now.');
    } finally {
      setIsCheckingWalletStatus(false);
    }
  };

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

        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Advertiser Dashboard</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Track your campaigns, link clicks, and wallet balance in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Wallet Display & Fund Button */}
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 p-1.5 pl-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <WalletIcon className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="text-slate-400">Balance:</span>
                <span className="font-black text-white text-sm">{formatCurrency(walletBalance)}</span>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setWalletCheckoutData(null);
                  setIsFundModalOpen(true);
                }}
                className="h-8 px-3 font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-dark-950 shadow-md shadow-emerald-500/20 gap-1 shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Fund Wallet</span>
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={fetchCampaigns}
                disabled={isLoading}
                className="flex-1 sm:flex-initial h-9 text-xs text-slate-400 hover:text-white gap-1.5 border-slate-800"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>

              <Link href="/advertiser/campaigns/new" className="flex-1 sm:flex-initial">
                <Button size="md" variant="primary" className="w-full h-9 font-bold shadow-lg shadow-brand-500/20 gap-1.5">
                  <PlusCircle className="w-4 h-4" />
                  <span>New Campaign</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="relative group">
            <StatsCard
              title="Wallet Balance"
              value={formatCurrency(walletBalance)}
              description="Ready to use for campaigns"
              icon={WalletIcon}
              highlight
            />
            <button
              onClick={() => {
                setWalletCheckoutData(null);
                setIsFundModalOpen(true);
              }}
              className="absolute top-4 right-4 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline"
            >
              + Add Funds
            </button>
          </div>
          <StatsCard
            title="Total Link Clicks"
            value={formatNumber(totalClicks)}
            description={totalClicks > 0 ? `${formatNumber(totalUniqueClicks)} unique visitors` : 'Ready to track'}
            icon={MousePointerClick}
          />
          <StatsCard
            title="Active Campaigns"
            value={activeCampaigns}
            description="Broadcasting in groups"
            icon={Megaphone}
          />
          <StatsCard
            title="Active Groups"
            value={campaigns.reduce((sum, c) => sum + (c.assigned_count || 0), 0)}
            description="WhatsApp communities assigned"
            icon={Users}
          />
          <StatsCard
            title="Total Ad Spend"
            value={formatCurrency(totalSpent)}
            description="Campaign deposits safely held"
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
                Launch your first targeted WhatsApp community ad campaign to start receiving verified clicks and customers.
              </p>
              <Link href="/advertiser/campaigns/new">
                <Button size="md" variant="primary" className="font-bold">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  <span>Create Your First Campaign</span>
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile Campaign Cards (Shown only on phones/small screens) */}
              <div className="block md:hidden divide-y divide-slate-800/80">
                {campaigns.map((camp) => {
                  const isPending = camp.payment_status !== 'PAID';
                  const paymentLink = (camp.virtual_account_details as any)?.payment_link;

                  return (
                    <div key={camp.id} className="p-4 space-y-3 hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white text-sm truncate">{camp.title}</div>
                          <div className="text-xs text-brand-400 font-medium">
                            {formatCategoryName(camp.category)}
                          </div>
                        </div>
                        <StatusBadge status={camp.status} />
                      </div>

                      <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                        <div>
                          <span className="text-slate-400">Budget: </span>
                          <span className="font-bold text-white">{formatCurrency(camp.budget_amount)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Clicks: </span>
                          <span className="font-bold text-white">{camp.total_clicks || 0}</span>
                          <span className="text-slate-500 text-[10px]"> ({camp.unique_clicks || 0} unique)</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              !isPending
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {!isPending ? 'PAID' : 'PENDING'}
                          </span>
                          {isPending && paymentLink && (
                            <a
                              href={paymentLink}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-[11px] text-brand-400 hover:underline font-semibold mt-1"
                            >
                              Pay ₦{camp.budget_amount} →
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 ml-auto">
                          {isPending && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCheckCampaignPayment(camp)}
                              disabled={verifyingCampaignId === camp.id}
                              className="gap-1 text-[11px] border-amber-500/40 text-amber-300 hover:bg-amber-500/10 h-7 px-2"
                            >
                              <RefreshCw className={`w-3 h-3 ${verifyingCampaignId === camp.id ? 'animate-spin' : ''}`} />
                              <span>Status</span>
                            </Button>
                          )}

                          <Link href={`/advertiser/campaigns/${camp.id}`}>
                            <Button size="sm" variant="outline" className="gap-1 text-[11px] h-7 px-2 border-slate-700">
                              <Eye className="w-3 h-3" />
                              <span>Analytics</span>
                            </Button>
                          </Link>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCampaign(camp.id, camp.title)}
                            disabled={deletingCampaignId === camp.id}
                            className="h-7 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                            title="Delete Campaign"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Campaign Table (Shown only on tablets/desktop) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[700px]">
                  <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Campaign Name & Target</th>
                      <th className="px-6 py-4">Package & Budget</th>
                      <th className="px-6 py-4">Campaign Status</th>
                      <th className="px-6 py-4">Payment Status</th>
                      <th className="px-6 py-4">Clicks (Unique)</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {campaigns.map((camp) => {
                      const isPending = camp.payment_status !== 'PAID';
                      const paymentLink = (camp.virtual_account_details as any)?.payment_link;

                      return (
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
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                  !isPending
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}
                              >
                                {!isPending ? 'PAID (HELD SAFELY)' : 'PAYMENT PENDING'}
                              </span>

                              {isPending && paymentLink && (
                                <a
                                  href={paymentLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block text-[11px] text-brand-400 hover:underline font-semibold"
                                >
                                  Pay ₦{camp.budget_amount} on PocketFi →
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">
                              {camp.total_clicks || 0}{' '}
                              <span className="text-xs text-slate-400 font-normal">
                                ({camp.unique_clicks || 0} unique)
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isPending && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCheckCampaignPayment(camp)}
                                  disabled={verifyingCampaignId === camp.id}
                                  className="gap-1 text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10 h-8"
                                  title="Check if PocketFi payment has cleared"
                                >
                                  <RefreshCw className={`w-3 h-3 ${verifyingCampaignId === camp.id ? 'animate-spin' : ''}`} />
                                  <span>Check Status</span>
                                </Button>
                              )}

                              <Link href={`/advertiser/campaigns/${camp.id}`}>
                                <Button size="sm" variant="outline" className="gap-1 text-xs h-8 border-slate-700">
                                  <Eye className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Analytics</span>
                                </Button>
                              </Link>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteCampaign(camp.id, camp.title)}
                                disabled={deletingCampaignId === camp.id}
                                className="h-8 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                title="Delete Campaign"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* FUND WALLET MODAL */}
      <Modal
        isOpen={isFundModalOpen}
        onClose={() => {
          setIsFundModalOpen(false);
          setWalletCheckoutData(null);
        }}
        title="Fund Your Adision Wallet"
        description="Add funds to your balance to run ad campaigns anytime. Secured by PocketFi."
        maxWidth="md"
      >
        <div className="space-y-6">
          {!walletCheckoutData ? (
            <div className="space-y-4">
              {/* Quick preset amount chips */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Select Quick Amount
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2000, 5000, 10000, 25000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFundAmount(amt)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        fundAmount === amt
                          ? 'border-brand-500 bg-brand-500/20 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount input */}
              <Input
                label="Or Enter Custom Amount (₦)"
                type="number"
                min={10}
                value={fundAmount || ''}
                onChange={(e) => setFundAmount(Number(e.target.value))}
                helperText="Minimum deposit: ₦10. Your funds never expire."
                required
              />

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                <span className="font-bold text-white block">Payment Method:</span>
                <p>Direct Bank Transfer (SafeHaven MFB / Kuda) — Instant Automated Settlement.</p>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsFundModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleProceedFundWallet}
                  isLoading={isFunding}
                  className="font-bold gap-1.5 shadow-lg shadow-brand-500/20"
                >
                  <span>{isFunding ? 'Generating Bank Details...' : `Continue (₦${fundAmount.toLocaleString()})`}</span>
                  {!isFunding && <ArrowRight className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          ) : depositSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-white">Deposit Confirmed!</h3>
              <p className="text-sm text-emerald-400 font-medium">
                ₦{(walletCheckoutData?.amount || fundAmount).toLocaleString()} has been credited to your Adision wallet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Deposit Amount:</span>
                  <div className="text-2xl font-black text-brand-400">
                    ₦{walletCheckoutData.amount?.toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-400">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              {walletCheckoutData.virtual_account && (
                <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Bank Name:</span>
                    <span className="font-bold text-white">
                      {walletCheckoutData.virtual_account.bank_name || 'SafeHaven MFB'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-slate-900">
                    <span className="text-slate-400">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-brand-400">
                        {walletCheckoutData.virtual_account.account_number}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const acc = walletCheckoutData.virtual_account.account_number;
                          if (acc) {
                            navigator.clipboard?.writeText(acc);
                            setCopiedAccountNumber(true);
                            setTimeout(() => setCopiedAccountNumber(false), 2000);
                          }
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Copy Account Number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-slate-900">
                    <span className="text-slate-400">Account Name:</span>
                    <span className="font-bold text-white">
                      {walletCheckoutData.virtual_account.account_name || 'Adision Wallet'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-slate-900">
                    <span className="text-slate-400">Payment Reference:</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {walletCheckoutData.reference || 'Pending'}
                    </span>
                  </div>
                </div>
              )}

              {copiedAccountNumber && (
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs text-center font-semibold">
                  Account Number copied to clipboard!
                </div>
              )}

              {/* Real-time listening indicator */}
              <div className="p-3.5 rounded-xl bg-brand-500/5 border border-brand-500/20 flex items-center gap-3">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Listening for transfer in real-time. Transfer from any Nigerian bank app (Kuda, OPay, GTBank, Zenith, etc.) and your wallet will update automatically.
                </p>
              </div>

              <Button
                type="button"
                size="md"
                variant="outline"
                onClick={handleCheckWalletFundingStatus}
                isLoading={isCheckingWalletStatus}
                className="w-full font-bold gap-2 text-slate-200 border-slate-700 hover:bg-slate-800 py-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>I Have Completed the Transfer — Check Status</span>
              </Button>

              <p className="text-[11px] text-center text-slate-500">
                🔒 Protected by <strong>PocketFi</strong>. Funds are credited directly to your Adision balance.
              </p>
            </div>
          )}
        </div>
      </Modal>
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
