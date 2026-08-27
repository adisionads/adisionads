'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import { formatCategoryName, formatCurrency, formatDate } from '@/lib/utils';
import { CampaignAssignment } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
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
  Eye,
  Image as ImageIcon,
  MessageCircle,
  Share2,
  Sparkles,
  Upload,
} from 'lucide-react';

export default function PartnerAssignmentsPage() {
  const { assignments, acceptAssignment, submitProof } = useApp();

  const [selectedAssignment, setSelectedAssignment] = useState<CampaignAssignment | null>(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [proofImage, setProofImage] = useState(
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80'
  );
  const [proofNotes, setProofNotes] = useState('Posted and pinned for 48 hours to all active members.');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedCopy, setCopiedCopy] = useState(false);

  const handleCopyLink = (code: string) => {
    const fullUrl = `https://adision.co/r/${code}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyAdText = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCopy(true);
    setTimeout(() => setCopiedCopy(false), 2000);
  };

  const handleOpenProofModal = (asgn: CampaignAssignment) => {
    setSelectedAssignment(asgn);
    setIsProofModalOpen(true);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    submitProof(selectedAssignment.id, proofImage, proofNotes);
    setIsProofModalOpen(false);
    alert('Placement proof submitted successfully! Wallet will be credited upon approval.');
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
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Campaign Tasks</h1>
            <p className="text-sm text-slate-400">
              Broadcast campaigns to your WhatsApp communities, submit proof of placement, and claim your earnings.
            </p>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-6">
          {assignments.map((asgn) => {
            const campaign = asgn.campaign;
            const community = asgn.community;
            const fullAdText = `${campaign?.ad_copy}\n\n👉 Link: https://adision.co/r/${asgn.tracking_code}`;

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

                  {/* Guaranteed Payout Card */}
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

                {/* Main Task Body: Creative on Left, Instructions on Right */}
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
                        No image flyer
                      </div>
                    )}

                    {campaign?.media_url && (
                      <a
                        href={campaign.media_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full"
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
                          onClick={() => handleCopyAdText(fullAdText)}
                          className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedCopy ? 'Copied!' : 'Copy Full Post'}</span>
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
                          Your Unique Tracking Link
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
                          onClick={() => acceptAssignment(asgn.id)}
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
                          <span>Proof Under Review by ADISION Team</span>
                        </div>
                      )}

                      {asgn.status === 'VERIFIED' && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
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
      </div>

      {/* SUBMIT PROOF MODAL */}
      <Modal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        title="Submit Placement Proof"
        description="Upload a screenshot showing the advert published in your WhatsApp group."
        maxWidth="md"
      >
        <form onSubmit={handleSubmitProof} className="space-y-4">
          <Input
            label="Proof Screenshot Image URL"
            placeholder="https://image-host.com/whatsapp-proof.jpg"
            value={proofImage}
            onChange={(e) => setProofImage(e.target.value)}
            helperText="Direct image link showing message timestamp and group name."
            required
          />

          <TextArea
            label="Placement Notes & Duration"
            rows={3}
            placeholder="e.g. Broadcasted to 2,450 members at 8:00 PM and pinned to group."
            value={proofNotes}
            onChange={(e) => setProofNotes(e.target.value)}
          />

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-white block">Verification Guideline:</span>
            <p>
              Ensure the screenshot clearly shows your group name, member activity, and the ad text with tracking link.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsProofModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              Submit Proof for Approval
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
