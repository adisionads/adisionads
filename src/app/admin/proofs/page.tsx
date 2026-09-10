'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { authFetch } from '@/lib/auth/auth-fetch';
import { formatCategoryName, formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

interface ProofItem {
  id: string;
  assignment_id: string;
  community_id: string;
  proof_image_url: string;
  placement_timestamp: string;
  notes?: string;
  status: string;
  review_feedback?: string;
  submitted_at: string;
  reviewed_at?: string;
  submitted_by_profile?: {
    id: string;
    full_name: string;
    phone?: string;
    email: string;
  };
  community?: {
    id: string;
    name: string;
    platform: string;
    member_count: number;
    invite_link: string;
  };
  assignment?: {
    id: string;
    tracking_code: string;
    payout_amount: number;
    status: string;
    campaign?: {
      id: string;
      title: string;
      category: string;
      destination_url: string;
    };
  };
}

export default function AdminProofsPage() {
  const [proofs, setProofs] = useState<ProofItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<ProofItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionFeedback, setRejectionFeedback] = useState('Screenshot is blurry or does not show the ad post.');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchProofs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/admin/proofs');
      const json = await res.json();
      if (json.status && json.data) {
        setProofs(json.data);
      }
    } catch (err) {
      console.error('[Admin Proofs] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProofs();
  }, [fetchProofs]);

  const handleApprove = async (proofId: string) => {
    setIsProcessing(true);
    try {
      const res = await authFetch('/api/admin/proofs/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof_id: proofId,
          action: 'APPROVE',
          feedback: 'Screenshot verified. Placement confirmed and wallet credited.',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.status) {
        throw new Error(json.message || 'Failed to approve proof');
      }

      setSelectedProof(null);
      setSuccessBanner('Proof approved! Partner wallet has been atomically credited.');
      setTimeout(() => setSuccessBanner(null), 5000);
      fetchProofs();
    } catch (err: any) {
      alert(err.message || 'Error approving proof');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (proofId: string) => {
    setIsProcessing(true);
    try {
      const res = await authFetch('/api/admin/proofs/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof_id: proofId,
          action: 'REJECT',
          feedback: rejectionFeedback,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.status) {
        throw new Error(json.message || 'Failed to reject proof');
      }

      setRejectionModalOpen(false);
      setSelectedProof(null);
      setSuccessBanner('Proof rejected. Feedback sent to partner for revision.');
      setTimeout(() => setSuccessBanner(null), 5000);
      fetchProofs();
    } catch (err: any) {
      alert(err.message || 'Error rejecting proof');
    } finally {
      setIsProcessing(false);
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
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Placement Proof Verification</h1>
            <p className="text-sm text-slate-400">
              Audit submitted WhatsApp broadcast screenshots and release guaranteed payments directly to partner wallets.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchProofs}
            disabled={isLoading}
            className="text-xs text-slate-400 hover:text-white gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Submissions</span>
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

        {/* Proofs Table */}
        <Card className="p-0 overflow-hidden border-slate-800">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Proof Audit Queue</h2>
            <span className="text-xs text-brand-400 font-semibold">{proofs.length} Total Submissions</span>
          </div>

          {proofs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-60" />
              <h3 className="text-sm font-bold text-white">Proof audit queue is clean</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No placement screenshots are currently pending admin verification.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[720px]">
                <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Community & Campaign</th>
                    <th className="px-6 py-4">Submitted By</th>
                    <th className="px-6 py-4">Submission Date</th>
                    <th className="px-6 py-4">Payout Amount</th>
                    <th className="px-6 py-4">Screenshot</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {proofs.map((proof) => (
                    <tr key={proof.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{proof.community?.name || 'WhatsApp Group'}</div>
                        <div className="text-xs text-brand-400 font-medium mt-0.5">
                          {proof.assignment?.campaign?.title || 'Active Campaign'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-slate-200">
                          {proof.submitted_by_profile?.full_name || 'Community Admin'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {proof.submitted_by_profile?.phone || proof.submitted_by_profile?.email || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {formatDate(proof.submitted_at)}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">
                        {formatCurrency(proof.assignment?.payout_amount || 4500)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedProof(proof)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-400" />
                          <span>Inspect Screenshot</span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={proof.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {proof.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleApprove(proof.id)}
                              disabled={isProcessing}
                              className="text-xs font-bold gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setSelectedProof(proof);
                                setRejectionModalOpen(true);
                              }}
                              disabled={isProcessing}
                              className="text-xs font-bold gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            {proof.status === 'APPROVED' ? 'Approved & Paid' : 'Rejected'}
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

      {/* INSPECT PROOF MODAL */}
      <Modal
        isOpen={!!selectedProof && !rejectionModalOpen}
        onClose={() => setSelectedProof(null)}
        title="Placement Proof Inspection"
        description="Verify the ad text, special tracking link, timestamp, and group name in the screenshot."
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block">Community:</span>
                <span className="text-white font-semibold">{selectedProof.community?.name}</span>
                {selectedProof.community?.invite_link && (
                  <a
                    href={selectedProof.community.invite_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-400 text-[11px] block truncate hover:underline"
                  >
                    View Group Invite
                  </a>
                )}
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block">Payout Value:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {formatCurrency(selectedProof.assignment?.payout_amount || 4500)}
                </span>
                <span className="text-slate-500 text-[10px] block">
                  Released immediately to partner wallet
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="font-bold text-white block">Partner Submission Notes:</span>
              <p className="text-slate-300">{selectedProof.notes || 'No extra notes provided.'}</p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" onClick={() => setSelectedProof(null)}>
                Close
              </Button>

              {selectedProof.status === 'PENDING' && (
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setRejectionModalOpen(true)}
                  >
                    Reject with Feedback
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="font-bold gap-1"
                    isLoading={isProcessing}
                    onClick={() => handleApprove(selectedProof.id)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Release Funds</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* REJECTION REASON MODAL */}
      <Modal
        isOpen={rejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        title="Reject Placement Proof"
        description="Provide a clear, helpful reason so the community partner can correct and resubmit."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Rejection Feedback Reason
            </label>
            <textarea
              rows={3}
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white focus:border-brand-500 focus:outline-none"
              placeholder="e.g. The screenshot does not show the tracking link or the group name."
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setRejectionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={isProcessing}
              onClick={() => selectedProof && handleReject(selectedProof.id)}
              className="font-bold"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
