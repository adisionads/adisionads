'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import { NIGERIAN_BANKS } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
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
} from 'lucide-react';

export default function PartnerWalletPage() {
  const { wallet, ledger, withdrawals, requestWithdrawal } = useApp();

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(10000);
  const [selectedBank, setSelectedBank] = useState(NIGERIAN_BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [accountName, setAccountName] = useState('Chioma Okonkwo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount < 1000) {
      alert('Minimum withdrawal amount is ₦1,000.');
      return;
    }
    if (withdrawAmount > wallet.available_balance) {
      alert('Insufficient available wallet balance.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      requestWithdrawal(withdrawAmount, selectedBank, accountNumber, accountName);
      setIsSubmitting(false);
      setIsWithdrawModalOpen(false);
      alert('Withdrawal request submitted successfully! Funds will be disbursed within 24 hours.');
    }, 600);
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
              Track earned campaign commissions, immutable ledger history, and withdraw directly to your Nigerian bank.
            </p>
          </div>

          <Button
            size="md"
            variant="primary"
            onClick={() => setIsWithdrawModalOpen(true)}
            disabled={wallet.available_balance < 1000}
            className="font-bold gap-2 shadow-lg shadow-brand-500/20"
          >
            <CreditCard className="w-4 h-4" />
            <span>Request Bank Withdrawal</span>
          </Button>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatsCard
            title="Available Cash Balance"
            value={formatCurrency(wallet.available_balance)}
            description="Withdrawable instantly"
            icon={WalletIcon}
            highlight
          />
          <StatsCard
            title="Pending Verification"
            value={formatCurrency(wallet.pending_balance)}
            description="Awaiting proof approval"
            icon={Clock}
          />
          <StatsCard
            title="Lifetime Payouts"
            value={formatCurrency(wallet.lifetime_earned)}
            description="Total earned on ADISION"
            icon={DollarSign}
          />
        </div>

        {/* Transaction History Ledger */}
        <Card className="p-0 overflow-hidden border-slate-800">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-brand-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Wallet Transaction Ledger</h2>
                <p className="text-xs text-slate-400">Double-entry audit log of all credits and disbursements</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Transaction Details</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Balance After</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {ledger.map((tx) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* WITHDRAWAL REQUEST MODAL */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Request Bank Withdrawal"
        description="Withdraw available balance directly to your Nigerian bank account."
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
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />

          <Input
            label="Account Name"
            placeholder="Chioma Okonkwo"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            helperText="Must match the name on your bank account."
            required
          />

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
