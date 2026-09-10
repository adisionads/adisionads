'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { authFetch } from '@/lib/auth/auth-fetch';
import { formatNumber } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';

interface AdminCommunity {
  id: string;
  owner_id: string;
  name: string;
  platform: 'WHATSAPP_GROUP' | 'WHATSAPP_CHANNEL' | 'TELEGRAM' | 'DISCORD';
  category: string;
  invite_link: string;
  member_count: number;
  description?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  rejection_reason?: string;
  created_at: string;
  owner?: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
  };
}

export default function AdminCommunitiesPage() {
  const [communities, setCommunities] = useState<AdminCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/communities');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCommunities(data.data);
      }
    } catch (err) {
      console.error('Failed to load communities queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'VERIFIED' | 'REJECTED', reason?: string) => {
    setActionLoadingId(id);
    try {
      const res = await authFetch('/api/admin/communities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          rejection_reason: reason || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update community status');
      }

      // Optimistically update local list
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status: newStatus, rejection_reason: reason || c.rejection_reason }
            : c
        )
      );
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApprove = (id: string) => {
    handleUpdateStatus(id, 'VERIFIED');
  };

  const handleReject = (id: string) => {
    const reason = prompt('Reason for rejection (sent to admin):', 'Invite link invalid or group activity low.');
    if (reason === null) return; // cancelled
    handleUpdateStatus(id, 'REJECTED', reason);
  };

  const query = searchQuery.toLowerCase();
  const filteredCommunities = communities.filter((c) => {
    const matchesSearch =
      !query ||
      c.name?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query) ||
      c.owner?.full_name?.toLowerCase().includes(query) ||
      c.owner?.phone?.toLowerCase().includes(query);

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'PENDING' && (c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW')) ||
      c.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = communities.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW'
  ).length;

  return (
    <div className="py-6 sm:py-10 bg-slate-50 dark:bg-dark-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Control Center</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Community Verification Desk
              </h1>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  {pendingCount} Pending Review
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Verify submitted WhatsApp groups and channels, test invite links, and approve them for sponsor ads.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchCommunities}
            className="gap-1.5 text-xs font-semibold self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search community, owner, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filterStatus === st
                    ? 'bg-brand-500 text-dark-900 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st === 'ALL' ? `All (${communities.length})` : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Card */}
        <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-brand-500" />
              <span>Loading communities queue...</span>
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400">
              No communities found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Community & Link</th>
                    <th className="px-5 py-3.5">Type & Topic</th>
                    <th className="px-5 py-3.5">Members</th>
                    <th className="px-5 py-3.5">Group Admin</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredCommunities.map((comm) => (
                    <tr key={comm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Name & Invite Link */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {comm.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                          {comm.invite_link && comm.invite_link.startsWith('http') ? (
                            <a
                              href={comm.invite_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <span>Test Invite Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">No link provided</span>
                          )}
                        </div>
                      </td>

                      {/* Type & Topic */}
                      <td className="px-5 py-3.5">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mb-1 border border-slate-200 dark:border-slate-700">
                          {comm.platform === 'WHATSAPP_CHANNEL' ? 'WhatsApp Channel' : 'WhatsApp Group'}
                        </span>
                        <div className="text-slate-600 dark:text-slate-400 truncate max-w-xs" title={comm.description}>
                          {comm.description || comm.category}
                        </div>
                      </td>

                      {/* Member Count */}
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white text-sm">
                        👥 {formatNumber(comm.member_count)}
                      </td>

                      {/* Group Admin (Owner) */}
                      <td className="px-5 py-3.5">
                        {comm.owner ? (
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {comm.owner.full_name}
                            </div>
                            {comm.owner.phone && (
                              <a
                                href={`https://wa.me/${comm.owner.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px] mt-0.5"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>{comm.owner.phone}</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={comm.status} />
                        {comm.status === 'REJECTED' && comm.rejection_reason && (
                          <div className="text-[10px] text-rose-500 mt-1 max-w-[160px] truncate" title={comm.rejection_reason}>
                            {comm.rejection_reason}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {comm.status !== 'VERIFIED' && (
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={actionLoadingId === comm.id}
                              onClick={() => handleApprove(comm.id)}
                              className="text-xs font-bold gap-1 py-1 px-2.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </Button>
                          )}

                          {comm.status !== 'REJECTED' && (
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={actionLoadingId === comm.id}
                              onClick={() => handleReject(comm.id)}
                              className="text-xs font-bold gap-1 py-1 px-2.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </Button>
                          )}

                          {comm.status === 'VERIFIED' && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Live & Eligible</span>
                            </span>
                          )}
                        </div>
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
