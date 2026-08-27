'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import { formatCategoryName, formatNumber, formatPlatformName } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Eye,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';

export default function AdminCommunitiesPage() {
  const { communities, verifyCommunity } = useApp();
  const [selectedProofImage, setSelectedProofImage] = useState<string | null>(null);

  const handleApprove = (communityId: string) => {
    verifyCommunity(communityId, true);
  };

  const handleReject = (communityId: string) => {
    const reason = prompt('Enter rejection reason:') || 'Member proof invalid or engagement low.';
    verifyCommunity(communityId, false, reason);
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
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Community KYC Verification</h1>
            <p className="text-sm text-slate-400">
              Audit submitted WhatsApp groups and channels, verify audience member authenticity, and grant distribution eligibility.
            </p>
          </div>
        </div>

        {/* Communities Table */}
        <Card className="p-0 overflow-hidden border-slate-800">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">All Communities Queue</h2>
            <span className="text-xs text-brand-400 font-semibold">
              {communities.length} Total Communities
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Community & Platform</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Claimed Members</th>
                  <th className="px-6 py-4">Verification Proof</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {communities.map((comm) => (
                  <tr key={comm.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{comm.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{formatPlatformName(comm.platform)}</span>
                        <span>•</span>
                        <a
                          href={comm.invite_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-400 hover:underline flex items-center gap-1"
                        >
                          <span>Invite Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-300">
                      {formatCategoryName(comm.category)}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {formatNumber(comm.member_count)}
                    </td>
                    <td className="px-6 py-4">
                      {comm.verification_image_url ? (
                        <button
                          onClick={() => setSelectedProofImage(comm.verification_image_url!)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-400" />
                          <span>View Screenshot</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">None uploaded</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={comm.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {comm.status === 'SUBMITTED' || comm.status === 'UNDER_REVIEW' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleApprove(comm.id)}
                            className="text-xs font-bold gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verify</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleReject(comm.id)}
                            className="text-xs font-bold gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Audited</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* SCREENSHOT PREVIEW MODAL */}
      <Modal
        isOpen={!!selectedProofImage}
        onClose={() => setSelectedProofImage(null)}
        title="Member Count Verification Screenshot"
        description="Verify that the group member count and activity matches the partner submission."
        maxWidth="lg"
      >
        {selectedProofImage && (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black/60 max-h-[500px] flex items-center justify-center">
              <img
                src={selectedProofImage}
                alt="Verification Proof"
                className="w-full h-auto object-contain max-h-[480px]"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedProofImage(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

