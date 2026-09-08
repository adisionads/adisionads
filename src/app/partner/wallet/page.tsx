'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import { useAuth } from '@/lib/auth/auth-context';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { NIGERIAN_BANKS } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  History,
  ShieldCheck,
  Wallet as WalletIcon,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { LedgerTransaction, Wallet, WithdrawalRequest } from '@/types';

export default function PartnerWalletPage() {
  const { wallet: contextWallet, ledger: contextLedger, withdrawals: contextWithdrawals, requestWithdrawal } = useApp();
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'ledger' | 'withdrawals'>('ledger');
  const [wallet, setWallet] = useState<Wallet>(contextWallet);
  const [ledger, setLedger] = useState<LedgerTransaction[]>(contextLedger);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(contextWithdrawals);
  const [isLoading, setIsLoading] = useState(false);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(10000);
  const [selectedBank, setSelectedBank] = useState(NIGERIAN_BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState(profile?.full_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load real wallet & ledger from Supabase if connected
  const fetchWalletData = useCallback(async () => {
    const currentUserId = user?.id;
    if (!currentUserId || !isSupabaseConfigured()) {
      setWallet(contextWallet);
      setLedger(contextLedger);
      setWithdrawals(contextWithdrawals);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch wallet
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (walletData && !walletError) {
        setWallet({
          id: walletData.id,
          user_id: walletData.user_id,
          available_balance: Number(walletData.available_balance || 0),
          pending_balance: Number(walletData.pending_balance || 0),
          lifetime_earned: Number(walletData.lifetime_earned || 0),
          lifetime_spent: Number(walletData.lifetime_spent || 0),
          currency: walletData.currency || 'NGN',
          updated_at: walletData.updated_at,
        });
      }

      // 2. Fetch ledger transactions
      const { data: ledgerData, error: ledgerError } = await supabase
        .from('ledger_transactions')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (ledgerData && !ledgerError && ledgerData.length > 0) {
        setLedger(ledgerData as LedgerTransaction[]);
      }

      // 3. Fetch withdrawal requests
      const { data: wdData, error: wdError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (wdData && !wdError && wdData.length > 0) {
        setWithdrawals(wdData as WithdrawalRequest[]);
      }
    } catch (err) {
      console.warn('[PartnerWallet] Error fetching live wallet data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, contextWallet, contextLedger, contextWithdrawals]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  // Handle bank withdrawal submission
  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanAccount = accountNumber.trim();
    if (cleanAccount.length !== 10 || !/^\d{10}$/.test(cleanAccount)) {
      setStatusMessage({
        type: 'error',
        text: 'Account number must be exactly 10 digits.',
      });
      return;
    }

    if (withdrawAmount < 1000) {
      setStatusMessage({
        type: 'error',
        text: 'Minimum withdrawal amount is ₦1,000.',
      });
      return;
    }

    if (withdrawAmount > wallet.available_balance) {
      setStatusMessage({
        type: 'error',
        text: `Insufficient funds. Your available balance is ${formatCurrency(wallet.available_balance)}.`,
      });
      return;
    }

    setIsSubmitting(true);
    const userId = user?.id || 'demo_partner';

    try {
      const res = await fetch('/api/partner/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          amount: withdrawAmount,
          bank_name: selectedBank,
          account_number: cleanAccount,
          account_name: accountName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit withdrawal request');
      }

      // Sync state with returned data
      const newAvailable = wallet.available_balance - withdrawAmount;
      setWallet((prev) => ({
        ...prev,
        available_balance: Math.max(0, newAvailable),
      }));

      // Add to local state & context
      requestWithdrawal(withdrawAmount, selectedBank, cleanAccount, accountName.trim());

      setStatusMessage({
        type: 'success',
        text: `Withdrawal request for ${formatCurrency(withdrawAmount)} submitted! Admin review & payment will disburse within 24 hours.`,
      });

      setIsWithdrawModalOpen(false);
      fetchWalletData();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'An error occurred while submitting your withdrawal request.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-dark-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/partner"
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Partner Dashboard</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Partner Wallet & Payouts</h1>
            <p className="text-sm text-slate-400">
              Track your earnings, view transaction records, and request direct payouts to your Nigerian bank.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchWalletData}
              disabled={isLoading}
              className="text-xs text-slate-400 hover:text-white gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              size="md"
              variant="primary"
              onClick={() => {
                setStatusMessage(null);
                setIsWithdrawModalOpen(true);
              }}
              disabled={wallet.available_balance < 1000}
              className="font-bold gap-2 shadow-lg shadow-brand-500/20"
            >
              <CreditCard className="w-4 h-4" />
              <span>Withdraw to Bank</span>
            </Button>
          </div>
        </div>

        {/* Global notification alerts */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{statusMessage.text}</span>
          </div>
        )}

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatsCard
            title="Available Balance"
            value={formatCurrency(wallet.available_balance)}
            description="Ready for instant bank withdrawal"
            icon={WalletIcon}
            highlight
          />
          <StatsCard
            title="Pending Verification"
            value={formatCurrency(wallet.pending_balance)}
            description="Broadcast proofs awaiting verification"
            icon={Clock}
          />
          <StatsCard
            title="Total Earned"
            value={formatCurrency(wallet.lifetime_earned)}
            description="All-time verified community earnings"
            icon={DollarSign}
          />
        </div>

        {/* Transactions & Withdrawals Container */}
        <Card className="p-0 overflow-hidden border-slate-800">
          {/* Tabs Navigation */}
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-brand-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Financial Activity</h2>
                <p className="text-xs text-slate-400">Complete audit trail of earnings and payout requests</p>
              </div>
            </div>

            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('ledger')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'ledger'
                    ? 'bg-brand-500 text-dark-900 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Earnings Ledger ({ledger.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('withdrawals')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'withdrawals'
                    ? 'bg-brand-500 text-dark-900 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Withdrawal Requests ({withdrawals.length})
              </button>
            </div>
          </div>

          {/* Tab 1: Ledger */}
          {activeTab === 'ledger' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[640px]">
                <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">New Balance</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {ledger.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                        No transactions recorded yet. Complete campaign assignments to earn payouts!
                      </td>
                    </tr>
                  ) : (
                    ledger.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white text-xs">{tx.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[11px] font-bold text-slate-300">
                            {tx.transaction_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold">
                          <span
                            className={`inline-flex items-center gap-1 text-xs ${
                              tx.direction === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {tx.direction === 'CREDIT' ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                            {formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-300">
                          {formatCurrency(tx.balance_after)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <StatusBadge status={tx.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Withdrawals */}
          {activeTab === 'withdrawals' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[640px]">
                <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Requested Date</th>
                    <th className="px-6 py-4">Bank & Account</th>
                    <th className="px-6 py-4">Account Name</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                        No withdrawal requests yet. Request your first withdrawal when your balance reaches ₦1,000.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {formatDate(w.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white text-xs">{w.bank_name}</div>
                          <div className="text-[11px] font-mono text-slate-400">{w.account_number}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-300 font-medium">
                          {w.account_name}
                        </td>
                        <td className="px-6 py-4 font-bold text-xs text-white">
                          {formatCurrency(w.amount)}
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                          {w.transaction_reference || w.id.substring(0, 12)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <StatusBadge status={w.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* WITHDRAWAL REQUEST MODAL */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Request Bank Withdrawal"
        description="Withdraw available earnings directly to your verified Nigerian bank account."
        maxWidth="md"
      >
        <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">Available Balance:</span>
              <div className="text-xl font-black text-brand-400">
                {formatCurrency(wallet.available_balance)}
              </div>
            </div>
            <ShieldCheck className="w-6 h-6 text-brand-400" />
          </div>

          <Input
            label="Amount to Withdraw (NGN)"
            type="number"
            min={1000}
            max={wallet.available_balance}
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(Number(e.target.value))}
            helperText="Minimum withdrawal is ₦1,000."
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Bank
            </label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-700/80 bg-slate-900 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
            >
              {NIGERIAN_BANKS.map((b) => (
                <option key={b.code || b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="NUBAN Account Number (10 Digits)"
            maxLength={10}
            placeholder="0123456789"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
            helperText="Enter exactly 10 digits"
            required
          />

          <Input
            label="Account Name"
            placeholder="Chioma Okonkwo"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            helperText="Must strictly match the name on your bank account."
            required
          />

          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-2">
            <Building2 className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
            <span>
              Bank transfers are manually audited and settled to your Nigerian bank within 24 business hours. No hidden fees.
            </span>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsWithdrawModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="font-bold">
              Confirm Withdrawal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
