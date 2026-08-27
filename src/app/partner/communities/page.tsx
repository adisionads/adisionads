'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/app-context';
import { COMMUNITY_CATEGORIES_LIST } from '@/lib/constants';
import { formatCategoryName, formatNumber, formatPlatformName } from '@/lib/utils';
import { CommunityCategory, CommunityPlatform } from '@/types';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, TextArea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  PlusCircle,
  ShieldCheck,
  Upload,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function PartnerCommunitiesPage() {
  const { communities, addCommunity } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<CommunityPlatform>('WHATSAPP_GROUP');
  const [category, setCategory] = useState<CommunityCategory>('STUDENTS_CAMPUS');
  const [inviteLink, setInviteLink] = useState('');
  const [memberCount, setMemberCount] = useState<number>(1200);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [proofImageUrl, setProofImageUrl] = useState(
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80'
  );

  const handleSubmitCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !inviteLink.trim()) {
      alert('Please fill in the community name and invite link.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      addCommunity({
        name,
        platform,
        category,
        invite_link: inviteLink,
        member_count: Number(memberCount),
        description,
        location,
        verification_image_url: proofImageUrl,
      });
      setIsSubmitting(false);
      setIsAddModalOpen(false);
      // Reset form
      setName('');
      setInviteLink('');
      setDescription('');
    }, 600);
  };

  return (
    <div className="py-8 sm:py-12 bg-dark-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/partner"
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Partner Dashboard</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Communities</h1>
            <p className="text-sm text-slate-400">
              Submit your WhatsApp Groups and Channels for verification to receive high-paying ad assignments.
            </p>
          </div>

          <Button
            size="md"
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="font-bold gap-2 shadow-lg shadow-brand-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Community</span>
          </Button>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((comm) => (
            <Card
              key={comm.id}
              className="p-6 border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block mb-1">
                      {formatPlatformName(comm.platform)}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight">{comm.name}</h3>
                  </div>
                  <StatusBadge status={comm.status} />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {comm.description || 'Active community with high daily discussion.'}
                </p>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-semibold text-slate-200">
                      {formatCategoryName(comm.category)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verified Members:</span>
                    <span className="font-bold text-white">{formatNumber(comm.member_count)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Performance Score:</span>
                    <span className="font-bold text-emerald-400">
                      {comm.performance_score ? `${comm.performance_score}/100` : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800 flex items-center justify-between">
                <a
                  href={comm.invite_link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <span>Open Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <Link href="/partner/assignments">
                  <Button size="sm" variant="outline" className="text-xs">
                    View Assigned Tasks
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ADD COMMUNITY MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Digital Community"
        description="Provide details and audience proof for administrator review."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitCommunity} className="space-y-4">
          <Input
            label="Community Name"
            placeholder="e.g. UNILAG Tech & Gadget Hub"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Platform Type
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as CommunityPlatform)}
                className="w-full h-11 rounded-xl border border-slate-700/80 bg-slate-900 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="WHATSAPP_GROUP">WhatsApp Group</option>
                <option value="WHATSAPP_CHANNEL">WhatsApp Channel</option>
                <option value="TELEGRAM">Telegram Community</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CommunityCategory)}
                className="w-full h-11 rounded-xl border border-slate-700/80 bg-slate-900 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                {COMMUNITY_CATEGORIES_LIST.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Invite Link / URL"
              placeholder="https://chat.whatsapp.com/..."
              value={inviteLink}
              onChange={(e) => setInviteLink(e.target.value)}
              required
            />

            <Input
              label="Member / Follower Count"
              type="number"
              min={100}
              placeholder="e.g. 2500"
              value={memberCount}
              onChange={(e) => setMemberCount(Number(e.target.value))}
              helperText="Minimum 500 members recommended for fast approval."
              required
            />
          </div>

          <Input
            label="Verification Screenshot Image URL"
            placeholder="https://your-image-host.com/screenshot.jpg"
            value={proofImageUrl}
            onChange={(e) => setProofImageUrl(e.target.value)}
            helperText="Screenshot showing group info and member count."
          />

          <TextArea
            label="Community Description & Rules"
            rows={3}
            placeholder="Briefly describe your audience, typical topics, and engagement level..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="font-bold">
              Submit for Verification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

