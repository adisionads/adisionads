'use client';

import React, { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth/auth-fetch';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Share2,
  Copy,
  CheckCircle2,
  Gift,
  Users,
  Wallet,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ReferralStats {
  referral_code: string;
  referral_link: string;
  total_invited: number;
  total_qualified: number;
  total_earnings: number;
  pending_earnings: number;
  conversions: Array<{
    id: string;
    referee_name: string;
    track: string;
    status: string;
    reward_amount: number;
    created_at: string;
  }>;
}

interface ReferralCardProps {
  role?: 'COMMUNITY_PARTNER' | 'ADVERTISER';
}

export function ReferralCard({ role = 'COMMUNITY_PARTNER' }: ReferralCardProps) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      try {
        const res = await authFetch('/api/referrals/stats');
        const json = await res.json();
        if (mounted && json.status && json.data) {
          setStats(json.data);
        }
      } catch (err) {
        console.warn('[ReferralCard] Failed to load referral stats:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  const referralLink = stats?.referral_link || 'https://adision.xyz/signup';
  const rewardAmount = role === 'ADVERTISER' ? 1000 : 500;

  // Optimized WhatsApp viral broadcast message tailored for Nigerian audience
  const shareMessage =
    role === 'COMMUNITY_PARTNER'
      ? `Hey bro! 👋 If you manage an active WhatsApp group or channel, check out Adision. They connect groups with paying Nigerian businesses for sponsored flyer broadcasts, with instant automated bank withdrawals to OPay, PalmPay, Kuda, or GTB.\n\nRegister your community here to start earning:\n${referralLink}`
      : `Hey! 👋 If you're running ads or need verified leads in Nigeria, check out Adision. They broadcast flyers across 100+ vetted WhatsApp community groups with real-time click tracking and safe escrow.\n\nGet started with my referral link here:\n${referralLink}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/40 border-brand-500/20 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-white">
                Earn ₦{rewardAmount.toLocaleString()} per Referral
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-black uppercase tracking-wider">
                Instant Cash
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {role === 'COMMUNITY_PARTNER'
                ? 'Invite other WhatsApp group admins. Earn ₦500 credited to your wallet upon their first approved ad broadcast.'
                : 'Invite other businesses and brands. Earn ₦1,000 ad credit when they launch their first campaign.'}
            </p>
          </div>
        </div>

        {/* 1-Tap WhatsApp Share Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button
            type="button"
            size="md"
            variant="primary"
            className="w-full sm:w-auto font-bold gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-0"
          >
            <Share2 className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </Button>
        </a>
      </div>

      {/* Referral Link & Copy Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Your Unique Referral Link
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 select-all focus:outline-none focus:border-brand-500"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleCopy}
            className="font-bold gap-1.5 shrink-0 border-slate-700 hover:bg-slate-800"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Referral Key Performance Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-brand-400" />
            <span>Total Invited</span>
          </div>
          <p className="text-xl font-black text-white">
            {stats?.total_invited ?? 0}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Qualified</span>
          </div>
          <p className="text-xl font-black text-emerald-400">
            {stats?.total_qualified ?? 0}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
            <Wallet className="w-3.5 h-3.5 text-brand-400" />
            <span>Earned Cash</span>
          </div>
          <p className="text-xl font-black text-white">
            {formatCurrency(stats?.total_earnings ?? 0)}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending Payout</span>
          </div>
          <p className="text-xl font-black text-amber-400">
            {formatCurrency(stats?.pending_earnings ?? 0)}
          </p>
        </div>
      </div>

      {/* Referral History Collapsible */}
      {stats && stats.conversions && stats.conversions.length > 0 && (
        <div className="border-t border-slate-800/80 pt-3">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <span>View Invited Friends & Status ({stats.conversions.length})</span>
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHistory && (
            <div className="mt-3 space-y-2">
              {stats.conversions.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-white">{conv.referee_name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(conv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-400">
                      +{formatCurrency(conv.reward_amount)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        conv.status === 'REWARDED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : conv.status === 'QUALIFIED'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {conv.status === 'REWARDED' ? 'Earned' : 'Pending 1st Ad'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
