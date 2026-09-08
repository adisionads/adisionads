'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import { formatCategoryName, formatCurrency, formatNumber } from '@/lib/utils';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  AlertCircle,
  ArrowRight,
  DollarSign,
  Layers,
  Megaphone,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react';

export default function AdminControlCenter() {
  const { communities, campaigns, proofs, withdrawals } = useApp();

  const pendingCommunities = communities.filter((c) => c.status === 'SUBMITTED');
  const pendingProofs = proofs.filter((p) => p.status === 'PENDING');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'REQUESTED');

  const totalPlatformVolume = campaigns.reduce((sum, c) => sum + c.budget_amount, 0);
  const totalCommissionRevenue = campaigns.reduce(
    (sum, c) => sum + (c.budget_amount * (c.commission_rate / 100)),
    0
  );
  const totalPartnerPayoutPool = campaigns.reduce((sum, c) => sum + c.distributable_pool, 0);
  const totalAudienceReach = communities
    .filter((c) => c.status === 'VERIFIED')
    .reduce((sum, c) => sum + c.member_count, 0);

  return (
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-dark-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-brand-500 text-dark-900 font-extrabold text-[10px] uppercase">
                Staff Only
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                ADISION Operations Control
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage community KYC, campaign distribution matchmaking, proof approvals, escrow payouts, and early waitlist.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/waitlist">
              <Button size="md" variant="outline" className="font-bold gap-2 text-brand-600 dark:text-brand-400 border-brand-500/30">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>Waitlist</span>
              </Button>
            </Link>
            <Link href="/admin/campaigns">
              <Button size="md" variant="primary" className="font-bold gap-2">
                <Layers className="w-4 h-4" />
                <span>Match Campaigns</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Financial & Platform KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Gross Platform Volume"
            value={formatCurrency(totalPlatformVolume)}
            description="Total advertiser budget collected"
            icon={TrendingUp}
            highlight
          />
          <StatsCard
            title="Platform Commission"
            value={formatCurrency(totalCommissionRevenue)}
            description="30% platform margin retained"
            icon={DollarSign}
          />
          <StatsCard
            title="Partner Payout Pool"
            value={formatCurrency(totalPartnerPayoutPool)}
            description="Allocated to verified communities"
            icon={Users}
          />
          <StatsCard
            title="Verified Network Reach"
            value={formatNumber(totalAudienceReach)}
            description="Active WhatsApp audience"
            icon={ShieldCheck}
          />
        </div>

        {/* Action Attention Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Waitlist Banner */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-brand-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
                  Pre-Launch
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Early Waitlist</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View all advertiser and community partner signups with WhatsApp contacts.
              </p>
            </div>
            <Link href="/admin/waitlist" className="pt-4 block">
              <Button size="sm" variant="primary" className="w-full text-xs font-bold gap-1">
                <span>Open Waitlist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>

          {/* Pending Communities KYC */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-brand-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{pendingCommunities.length}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Community KYC Queue</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                New WhatsApp groups waiting for member verification and approval.
              </p>
            </div>
            <Link href="/admin/communities" className="pt-4 block">
              <Button size="sm" variant="outline" className="w-full text-xs font-bold gap-1">
                <span>Review Groups ({pendingCommunities.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>

          {/* Pending Proof Approvals */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-brand-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-brand-600 dark:text-brand-400">{pendingProofs.length}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Proof Approvals</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Placement screenshots submitted by group owners awaiting credit release.
              </p>
            </div>
            <Link href="/admin/proofs" className="pt-4 block">
              <Button size="sm" variant="primary" className="w-full text-xs font-bold gap-1">
                <span>Verify Proofs ({pendingProofs.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>

          {/* Pending Payouts */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-brand-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{pendingWithdrawals.length}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Bank Withdrawals</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Partner withdrawal requests to Nigerian bank accounts (NUBAN).
              </p>
            </div>
            <Link href="/admin/withdrawals" className="pt-4 block">
              <Button size="sm" variant="outline" className="w-full text-xs font-bold gap-1">
                <span>Process Payouts ({pendingWithdrawals.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Live Active Campaigns Overview Table */}
        <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Demand Campaigns</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">All live campaigns currently distributed across network</p>
            </div>
            <Link href="/admin/campaigns">
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                Match Distribution <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Campaign Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Budget / Payout Pool</th>
                  <th className="px-6 py-4">Total Clicks</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                      No active campaigns running yet. Ready for advertiser creation.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{camp.title}</td>
                      <td className="px-6 py-4 text-xs text-brand-600 dark:text-brand-400 font-semibold">
                        {formatCategoryName(camp.category)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{formatCurrency(camp.budget_amount)}</div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Pool: {formatCurrency(camp.distributable_pool)}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{camp.total_clicks || 0}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={camp.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href="/admin/campaigns">
                          <Button size="sm" variant="outline" className="text-xs">
                            Manage
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
