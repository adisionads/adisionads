'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authFetch } from '@/lib/auth/auth-fetch';
import { formatCategoryName, formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  MousePointerClick,
  RefreshCw,
  Share2,
  TrendingUp,
  Users,
  Target,
  Zap,
} from 'lucide-react';

interface CampaignDetail {
  id: string;
  advertiser_id: string;
  title: string;
  category: string;
  ad_copy: string;
  media_url?: string;
  destination_url: string;
  cta_text?: string;
  package_name: string;
  duration_days: number;
  budget_amount: number;
  status: string;
  payment_status: string;
  total_clicks?: number;
  unique_clicks?: number;
  ctr?: string;
  assigned_count?: number;
  created_at: string;
}

interface CampaignAssignmentDetail {
  id: string;
  tracking_code: string;
  payout_amount: number;
  status: string;
  total_clicks?: number;
  unique_clicks?: number;
  community?: {
    id: string;
    name: string;
    platform: string;
    member_count: number;
    category: string;
  };
}

interface ProofDetail {
  id: string;
  assignment_id: string;
  proof_image_url: string;
  placement_timestamp: string;
  notes?: string;
  status: string;
  submitted_at: string;
  community?: {
    name: string;
  };
}

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [assignments, setAssignments] = useState<CampaignAssignmentDetail[]>([]);
  const [proofs, setProofs] = useState<ProofDetail[]>([]);
  const [audienceReach, setAudienceReach] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<ProofDetail | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCampaignData = useCallback(async () => {
    if (!campaignId) return;
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/advertiser/campaigns/${campaignId}`);
      const json = await res.json();
      if (json.status && json.data) {
        setCampaign(json.data.campaign);
        setAssignments(json.data.assignments || []);
        setProofs(json.data.proofs || []);
        setAudienceReach(json.data.audience_reach || 0);
      }
    } catch (err) {
      console.error('[Campaign Detail] Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchCampaignData();
  }, [fetchCampaignData]);

  const handleCopyLink = (code: string) => {
    const fullUrl = `https://adision.co/r/${code}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading && !campaign) {
    return (
      <div className="py-20 bg-dark-900 min-h-screen flex items-center justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-400 mr-2" />
        <span>Loading campaign telemetry...</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="py-20 bg-dark-900 min-h-screen text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Campaign not found</h2>
        <Button variant="primary" onClick={() => router.push('/advertiser')}>
          Back to Campaigns
        </Button>
      </div>
    );
  }

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
            <Button
              size="sm"
              variant="outline"
              onClick={fetchCampaignData}
              disabled={isLoading}
              className="gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </Button>

            {campaign.destination_url && (
              <a href={campaign.destination_url} target="_blank" rel="noreferrer">
                <Button size="sm" variant="primary" className="gap-1.5 text-xs font-bold">
                  <span>Visit Target Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Real-time KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Clicks"
            value={formatNumber(campaign.total_clicks || 0)}
            description={`${formatNumber(campaign.unique_clicks || 0)} unique visitors`}
            icon={MousePointerClick}
            highlight
          />
          <StatsCard
            title="Click-Through Rate (CTR)"
            value={`${campaign.ctr || '0.00'}%`}
            description={audienceReach > 0 ? `Across ${formatNumber(audienceReach)} reach` : 'Healthy engagement'}
            icon={TrendingUp}
          />
          <StatsCard
            title="Assigned Communities"
            value={assignments.length}
            description="Active WhatsApp broadcasts"
            icon={Users}
          />
          <StatsCard
            title="Prepaid Budget"
            value={formatCurrency(campaign.budget_amount)}
            description="Held safely until results delivered"
            icon={CheckCircle2}
          />
        </div>

        {/* Campaign Placement & Copy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 Columns: Assigned Communities & Proofs */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-0 overflow-hidden border-slate-800">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Assigned WhatsApp Communities</h3>
                  <p className="text-xs text-slate-400">Communities actively broadcasting your ad</p>
                </div>
                <span className="text-xs text-brand-400 font-semibold">
                  {assignments.length} Groups Assigned
                </span>
              </div>

              {assignments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Adision admins are currently matching your campaign with verified communities in your target category.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-5 py-3">Community Name</th>
                        <th className="px-5 py-3">Members</th>
                        <th className="px-5 py-3">Clicks (Unique)</th>
                        <th className="px-5 py-3">Placement Status</th>
                        <th className="px-5 py-3">Tracking Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {assignments.map((asgn) => (
                        <tr key={asgn.id} className="hover:bg-slate-800/20">
                          <td className="px-5 py-4 font-bold text-white">
                            {asgn.community?.name || 'Verified Community'}
                          </td>
                          <td className="px-5 py-4 text-slate-300">
                            {formatNumber(asgn.community?.member_count || 0)}
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-200">
                            {asgn.total_clicks || 0}{' '}
                            <span className="text-slate-500 font-normal">
                              ({asgn.unique_clicks || 0})
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={asgn.status} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-brand-400">
                              <span>adision.co/r/{asgn.tracking_code}</span>
                              <button
                                onClick={() => handleCopyLink(asgn.tracking_code)}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                title="Copy Link"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            {copiedCode === asgn.tracking_code && (
                              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                                Copied!
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

            {/* Verified Placement Proofs */}
            <Card className="p-6 border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white">Placement Proof Gallery</h3>
                  <p className="text-xs text-slate-400">
                    Screenshots submitted by WhatsApp group admins proving verified placement.
                  </p>
                </div>
                <span className="text-xs font-semibold text-brand-400">
                  {proofs.length} Proofs Available
                </span>
              </div>

              {proofs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {proofs.map((proof) => (
                    <div
                      key={proof.id}
                      onClick={() => setSelectedProof(proof)}
                      className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60 cursor-pointer hover:border-slate-700 transition-all group"
                    >
                      <div className="aspect-video relative overflow-hidden bg-black/40">
                        <img
                          src={proof.proof_image_url}
                          alt="Placement Proof"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white truncate max-w-[140px]">
                            {proof.community?.name || 'WhatsApp Group'}
                          </span>
                          <StatusBadge status={proof.status} />
                        </div>
                        {proof.notes && (
                          <p className="text-slate-400 text-[11px] line-clamp-1">{proof.notes}</p>
                        )}
                        <div className="text-[10px] text-slate-500 pt-1">
                          Submitted: {formatDate(proof.submitted_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  Community admins are currently broadcasting your campaign. Placement screenshot proofs will appear here as soon as they are submitted.
                </div>
              )}
            </Card>
          </div>

          {/* Right 5 Columns: Creative Summary & Details */}
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

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs leading-relaxed text-slate-200 whitespace-pre-line font-sans max-h-56 overflow-y-auto">
                {campaign.ad_copy}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Call to Action:</span>
                <span className="font-bold text-brand-400">{campaign.cta_text || 'Learn More'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Billing Model:</span>
                  <span className="font-bold text-white">{campaign.package_name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Safe Payment Status:</span>
                  <span className="font-bold text-emerald-400">
                    {campaign.payment_status === 'PAID' ? 'Held Safely in Balance' : campaign.payment_status}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Target Link:</span>
                  <span className="font-mono text-brand-400 truncate max-w-[180px]">
                    {campaign.destination_url}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* INSPECT PROOF MODAL */}
      <Modal
        isOpen={!!selectedProof}
        onClose={() => setSelectedProof(null)}
        title="Placement Proof Screenshot"
        description="Verify the ad post, timestamp, and group name in the screenshot below."
        maxWidth="lg"
      >
        {selectedProof && (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black/60 max-h-[480px] flex items-center justify-center p-2">
              <img
                src={selectedProof.proof_image_url}
                alt="Placement Proof"
                className="w-full h-auto object-contain max-h-[460px] rounded-xl"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="font-bold text-white block">Community Notes:</span>
              <p className="text-slate-300">{selectedProof.notes || 'No extra notes provided.'}</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedProof(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
