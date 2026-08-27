'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  DollarSign,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

export default function AdminPayoutsPage() {
  const { withdrawals, processWithdrawal } = useApp();

  const handleApprovePayout = (id: string) => {
    processWithdrawal(id, true);
    alert('Withdrawal marked as COMPLETED.');
  };

  const handleRejectPayout = (id: string) => {
    processWithdrawal(id, false);
    alert('Withdrawal marked as REJECTED.');
  };

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
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Partner Bank Withdrawals</h1>
            <p className="text-sm text-slate-400">
              Audit and disburse pending partner withdrawal requests to verified Nigerian bank accounts.
            </p>
          </div>
        </div>

        {/* Withdrawals Table */}
        <Card className="p-0 overflow-hidden border-slate-800">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Disbursement Queue</h2>
            <span className="text-xs text-brand-400 font-semibold">
              {withdrawals.length} Total Requests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Request Date</th>
                  <th className="px-6 py-4">Beneficiary Bank & Account</th>
                  <th className="px-6 py-4">Account Name</th>
                  <th className="px-6 py-4">Payout Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(w.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-xs">{w.bank_name}</div>
                      <div className="font-mono text-xs text-brand-400 mt-0.5">{w.account_number}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-200 text-xs">
                      {w.account_name}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400">
                      {formatCurrency(w.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {w.status === 'REQUESTED' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleApprovePayout(w.id)}
                            className="text-xs font-bold gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Paid</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleRejectPayout(w.id)}
                            className="text-xs font-bold gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
