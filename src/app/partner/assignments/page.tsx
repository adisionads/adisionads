'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { authFetch } from '@/lib/auth/auth-fetch';
import { formatCategoryName, formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, TextArea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  Download,
  ExternalLink,
  Layers,
  RefreshCw,
  Sparkles,
  Upload,
  AlertCircle,
} from 'lucide-react';

interface AssignmentItem {
  id: string;
  campaign_id: string;
  community_id: string;
  tracking_code: string;
  payout_amount: number;
  status: string;
  accepted_at?: string;
  published_at?: string;
  completed_at?: string;
  campaign?: {
    id: string;
    title: string;
    category: string;
    ad_copy: string;
    media_url?: string;
    destination_url: string;
    cta_text?: string;
  };
  community?: {
    id: string;
    name: string;
    member_count: number;
    category: string;
    platform: string;
    invite_link: string;
  };
  proof?: {
    id: string;
    proof_image_url: string;
    status: string;
    review_feedback?: string;
    submitted_at: string;
  };
}

export default function PartnerAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [proofImage, setProofImage] = useState('');
  const [proofNotes, setProofNotes] = useState('Broadcasted to group members and pinned.');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [isAcceptingId, setIsAcceptingId] = useState<string | null>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedCopy, setCopiedCopy] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/partner/assignments');
      const json = await res.json();
      if (json.status && json.data) {
        setAssignments(json.data);
      }
    } catch (err) {
      console.error('[Partner Assignments] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleCopyLink = (code: string) => {
    const fullUrl = `https://adision.co/r/${code}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyAdText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCopy(id);
    setTimeout(() => setCopiedCopy(null), 2000);
  };

  const handleAcceptAssignment = async (asgnId: string) => {
    setIsAcceptingId(asgnId);
    try {
      const res = await authFetch(`/api/partner/assignments/${asgnId}/accept`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok || !json.status) {
        throw new Error(json.message || 'Failed to accept assignment');
      }

      setSuccessBanner('Assignment accepted! You can now broadcast the message and upload your proof.');
      setTimeout(() => setSuccessBanner(null), 5000);
      fetchAssignments();
    } catch (err: any) {
      alert(err.message || 'Error accepting assignment');
    } finally {
      setIsAcceptingId(null);
    }
  };

  const handleOpenProofModal = (asgn: AssignmentItem) => {
    setSelectedAssignment(asgn);
    setProofImage(asgn.proof?.proof_image_url || '');
    setProofNotes('Broadcasted and pinned for community members.');
    setIsProofModalOpen(true);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    if (!proofImage.trim()) {
      alert('Please enter a screenshot link for proof.');
      return;
    }

    setIsSubmittingProof(true);
    try {
      const res = await authFetch('/api/proof/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: selectedAssignment.id,
          community_id: selectedAssignment.community_id,
          proof_image_url: proofImage.trim(),
          placement_timestamp: new Date().toISOString(),
          notes: proofNotes.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.status) {
        throw new Error(json.message || 'Failed to submit placement proof');
      }

      setIsProofModalOpen(false);
      setSuccessBanner('Placement proof submitted successfully! Funds will be credited once verified.');
      setTimeout(() => setSuccessBanner(null), 5000);
      fetchAssignments();
    } catch (err: any) {
      alert(err.message || 'Error submitting proof');
    } finally {
      setIsSubmittingProof(false);
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
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Ad Tasks & Jobs</h1>
            <p className="text-sm text-slate-400">
              Post these ads in your WhatsApp groups, upload your screenshot proof, and claim your payout.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchAssignments}
            disabled={isLoading}
            className="text-xs text-slate-400 hover:text-white gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </Button>
        </div>

        {/* Success Banner */}
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

        {/* Assignments List */}
        {assignments.length === 0 ? (
          <Card className="p-12 text-center border-slate-800 space-y-3">
            <Layers className="w-12 h-12 text-slate-600 mx-auto opacity-60" />
            <h3 className="text-base font-bold text-white">No active ad tasks right now</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              When an advertiser campaign matches your WhatsApp community&apos;s niche, your assigned broadcast tasks will appear here with guaranteed payouts.
            </p>
            <div className="pt-2">
              <Link href="/partner/communities">
                <Button size="sm" variant="outline" className="text-xs font-bold">
                  Manage Communities
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {assignments.map((asgn) => {
              const campaign = asgn.campaign;
              const community = asgn.community;
              const fullAdText = `${campaign?.ad_copy || ''}\n\n👉 Link: https://adision.co/r/${asgn.tracking_code}`;

              return (
                <Card
                  key={asgn.id}
                  className="p-6 sm:p-8 border-slate-800 space-y-6 hover:border-slate-700 transition-all"
                >
                  {/* Task Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                          {community?.name || 'Your Community'}
                        </span>
                        <StatusBadge status={asgn.status} />
                      </div>
                      <h2 className="text-xl font-bold text-white">{campaign?.title}</h2>
                    </div>

                    {/* Task Payout Card */}
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 shrink-0">
                      <div className="p-2 rounded-xl bg-emerald-500 text-dark-900 font-bold">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Task Payout</span>
                        <div className="text-lg font-black text-emerald-400">
                          {formatCurrency(asgn.payout_amount)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* If proof was rejected/revision requested, show banner */}
                  {asgn.proof?.status === 'REJECTED' && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                      <div className="flex items-center gap-2 font-bold text-rose-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>Action Required: Screenshot Revision Requested</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Feedback: {asgn.proof.review_feedback || 'Please ensure the tracking link and group name are visible.'}
                      </p>
                    </div>
                  )}

                  {/* Main Task Body: Creative on Left, Copy on Right */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left 4 cols: Image attachment */}
                    <div className="lg:col-span-4 space-y-3">
                      {campaign?.media_url ? (
                        <div className="rounded-2xl overflow-hidden aspect-video border border-slate-800 bg-black/40">
                          <img
                            src={campaign.media_url}
                            alt="Creative"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="rounded-2xl aspect-video bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                          Text-only broadcast
                        </div>
                      )}

                      {campaign?.media_url && (
                        <a
                          href={campaign.media_url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full block"
                        >
                          <Button size="sm" variant="outline" className="w-full text-xs gap-1.5">
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Ad Flyer</span>
                          </Button>
                        </a>
                      )}
                    </div>

                    {/* Right 8 cols: Ad Copy & Assigned Tracking Link */}
                    <div className="lg:col-span-8 space-y-4">
                      {/* Copy Box */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                            Ad Copy (Broadcast Message)
                          </label>
                          <button
                            onClick={() => handleCopyAdText(asgn.id, fullAdText)}
                            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedCopy === asgn.id ? 'Copied to Clipboard!' : 'Copy Full Post'}</span>
                          </button>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line max-h-40 overflow-y-auto">
                          {fullAdText}
                        </div>
                      </div>

                      {/* Unique Tracking Link Pill */}
                      <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-xs">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">
                            Your Dedicated Tracking Link
                          </span>
                          <span className="font-mono font-bold text-brand-400">
                            https://adision.co/r/{asgn.tracking_code}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleCopyLink(asgn.tracking_code)}
                          className="text-xs font-bold shrink-0"
                        >
                          {copiedCode === asgn.tracking_code ? 'Link Copied!' : 'Copy Tracking Link'}
                        </Button>
                      </div>

                      {/* Action Buttons based on status */}
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        {asgn.status === 'ASSIGNED' && (
                          <Button
                            size="md"
                            variant="primary"
                            isLoading={isAcceptingId === asgn.id}
                            onClick={() => handleAcceptAssignment(asgn.id)}
                            className="font-bold gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accept Assignment</span>
                          </Button>
                        )}

                        {(asgn.status === 'ACCEPTED' || asgn.status === 'PUBLISHED') && (
                          <Button
                            size="md"
                            variant="primary"
                            onClick={() => handleOpenProofModal(asgn)}
                            className="font-bold gap-2 shadow-lg shadow-brand-500/20"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Submit Placement Proof</span>
                          </Button>
                        )}

                        {asgn.status === 'PROOF_SUBMITTED' && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                            <Clock className="w-4 h-4" />
                            <span>Proof Under Review (usually approved within 2-4 hours)</span>
                          </div>
                        )}

                        {(asgn.status === 'VERIFIED' || asgn.status === 'COMPLETED') && (
                          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verified & Paid into Wallet ({formatCurrency(asgn.payout_amount)})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* SUBMIT PROOF MODAL */}
      <Modal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        title="Submit Proof of Broadcast"
        description="Upload a screenshot showing the ad published in your WhatsApp group."
        maxWidth="md"
      >
        <form onSubmit={handleSubmitProof} className="space-y-4">
          <Input
            label="Screenshot Image Link (URL)"
            placeholder="https://image-host.com/whatsapp-proof.jpg"
            value={proofImage}
            onChange={(e) => setProofImage(e.target.value)}
            helperText="Direct image URL showing your group name, message timestamp, and tracking link."
            required
          />

          <TextArea
            label="Notes (Optional)"
            rows={3}
            placeholder="e.g. Broadcasted to 2,450 members at 8:00 PM and pinned."
            value={proofNotes}
            onChange={(e) => setProofNotes(e.target.value)}
          />

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-white block">Verification Checklist:</span>
            <p>
              Please verify your screenshot clearly shows: 1) WhatsApp group name, 2) The full ad text, and 3) The special tracking link.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsProofModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingProof} className="font-bold">
              Submit Proof for Verification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
