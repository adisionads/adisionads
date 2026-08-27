'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import { formatCategoryName, formatCurrency, formatNumber } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Layers,
  Megaphone,
  PlusCircle,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';

export default function AdminCampaignsPage() {
  const { campaigns, communities, assignments, assignCampaignToCommunity } = useApp();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [payoutAmount, setPayoutAmount] = useState<number>(4500);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verifiedCommunities = communities.filter((c) => c.status === 'VERIFIED');
  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId || !selectedCommunityId) {
      alert('Please select both a campaign and a community.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      assignCampaignToCommunity(selectedCampaignId, selectedCommunityId, payoutAmount);
      setIsSubmitting(false);
      setIsAssignModalOpen(false);
      alert('Campaign successfully assigned! Unique tracking link generated.');
    }, 600);
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
              Match advertiser demand with verified community supply and distribute unique tracking links.
            </p>
          </div>

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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Campaign Title</th>
                  <th className="px-6 py-4">Assigned Community</th>
                  <th className="px-6 py-4">Partner Payout</th>
                  <th className="px-6 py-4">Unique Tracking Link</th>
                  <th className="px-6 py-4 text-right">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {assignments.map((asgn) => (
                  <tr key={asgn.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{asgn.campaign?.title}</div>
                      <div className="text-xs text-brand-400 font-medium mt-0.5">
                        {formatCategoryName(asgn.campaign?.category || 'GENERAL')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{asgn.community?.name}</div>
                      <div className="text-xs text-slate-400">
                        {formatNumber(asgn.community?.member_count || 0)} members
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400">
                      {formatCurrency(asgn.payout_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                        adision.co/r/{asgn.tracking_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StatusBadge status={asgn.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* MATCHMAKING MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Campaign to Verified Community"
        description="Select an active demand campaign and link it to an eligible community."
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
            >
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
              {verifiedCommunities.map((comm) => (
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
            helperText="Amount released to partner wallet upon successful screenshot verification."
            required
          />

          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs space-y-1 text-slate-300">
            <span className="font-bold text-white flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Automated Link Provisioning:
            </span>
            <p>
              Assigning will automatically create a secure, randomized tracking slug (`ad_xxxxxx`) and deliver the ad copy and assets directly into the group owner&apos;s task feed.
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

