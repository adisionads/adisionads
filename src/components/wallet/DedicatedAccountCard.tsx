'use client';

import React, { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth/auth-fetch';
import { DedicatedVirtualAccount } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  Copy,
  CheckCircle2,
  Zap,
  ShieldCheck,
  RefreshCw,
  Info,
  CreditCard,
} from 'lucide-react';

interface DedicatedAccountCardProps {
  className?: string;
}

export function DedicatedAccountCard({ className = '' }: DedicatedAccountCardProps) {
  const [account, setAccount] = useState<DedicatedVirtualAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadAccount() {
      try {
        setLoading(true);
        setError(null);
        const res = await authFetch('/api/wallet/dedicated-account');
        const json = await res.json();

        if (mounted) {
          if (json.status && json.data) {
            setAccount(json.data);
          } else {
            setError(json.message || 'Could not load your dedicated account.');
          }
        }
      } catch (err: any) {
        if (mounted) {
          setError('Network error loading dedicated account.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAccount();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCopy = () => {
    if (!account?.account_number) return;
    navigator.clipboard?.writeText(account.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card className={`p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/30 border-brand-500/20 shadow-xl ${className}`}>
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-slate-800" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-800 rounded w-1/3" />
            <div className="h-3 bg-slate-800 rounded w-1/2" />
          </div>
        </div>
      </Card>
    );
  }

  if (error || !account) {
    return null; // Silently omit if account service is unavailable
  }

  return (
    <Card className={`relative overflow-hidden p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/40 border-brand-500/30 shadow-2xl space-y-5 ${className}`}>
      {/* Background neon ambient highlight */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              Your Personal Deposit Account
            </h3>
            <p className="text-xs text-slate-400">
              Transfer anytime from any Nigerian bank — instant 24/7 wallet funding
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shrink-0 self-start sm:self-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active & Verified</span>
        </div>
      </div>

      {/* Account Info Box */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
        {/* Bank & Name */}
        <div className="sm:col-span-6 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Bank Name
          </div>
          <div className="text-sm font-black text-white flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-brand-400" />
            <span>{account.bank_name}</span>
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pt-2">
            Account Name
          </div>
          <div className="text-xs font-bold text-slate-200 truncate">
            {account.account_name}
          </div>
        </div>

        {/* Account Number & 1-Click Copy */}
        <div className="sm:col-span-6 flex flex-col sm:items-end justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Account Number (NUBAN)
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl sm:text-2xl font-black text-brand-400 tracking-wider">
              {account.account_number}
            </span>
            <Button
              type="button"
              onClick={handleCopy}
              size="sm"
              variant={copied ? 'primary' : 'outline'}
              className="gap-1.5 font-bold text-xs h-9 px-3 shrink-0"
              title="Copy account number"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-dark-900" />
                  <span className="text-dark-900">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Guidance */}
      <div className="flex items-start gap-2.5 text-xs text-slate-400 pt-1">
        <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Save this account as a beneficiary in your bank app (<span className="text-slate-300 font-semibold">OPay, PalmPay, Kuda, GTB, Zenith</span>). Any money you send will reflect in your Adision balance automatically in seconds.
        </p>
      </div>
    </Card>
  );
}
