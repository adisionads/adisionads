'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { authFetch } from '@/lib/auth/auth-fetch';
import { formatCategoryName, formatCurrency, formatNumber } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Layers,
  Megaphone,
  PlusCircle,
  RefreshCw,
  Share2,
  Sparkles,
  Users,
  ExternalLink,
} from 'lucide-react';

interface CampaignItem {
  id: string;
  title: string;
  category: string;
  budget_amount: number;
  package_name: string;
  destination_url: string;
  status: string;
  payment_status: string;
}

interface CommunityItem {
  id: string;
  name: string;
  member_count: number;
  category: string;
  platform: string;
  invite_link: string;
}

interface AssignmentItem {
  id: string;
  campaign_id: string;
  community_id: string;
  tracking_code: string;
  payout_amount: number;
  status: string;
  total_clicks?: number;
  unique_clicks?: number;
  campaign?: {
    id: string;
    title: string;
    category: string;
    destination_url: string;
  };
  community?: {
    id: string;
    name: string;
    member_count: number;
    platform: string;
  };
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [payoutAmount, setPayoutAmount] = useState<number>(4500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/admin/campaigns');
      const json = await res.json();
      if (json.status && json.data) {
        setCampaigns(json.data.campaigns || []);
        setCommunities(json.data.communities || []);
        setAssignments(json.data.assignments || []);
        if (json.data.campaigns?.length > 0 && !selectedCampaignId) {
          setSelectedCampaignId(json.data.campaigns[0].id);
        }
      }
    } catch (err) {
      console.error('[Admin Campaigns] Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCampaignId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopyLink = (code: string) => {
    const fullUrl = `https://adision.co/r/${code}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId || !selectedCommunityId) {
      alert('Please select both a campaign and a community.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/admin/campaigns/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: selectedCampaignId,
          community_id: selectedCommunityId,
          payout_amount: payoutAmount,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.status) {
        throw new Error(json.message || 'Failed to assign campaign');
      }

      setIsAssignModalOpen(false);
      setSuccessBanner(
        `Assignment created successfully! Unique link: ${json.data?.tracking_url}`
      );
      setTimeout(() => setSuccessBanner(null), 6000);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to complete assignment.');
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
              href="/admin"
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Control Center</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Campaign Matchmaker & Distribution</h1>
            <p className="text-sm text-slate-400">
              Match paid advertiser campaigns with verified WhatsApp communities and provision unique tracking links.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchData}
              disabled={isLoading}
              className="text-xs text-slate-400 hover:text-white gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              size="md"
              variant="primary"
              onClick={() => setIsAssignModalOpen(true)}
              className="font-bold gap-2 shadow-lg shadow-brand-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Community Assignment</span>
            </Button>
          </div>
        </div>

        {/* Success notification banner */}
        {successBanner && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-slate-400 hover:text-white ml-4 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Assignments Table */}
        <Card className="p-0 overflow-hidden border-slate-800">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Active Distribution Assignments</h2>
              <p className="text-xs text-slate-400">All campaigns currently linked to verified WhatsApp groups</p>
            </div>
            <span className="text-xs text-brand-400 font-semibold">
              {assignments.length} Total Assignments
            </span>
          </div>

          {assignments.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-60" />
              <h3 className="text-sm font-bold text-white">No community assignments yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                Click &quot;New Community Assignment&quot; above to link a funded advertiser campaign to a verified WhatsApp group.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[720px]">
                <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Campaign Title</th>
                    <th className="px-6 py-4">Assigned Community</th>
                    <th className="px-6 py-4">Partner Payout</th>
                    <th className="px-6 py-4">Clicks (Unique)</th>
                    <th className="px-6 py-4">Unique Tracking Link</th>
                    <th className="px-6 py-4 text-right">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {assignments.map((asgn) => (
                    <tr key={asgn.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{asgn.campaign?.title || 'Active Campaign'}</div>
                        <div className="text-xs text-brand-400 font-medium mt-0.5">
                          {formatCategoryName(asgn.campaign?.category || 'GENERAL')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{asgn.community?.name || 'WhatsApp Group'}</div>
                        <div className="text-xs text-slate-400">
                          {formatNumber(asgn.community?.member_count || 0)} members
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">
                        {formatCurrency(asgn.payout_amount)}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-300">
                        {asgn.total_clicks || 0}{' '}
                        <span className="text-[11px] text-slate-500 font-normal">
                          ({asgn.unique_clicks || 0} unique)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                            adision.co/r/{asgn.tracking_code}
                          </span>
                          <button
                            onClick={() => handleCopyLink(asgn.tracking_code)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="Copy link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {copiedCode === asgn.tracking_code && (
                          <span className="text-[10px] text-emerald-400 font-bold block mt-1">Copied!</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <StatusBadge status={asgn.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* MATCHMAKING MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Campaign to Verified Community"
        description="Select an active demand campaign and link it to an eligible verified community."
        maxWidth="lg"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Active Campaign
            </label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-700/80 bg-slate-900 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
              required
            >
              <option value="">-- Choose a Campaign --</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({formatCategoryName(c.category)} - {formatCurrency(c.budget_amount)})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Verified Community Supply
            </label>
            <select
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-700/80 bg-slate-900 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
              required
            >
              <option value="">-- Choose a Verified Community --</option>
              {communities.map((comm) => (
                <option key={comm.id} value={comm.id}>
                  {comm.name} ({formatNumber(comm.member_count)} members - {formatCategoryName(comm.category)})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Partner Placement Payout (NGN)"
            type="number"
            min={1000}
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(Number(e.target.value))}
            helperText="Amount released to partner wallet upon verified screenshot proof."
            required
          />

          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs space-y-1 text-slate-300">
            <span className="font-bold text-white flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Automated Link Provisioning:
            </span>
            <p>
              Assigning will automatically create a secure, unique tracking slug (`ad_xxxxxx`) and make the ad task available to the group owner immediately.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="font-bold">
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
