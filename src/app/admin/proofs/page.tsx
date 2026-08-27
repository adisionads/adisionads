'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import { formatCategoryName, formatCurrency, formatDate } from '@/lib/utils';
import { ProofRecord } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  ShieldCheck,
  Upload,
  XCircle,
} from 'lucide-react';

export default function AdminProofsPage() {
  const { proofs, reviewProof } = useApp();
  const [selectedProof, setSelectedProof] = useState<ProofRecord | null>(null);

  const handleApprove = (proofId: string) => {
    reviewProof(proofId, true, 'Screenshot verified. Placement confirmed.');
    alert('Proof approved! Partner wallet has been credited atomically.');
  };

  const handleReject = (proofId: string) => {
    const feedback = prompt('Enter rejection feedback for partner:') || 'Image unclear or post not visible.';
    reviewProof(proofId, false, feedback);
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
              Review submitted WhatsApp broadcast screenshots and release escrow funds directly to partner wallets.
            </p>
          </div>
        </div>

        {/* Proofs Table */}
        <Card className="p-0 overflow-hidden border-slate-800">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Proof Audit Queue</h2>
            <span className="text-xs text-brand-400 font-semibold">{proofs.length} Total Submissions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Community & Campaign</th>
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
                            className="text-xs font-bold gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Release Funds</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleReject(proof.id)}
                            className="text-xs font-bold gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
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
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black/60 max-h-[480px] flex items-center justify-center">
              <img
                src={selectedProof.proof_image_url}
                alt="Placement Proof"
                className="w-full h-auto object-contain max-h-[460px]"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="font-bold text-white block">Partner Notes:</span>
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
                    onClick={() => {
                      handleReject(selectedProof.id);
                      setSelectedProof(null);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="font-bold"
                    onClick={() => {
                      handleApprove(selectedProof.id);
                      setSelectedProof(null);
                    }}
                  >
                    Approve & Release Funds
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

