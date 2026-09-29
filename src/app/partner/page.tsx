'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import { formatCategoryName, formatCurrency, formatNumber } from '@/lib/utils';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ReferralCard } from '@/components/referrals/ReferralCard';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  DollarSign,
  PlusCircle,
  Users,
  Wallet as WalletIcon,
} from 'lucide-react';

export default function PartnerDashboard() {
  const { wallet, communities, assignments } = useApp();

  const activeAssignments = assignments.filter((a) => a.status === 'ASSIGNED' || a.status === 'ACCEPTED');
  const verifiedCommunities = communities.filter((c) => c.status === 'VERIFIED');

  return (
    <div className="py-8 sm:py-12 bg-dark-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Partner Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your WhatsApp groups, accept paid ad jobs, and withdraw your earnings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/partner/communities">
              <Button size="md" variant="outline" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                <span>Add Community</span>
              </Button>
            </Link>
            <Link href="/partner/wallet">
              <Button size="md" variant="primary" className="gap-2 font-bold shadow-lg shadow-brand-500/20">
                <WalletIcon className="w-4 h-4" />
                <span>Withdraw Cash</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Earnings & Performance KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Available Balance"
            value={formatCurrency(wallet.available_balance)}
            description="Ready for instant bank withdrawal"
            icon={WalletIcon}
            highlight
          />
          <StatsCard
            title="Pending Earnings"
            value={formatCurrency(wallet.pending_balance)}
            description="Under proof verification review"
            icon={Clock}
          />
          <StatsCard
            title="Total Earned"
            value={formatCurrency(wallet.lifetime_earned)}
            description="Total earnings to date"
            icon={DollarSign}
          />
          <StatsCard
            title="Verified Communities"
            value={verifiedCommunities.length}
            description={`${communities.length} total registered`}
            icon={Award}
          />
        </div>

        {/* Viral WhatsApp Referral Loop */}
        <ReferralCard role="COMMUNITY_PARTNER" />

        {/* Pending Campaign Tasks Alert */}
        {activeAssignments.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-500 text-dark-900 font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  You have {activeAssignments.length} new campaign assignment(s) waiting!
                </h3>
                <p className="text-xs text-slate-400">
                  Accept now to broadcast and earn platform payouts.
                </p>
              </div>
            </div>
            <Link href="/partner/assignments">
              <Button size="sm" variant="primary" className="font-bold gap-1.5 shrink-0">
                <span>View Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* Registered Communities Table */}
        <Card className="p-0 overflow-hidden border-slate-800">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Your Registered Communities</h2>
              <p className="text-xs text-slate-400 mt-0.5">Verification status and audience strength</p>
            </div>
            <Link href="/partner/communities">
              <span className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
                Manage all <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {communities.length === 0 ? (
            <div className="py-10 px-6 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto">
              <div className="w-full md:w-60 aspect-[3/4] max-h-72 rounded-2xl overflow-hidden border border-brand-500/30 shadow-2xl shadow-brand-500/10 shrink-0 group">
                <img
                  src="/brand/one-partner-network.jpg"
                  alt="One Partner - Monetize your audience"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="space-y-4 text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                  Audience Monetization
                </div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  One Partner. Your way to monetize your audience.
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
                  Turn your active WhatsApp Group or Channel into predictable income. Accept sponsored broadcasts, post them, submit screenshot proof, and withdraw instantly to your bank.
                </p>
                <div className="pt-2">
                  <Link href="/partner/communities">
                    <Button size="lg" variant="primary" className="font-bold gap-2">
                      <PlusCircle className="w-5 h-5" />
                      <span>Register Your First Group</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Community Cards */}
              <div className="block md:hidden divide-y divide-slate-800/80">
                {communities.map((comm) => (
                  <div key={comm.id} className="p-4 space-y-3 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-sm truncate">{comm.name}</div>
                        <div className="text-xs text-brand-400 font-medium">
                          {formatCategoryName(comm.category)}
                        </div>
                      </div>
                      <StatusBadge status={comm.status} />
                    </div>

                    <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <div>
                        <span className="text-slate-400">Members: </span>
                        <span className="font-bold text-white">{formatNumber(comm.member_count)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Score: </span>
                        <span className="font-bold text-emerald-400">
                          {comm.performance_score ? `${comm.performance_score}/100` : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">{comm.platform.replace('_', ' ')}</span>
                      <Link href="/partner/assignments">
                        <Button size="sm" variant="outline" className="text-xs h-7 px-3">
                          View Jobs
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[640px]">
                  <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Community Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Member Count</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Score</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {communities.map((comm) => (
                      <tr key={comm.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">
                          {comm.name}
                          <div className="text-[11px] text-slate-500 font-normal">{comm.platform.replace('_', ' ')}</div>
                        </td>
                        <td className="px-6 py-4 text-brand-400 font-medium text-xs">
                          {formatCategoryName(comm.category)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">
                          {formatNumber(comm.member_count)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={comm.status} />
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-400">
                          {comm.performance_score ? `${comm.performance_score}/100` : 'Pending'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href="/partner/assignments">
                            <Button size="sm" variant="outline" className="text-xs">
                              View Jobs
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

