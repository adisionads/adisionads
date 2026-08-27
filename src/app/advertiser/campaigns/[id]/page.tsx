'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { formatCategoryName, formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  MousePointerClick,
  Share2,
  TrendingUp,
  Users,
} from 'lucide-react';

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  const { campaigns, assignments, proofs } = useApp();

  const campaign = campaigns.find((c) => c.id === campaignId) || campaigns[0];
  const campaignAssignments = assignments.filter((a) => a.campaign_id === campaign.id);
  const campaignProofs = proofs.filter((p) => p.assignment?.campaign_id === campaign.id);

  const ctr =
    campaign.total_clicks && campaign.total_clicks > 0
      ? ((campaign.unique_clicks || 0) / (campaignAssignments.length * 2500 || 1) * 100).toFixed(1)
      : '3.8';

  return (
    <div className="py-8 sm:py-12 bg-dark-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <button
              onClick={() => router.push('/advertiser')}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Campaigns</span>
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{campaign.title}</h1>
              <StatusBadge status={campaign.status} />
            </div>
            <p className="text-xs text-brand-400 font-semibold">
              {formatCategoryName(campaign.category)} • {campaign.package_name} ({campaign.duration_days} Days)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a href={campaign.destination_url} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <span>Visit Landing Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Real-time KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Clicks"
            value={formatNumber(campaign.total_clicks || 0)}
            description={`${campaign.unique_clicks || 0} unique visitors`}
            icon={MousePointerClick}
            highlight
          />
          <StatsCard
            title="Click-Through Rate (CTR)"
            value={`${ctr}%`}
            description="Healthy community engagement"
            icon={TrendingUp}
          />
          <StatsCard
            title="Assigned Communities"
            value={campaignAssignments.length || 1}
            description="Active WhatsApp broadcasts"
            icon={Users}
          />
          <StatsCard
            title="Budget in Escrow"
            value={formatCurrency(campaign.budget_amount)}
            description="Paid via PaymentPoint"
            icon={CheckCircle2}
          />
        </div>

        {/* Campaign Placement & Copy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 Columns: Assigned Communities & Proofs */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-0 overflow-hidden border-slate-800">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Assigned WhatsApp Communities</h3>
                <span className="text-xs text-brand-400 font-semibold">
                  {campaignAssignments.length} Groups Active
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3">Community Name</th>
                      <th className="px-5 py-3">Members</th>
                      <th className="px-5 py-3">Placement Status</th>
                      <th className="px-5 py-3">Tracking Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {campaignAssignments.map((asgn) => (
                      <tr key={asgn.id} className="hover:bg-slate-800/20">
                        <td className="px-5 py-4 font-bold text-white">
                          {asgn.community?.name || 'Verified Tech Community'}
                        </td>
                        <td className="px-5 py-4 text-slate-300">
                          {formatNumber(asgn.community?.member_count || 2450)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={asgn.status} />
                        </td>
                        <td className="px-5 py-4 font-mono text-[11px] text-brand-400">
                          adision.co/r/{asgn.tracking_code}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Verified Placement Proofs */}
            <Card className="p-6 border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Placement Proof Verification</h3>
              <p className="text-xs text-slate-400">
                Screenshots submitted by WhatsApp group admins proving placement and timestamp.
              </p>

              {campaignProofs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {campaignProofs.map((proof) => (
                    <div key={proof.id} className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60">
                      <div className="aspect-video relative overflow-hidden bg-black/40">
                        <img
                          src={proof.proof_image_url}
                          alt="Placement Proof"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">{proof.community?.name}</span>
                          <StatusBadge status={proof.status} />
                        </div>
                        <p className="text-slate-400 text-[11px]">{proof.notes}</p>
                        <div className="text-[10px] text-slate-500 pt-1">
                          Submitted: {formatDate(proof.submitted_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  Admins are currently broadcasting. Placement screenshot proofs will appear here shortly.
                </div>
              )}
            </Card>
          </div>

          {/* Right 5 Columns: Creative Summary */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Campaign Creative & Copy</h3>

              {campaign.media_url && (
                <div className="rounded-2xl overflow-hidden aspect-video border border-slate-800 bg-black/40">
                  <img
                    src={campaign.media_url}
                    alt="Creative"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs leading-relaxed text-slate-200 whitespace-pre-line font-sans">
                {campaign.ad_copy}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Call to Action:</span>
                <span className="font-bold text-brand-400">{campaign.cta_text}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
