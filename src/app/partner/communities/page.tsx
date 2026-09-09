'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { formatNumber } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowLeft,
  CheckCircle2,
  Edit2,
  ExternalLink,
  MessageSquare,
  PlusCircle,
  Radio,
  RefreshCw,
  Users,
} from 'lucide-react';

interface CommunityItem {
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
}

export default function PartnerCommunitiesPage() {
  const { user } = useAuth();

  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPlatform, setAddPlatform] = useState<'WHATSAPP_GROUP' | 'WHATSAPP_CHANNEL'>('WHATSAPP_GROUP');
  const [addNiche, setAddNiche] = useState('');
  const [addMemberCount, setAddMemberCount] = useState<number | ''>('');
  const [addInviteLink, setAddInviteLink] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit Modal State
  const [editingCommunity, setEditingCommunity] = useState<CommunityItem | null>(null);
  const [editInviteLink, setEditInviteLink] = useState('');
  const [editMemberCount, setEditMemberCount] = useState<number | ''>('');
  const [editNiche, setEditNiche] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const url = user?.id ? `/api/partner/communities?user_id=${user.id}` : '/api/partner/communities';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCommunities(data.data);
      }
    } catch (err) {
      console.error('Failed to load communities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [user?.id]);

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      setErrorMessage('Please enter your community name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/partner/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_id: user?.id || '00000000-0000-0000-0000-000000000000',
          name: addName.trim(),
          platform: addPlatform,
          niche: addNiche.trim(),
          invite_link: addInviteLink.trim(),
          member_count: Number(addMemberCount) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create community');
      }

      setIsAddModalOpen(false);
      // Reset form
      setAddName('');
      setAddNiche('');
      setAddInviteLink('');
      setAddMemberCount('');
      await fetchCommunities();
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (comm: CommunityItem) => {
    setEditingCommunity(comm);
    setEditInviteLink(comm.invite_link === 'Pending link' ? '' : comm.invite_link || '');
    setEditMemberCount(comm.member_count || '');
    setEditNiche(comm.description?.replace(/^Niche:\s*/, '') || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommunity) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/partner/communities/${editingCommunity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invite_link: editInviteLink.trim() || 'Pending link',
          member_count: Number(editMemberCount) || 0,
          description: editNiche.trim() ? `Niche: ${editNiche.trim()}` : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update community');
      }

      setEditingCommunity(null);
      await fetchCommunities();
    } catch (err: any) {
      alert(err.message || 'Failed to save updates');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="py-6 sm:py-10 bg-slate-50 dark:bg-dark-900 min-h-screen transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/partner"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Your WhatsApp Communities
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Add your groups or channels to start receiving paid sponsor ad jobs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchCommunities}
              className="gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              size="md"
              variant="primary"
              onClick={() => {
                setErrorMessage(null);
                setIsAddModalOpen(true);
              }}
              className="font-bold gap-2 text-xs shadow-md shadow-brand-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add WhatsApp Community</span>
            </Button>
          </div>
        </div>

        {/* Communities List */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-500" />
            <span>Loading your communities...</span>
          </div>
        ) : communities.length === 0 ? (
          <Card className="max-w-md mx-auto p-8 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Communities Registered Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Register your active WhatsApp group or channel so verified businesses can sponsor posts.
              </p>
            </div>
            <Button
              size="md"
              variant="primary"
              onClick={() => setIsAddModalOpen(true)}
              className="font-bold text-xs gap-1.5 mx-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Your First Community</span>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {communities.map((comm) => (
              <Card
                key={comm.id}
                className="p-5 bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-brand-500/40 transition-all shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-0.5">
                        {comm.platform === 'WHATSAPP_CHANNEL' ? 'WhatsApp Channel' : 'WhatsApp Group'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {comm.name}
                      </h3>
                    </div>
                    <StatusBadge status={comm.status} />
                  </div>

                  {comm.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {comm.description}
                    </p>
                  )}

                  {comm.status === 'REJECTED' && comm.rejection_reason && (
                    <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px]">
                      <span className="font-bold">Notice:</span> {comm.rejection_reason}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Members:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatNumber(comm.member_count)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Invite Link:</span>
                      {comm.invite_link && comm.invite_link.startsWith('http') ? (
                        <a
                          href={comm.invite_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Not added yet</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(comm)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Link / Info</span>
                  </button>

                  <Link href="/partner/assignments">
                    <Button size="sm" variant="outline" className="text-xs font-semibold">
                      Ad Tasks
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. ADD COMMUNITY MODAL (SIMPLE & FAST) */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Your WhatsApp Community"
        description="Fill in your community details so we can match you with verified sponsor ads."
        maxWidth="md"
      >
        <form onSubmit={handleCreateCommunity} className="space-y-3.5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Group vs Channel Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Community Type *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setAddPlatform('WHATSAPP_GROUP')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  addPlatform === 'WHATSAPP_GROUP'
                    ? 'border-brand-500 bg-brand-500/10 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold">WhatsApp Group</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Up to 1,024 members</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAddPlatform('WHATSAPP_CHANNEL')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  addPlatform === 'WHATSAPP_CHANNEL'
                    ? 'border-brand-500 bg-brand-500/10 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Radio className="w-4 h-4 text-blue-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold">WhatsApp Channel</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Unlimited followers</div>
                </div>
              </button>
            </div>
          </div>

          {/* Community Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Community Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unilag Campus Tech Hub"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Topic / Niche (TEXT FIELD) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topic or Niche *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. University students, Tech, Crypto, Wholesale vendors"
              value={addNiche}
              onChange={(e) => setAddNiche(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Member Count & Invite Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Approximate Member Count *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 850"
                value={addMemberCount}
                onChange={(e) => setAddMemberCount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Link <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://chat.whatsapp.com/..."
                value={addInviteLink}
                onChange={(e) => setAddInviteLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} className="font-bold text-xs">
              <span>Save Community</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* 2. EDIT COMMUNITY LINK & DETAILS MODAL */}
      {/* ========================================================= */}
      {editingCommunity && (
        <Modal
          isOpen={!!editingCommunity}
          onClose={() => setEditingCommunity(null)}
          title={`Edit ${editingCommunity.name}`}
          description="Update your WhatsApp link, member count, or community topic."
          maxWidth="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Invite or Channel Link
              </label>
              <input
                type="url"
                placeholder="https://chat.whatsapp.com/... or channel link"
                value={editInviteLink}
                onChange={(e) => setEditInviteLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Updated Member Count
              </label>
              <input
                type="number"
                value={editMemberCount}
                onChange={(e) => setEditMemberCount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Community Topic / Niche
              </label>
              <input
                type="text"
                value={editNiche}
                onChange={(e) => setEditNiche(e.target.value)}
                placeholder="e.g. Campus Students, Tech, Crypto"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2.5">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingCommunity(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isSavingEdit} className="font-bold text-xs">
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
