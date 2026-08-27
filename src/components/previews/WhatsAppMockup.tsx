'use client';

import React from 'react';
import { CheckCheck, ExternalLink, Image as ImageIcon, MessageCircle, Phone, Video, MoreVertical } from 'lucide-react';
import { formatCategoryName } from '@/lib/utils';
import { CommunityCategory } from '@/types';

interface WhatsAppMockupProps {
  communityName?: string;
  category?: CommunityCategory | string;
  adCopy: string;
  mediaUrl?: string;
  destinationUrl?: string;
  ctaText?: string;
  trackingCode?: string;
}

export function WhatsAppMockup({
  communityName = 'UNILAG Tech & Campus Hub 🚀',
  category = 'STUDENTS_CAMPUS',
  adCopy = 'Never run out of data again! Get 1GB Data for just ₦220 on SwiftPay.\n\n👇 Click the link below to get started:',
  mediaUrl,
  destinationUrl = 'https://adision.co/r/demo123',
  ctaText = 'Visit Website 🚀',
  trackingCode = 'ad_live_preview',
}: WhatsAppMockupProps) {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full max-w-sm mx-auto rounded-[32px] overflow-hidden border-[6px] border-slate-800 bg-[#0c1317] shadow-2xl font-sans">
      {/* Phone Status Bar Simulation */}
      <div className="bg-[#1f2c34] px-6 py-2 flex items-center justify-between text-[11px] text-slate-300 border-b border-[#2a3942]">
        <span className="font-semibold">{currentTime}</span>
        <div className="flex items-center gap-1.5 text-xs">
          <span>5G</span>
          <span>98%</span>
        </div>
      </div>

      {/* WhatsApp Chat Header */}
      <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-[#2a3942]">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-bold text-sm">
            {communityName.charAt(0)}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#1f2c34]" />
          </div>
          <div className="leading-tight">
            <h4 className="text-white text-xs font-semibold truncate max-w-[150px]">{communityName}</h4>
            <p className="text-[10px] text-emerald-400 font-medium">
              {formatCategoryName(category)} • 2,450 members
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <Video className="w-4 h-4" />
          <Phone className="w-4 h-4" />
          <MoreVertical className="w-4 h-4" />
        </div>
      </div>

      {/* WhatsApp Message Area with Pattern Background */}
      <div className="bg-[#0b141a] p-3.5 min-h-[380px] flex flex-col justify-end bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Date Divider */}
        <div className="flex justify-center mb-3">
          <span className="bg-[#182229] text-[10px] text-slate-400 px-3 py-1 rounded-lg shadow-sm">
            TODAY
          </span>
        </div>

        {/* Message Bubble (Broadcast / Placement Post) */}
        <div className="self-start max-w-[92%] bg-[#005c4b] text-white rounded-2xl rounded-tl-sm p-2 shadow-md border border-[#02735e]/40">
          {/* Creative Image Attachment if available */}
          {mediaUrl ? (
            <div className="relative rounded-xl overflow-hidden mb-2 aspect-video bg-black/40 border border-white/10">
              <img
                src={mediaUrl}
                alt="Ad Creative"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="rounded-xl mb-2 aspect-video bg-[#004d3f] border border-dashed border-[#007a64] flex flex-col items-center justify-center text-slate-300 p-4 text-center">
              <ImageIcon className="w-8 h-8 text-brand-400 mb-1 opacity-70" />
              <span className="text-[11px] font-medium text-slate-300">Ad Creative Media</span>
            </div>
          )}

          {/* Ad Copy Text */}
          <div className="px-1 py-1">
            <p className="text-[12px] leading-relaxed whitespace-pre-line text-slate-100 font-normal">
              {adCopy || 'Write your engaging ad copy here...'}
            </p>
          </div>

          {/* Clickable CTA Link Preview Box */}
          <div className="mt-2.5 bg-[#02493c] hover:bg-[#023e33] border border-[#026f5a] rounded-xl p-2.5 transition-colors cursor-pointer block">
            <div className="flex items-center justify-between text-brand-400 mb-1">
              <span className="text-[11px] font-bold tracking-wide flex items-center gap-1">
                {ctaText || 'Learn More'}
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
            <p className="text-[10px] text-slate-300 truncate font-mono">
              https://adision.co/r/{trackingCode}
            </p>
          </div>

          {/* Timestamp & Double Blue Ticks */}
          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-300/80 px-1">
            <span>{currentTime}</span>
            <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
          </div>
        </div>
      </div>

      {/* WhatsApp Message Input Bar */}
      <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2 border-t border-[#2a3942]">
        <div className="flex-1 bg-[#2a3942] rounded-full px-3.5 py-1.5 text-[11px] text-slate-400">
          Broadcast message...
        </div>
        <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-md">
          <MessageCircle className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
