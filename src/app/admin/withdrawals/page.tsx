'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { authFetch } from '@/lib/auth/auth-fetch';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatsCard } from '@/components/shared/StatsCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

interface WithdrawalRecord {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  bank_name: string;
  bank_code?: string;
  account_number: string;
  account_name: string;
  status: 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  transaction_reference?: string;
  notes?: string;
  created_at: string;
  processed_at?: string;
  profiles?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export default function AdminWithdrawalsPage() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/withdrawals');
      const data = await res.json();
      if (data.success && data.withdrawals) {
        setWithdrawals(data.withdrawals);
      }
    } catch (err) {
      console.error('Failed to fetch withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Confirm that you have completed the bank transfer to this partner?')) {
      return;
    }

    setActionLoading(id);
    try {
      const res = await authFetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawal_id: id,
          action: 'APPROVE',
          notes: 'Bank transfer confirmed by admin',
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        alert(result.error || 'Failed to approve withdrawal');
        return;
      }

      await fetchWithdrawals();
    } catch (err: any) {
      alert(err.message || 'Error processing approval');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason (funds will be refunded to the partner wallet):');
    if (!reason) return;

    setActionLoading(id);
    try {
      const res = await authFetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawal_id: id,
          action: 'REJECT',
          notes: reason,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        alert(result.error || 'Failed to reject withdrawal');
        return;
      }

      alert('Withdrawal rejected and amount refunded back to partner wallet.');
      await fetchWithdrawals();
    } catch (err: any) {
      alert(err.message || 'Error processing rejection');
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingRequests = withdrawals.filter((w) => w.status === 'REQUESTED');
  const totalPendingAmount = pendingRequests.reduce((sum, w) => sum + Number(w.amount), 0);
  const totalCompletedAmount = withdrawals
    .filter((w) => w.status === 'COMPLETED')
    .reduce((sum, w) => sum + Number(w.amount), 0);

  return (
    <div className="py-8 sm:py-12 bg-dark-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Control Center</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Partner Bank Withdrawals Desk
            </h1>
            <p className="text-sm text-slate-400">
              Audit payout requests, transfer funds to Nigerian bank accounts, and finalize partner disbursements.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchWithdrawals}
            isLoading={loading}
            className="gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </Button>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatsCard
            title="Pending Payouts"
            value={formatCurrency(totalPendingAmount)}
            description={`${pendingRequests.length} requests waiting for transfer`}
            icon={Clock}
            highlight={pendingRequests.length > 0}
          />
          <StatsCard
            title="Disbursed Payouts"
            value={formatCurrency(totalCompletedAmount)}
            description="Total funds paid to community partners"
            icon={CheckCircle2}
          />
          <StatsCard
            title="Total Requests"
            value={withdrawals.length.toString()}
            description="Lifetime withdrawal requests"
            icon={CreditCard}
          />
        </div>

        {/* Withdrawals Table */}
        <Card className="p-0 overflow-hidden border-slate-800">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Withdrawal Requests</h2>
            <span className="text-xs text-brand-400 font-semibold">
              {pendingRequests.length} Pending Actions
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              Loading withdrawal queue...
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Banknote className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
              <p className="text-sm font-semibold text-white">No withdrawal requests yet</p>
              <p className="text-xs text-slate-500">
                Partner bank withdrawal requests will appear here for 1-click audit and payout confirmation.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Partner</th>
                    <th className="px-6 py-4">Bank Details</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {withdrawals.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {formatDate(req.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">
                          {req.profiles?.full_name || req.account_name}
                        </div>
                        <div className="text-[11px] text-slate-400">{req.profiles?.email}</div>
                        {req.profiles?.phone && (
                          <div className="text-[11px] text-brand-400">{req.profiles.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{req.bank_name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-sm font-bold text-brand-400">
                            {req.account_number}
                          </span>
                          <button
                            onClick={() => copyToClipboard(req.account_number, req.id)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            title="Copy Account Number"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {copiedId === req.id && (
                            <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{req.account_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-black text-sm text-white">
                        {formatCurrency(req.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={req.status} />
                        {req.notes && (
                          <div className="text-[10px] text-slate-400 mt-1 max-w-xs truncate">
                            {req.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        {req.status === 'REQUESTED' ? (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleApprove(req.id)}
                              isLoading={actionLoading === req.id}
                              className="font-bold text-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              <span>Paid</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(req.id)}
                              disabled={actionLoading === req.id}
                              className="text-rose-400 hover:text-rose-300 border-rose-900/40 hover:bg-rose-950/30 text-xs"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              <span>Reject</span>
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {req.status === 'COMPLETED' ? 'Settled' : 'Refunded'}
                          </span>
                        )}
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
