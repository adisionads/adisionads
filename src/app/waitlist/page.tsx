'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Copy,
  MessageSquare,
  Radio,
  Sparkles,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { COUNTRY_DIAL_CODES, normalizePhoneNumber } from '@/lib/utils';

type ChosenRole = 'COMMUNITY_OWNER' | 'ADVERTISER' | null;

function WaitlistContent() {
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get('role') || searchParams.get('type');

  // State
  const [chosenRole, setChosenRole] = useState<ChosenRole>(null);

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+234');
  const [country, setCountry] = useState('Nigeria');

  // Community Owner Fields (NO group name, niche is text field, link is optional)
  const [communityType, setCommunityType] = useState<'GROUP' | 'CHANNEL'>('GROUP');
  const [communityNiche, setCommunityNiche] = useState('');
  const [memberRange, setMemberRange] = useState('');
  const [exactMemberCount, setExactMemberCount] = useState('');
  const [communityLink, setCommunityLink] = useState('');

  // Advertiser Fields (target audience is text field)
  const [businessName, setBusinessName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [adBudget, setAdBudget] = useState('');
  const [productDescription, setProductDescription] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    position: number;
    referralCode: string;
    isExisting?: boolean;
    message?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-select role if passed via URL query parameter
  useEffect(() => {
    if (initialRoleParam) {
      const lower = initialRoleParam.toLowerCase();
      if (lower.includes('partner') || lower.includes('community') || lower.includes('group') || lower.includes('channel')) {
        setChosenRole('COMMUNITY_OWNER');
      } else if (lower.includes('advertiser') || lower.includes('business') || lower.includes('brand')) {
        setChosenRole('ADVERTISER');
      }
    }
  }, [initialRoleParam]);

  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    const found = COUNTRY_DIAL_CODES.find((c) => c.country === selectedCountry);
    if (found && found.code && found.code !== '+') {
      setDialCode(found.code);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const formattedPhone = normalizePhoneNumber(phone, dialCode);

    let payload: any = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: formattedPhone,
      country,
    };

    if (chosenRole === 'COMMUNITY_OWNER') {
      const typeLabel = communityType === 'GROUP' ? 'WhatsApp Group' : 'WhatsApp Channel';
      const computedReach = exactMemberCount
        ? `${exactMemberCount} members (${typeLabel})`
        : memberRange || 'Not specified';

      payload = {
        ...payload,
        role: 'COMMUNITY_PARTNER',
        company_or_community_name: `${communityNiche.trim() || 'General'} (${typeLabel})`,
        estimated_reach_or_budget: computedReach,
        notes: `Type: ${typeLabel}. Niche: ${communityNiche.trim() || 'General'}.${communityLink.trim() ? ` Link: ${communityLink.trim()}` : ''}`,
      };
    } else {
      payload = {
        ...payload,
        role: 'ADVERTISER',
        company_or_community_name: businessName.trim(),
        estimated_reach_or_budget: adBudget || 'Not specified',
        notes: `Target Audience: ${targetAudience.trim() || 'General'}.${productDescription.trim() ? ` Description: ${productDescription.trim()}` : ''}`,
      };
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit. Please check your information.');
      }

      setSuccessData({
        position: data.position,
        referralCode: data.referral_code,
        isExisting: data.isExisting,
        message: data.message,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getShareLink = () => {
    if (typeof window === 'undefined') return 'https://adision.co/waitlist';
    return `${window.location.origin}/waitlist?ref=${successData?.referralCode || ''}`;
  };

  const copyShareLink = () => {
    const link = getShareLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnWhatsApp = () => {
    const link = getShareLink();
    const text =
      chosenRole === 'COMMUNITY_OWNER'
        ? `Hey! I just registered my WhatsApp community on the Adision early access waitlist to get paid for sponsored posts. Join here: ${link}`
        : `Hey! I just registered on the Adision early access waitlist to advertise directly inside active WhatsApp groups with click tracking. Check it out: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="py-8 sm:py-14 min-h-screen bg-slate-50 dark:bg-dark-900 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        {/* Clean, Compact Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-brand-500/30 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Early Access Waitlist</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Join Adision Early Access
          </h1>

          <p className="max-w-md mx-auto text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Connect active WhatsApp groups and channels with verified businesses.
          </p>
        </div>

        {/* 1. SUCCESS VIEW */}
        {successData ? (
          <Card className="max-w-lg mx-auto border-brand-500/40 bg-white dark:bg-slate-900/95 shadow-2xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mx-auto mb-4 text-brand-600 dark:text-brand-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="inline-block px-3 py-0.5 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              Spot Reserved
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {successData.isExisting ? "You're Already on the Waitlist!" : "You're on the Waitlist!"}
            </h2>

            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto">
              {successData.message ||
                "Thank you for joining. We will notify you on WhatsApp and email as soon as your batch opens."}
            </p>

            {/* Position Box */}
            <div className="my-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-around gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Position
                </span>
                <div className="text-3xl font-black text-brand-600 dark:text-brand-400 mt-0.5">
                  #{successData.position}
                </div>
              </div>

              <div className="h-8 w-[1px] bg-slate-300 dark:bg-slate-700" />

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Referral Code
                </span>
                <div className="text-xl font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {successData.referralCode}
                </div>
              </div>
            </div>

            {/* Referral / Share Actions */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                <Button
                  onClick={shareOnWhatsApp}
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto font-bold gap-2 text-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </Button>

                <Button
                  onClick={copyShareLink}
                  variant="outline"
                  size="md"
                  className="w-full sm:w-auto font-semibold gap-2 text-xs"
                >
                  {copied ? <BadgeCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400 font-medium">
                Home
              </Link>
              <span>•</span>
              <Link href="/pricing" className="hover:text-brand-600 dark:hover:text-brand-400 font-medium">
                Pricing
              </Link>
            </div>
          </Card>
        ) : chosenRole === null ? (
          /* 2. INITIAL SELECTION: TWO CLEAR BUTTONS */
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Choose How You Want to Register
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {/* BUTTON 1: WhatsApp Group / Channel Owners */}
              <div
                onClick={() => setChosenRole('COMMUNITY_OWNER')}
                className="group cursor-pointer rounded-2xl p-5 sm:p-6 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-150 hover:shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      Earn Money
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      I Own a WhatsApp Group or Channel
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Monetize your active members. Get paid directly to your bank account for sharing sponsor ads.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-brand-500 hover:bg-brand-600 text-dark-900 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Register as Group Owner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* BUTTON 2: Businesses & Advertisers */}
              <div
                onClick={() => setChosenRole('ADVERTISER')}
                className="group cursor-pointer rounded-2xl p-5 sm:p-6 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-150 hover:shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                      Get Customers
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      I Want to Advertise My Business
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Promote your business directly inside active WhatsApp communities with genuine link click tracking.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Register to Advertise</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 3. DEDICATED, COMPACT REGISTRATION FORM (CENTERED, MINIMAL SCROLL) */
          <div className="max-w-lg mx-auto animate-in fade-in duration-200">
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xl p-5 sm:p-7">
              {/* Top Navigation / Current Option */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setChosenRole(null);
                    setErrorMsg(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change option</span>
                </button>

                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30">
                  {chosenRole === 'COMMUNITY_OWNER' ? 'Group / Channel Owner' : 'Business Advertiser'}
                </span>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Okon"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* WhatsApp Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={dialCode}
                      onChange={(e) => setDialCode(e.target.value)}
                      className="w-28 py-2.5 px-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                    >
                      {COUNTRY_DIAL_CODES.map((c) => (
                        <option key={c.country} value={c.code}>
                          {c.flag} {c.code || 'Other'}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 08012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* Email & Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Country *
                    </label>
                    <select
                      value={country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                    >
                      {COUNTRY_DIAL_CODES.map((c) => (
                        <option key={c.country} value={c.country}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ===================================================== */}
                {/* COMMUNITY OWNER FIELDS */}
                {/* ===================================================== */}
                {chosenRole === 'COMMUNITY_OWNER' ? (
                  <div className="pt-2 space-y-3.5 border-t border-slate-100 dark:border-slate-800">
                    {/* Group vs Channel Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Community Type *
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setCommunityType('GROUP')}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                            communityType === 'GROUP'
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
                          onClick={() => setCommunityType('CHANNEL')}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                            communityType === 'CHANNEL'
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

                    {/* Community Topic / Niche (PLAIN TEXT FIELD) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Community Topic or Niche *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. University students, Tech & Coding, Crypto, Wholesale vendors"
                        value={communityNiche}
                        onChange={(e) => setCommunityNiche(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    {/* Member Count Range & Exact Count */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Member Count Range *
                        </label>
                        <select
                          required
                          value={memberRange}
                          onChange={(e) => setMemberRange(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                        >
                          <option value="">Select range</option>
                          <option value="100 – 300 members">100 – 300 members</option>
                          <option value="300 – 500 members">300 – 500 members</option>
                          <option value="500 – 1,024 members">500 – 1,024 members</option>
                          <option value="1,000 – 5,000 followers">1,000 – 5,000 followers</option>
                          <option value="5,000 – 10,000 followers">5,000 – 10,000 followers</option>
                          <option value="10,000+ followers">10,000+ followers</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Exact Member Count <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 780"
                          value={exactMemberCount}
                          onChange={(e) => setExactMemberCount(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>

                    {/* WhatsApp Invite Link (OPTIONAL) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        WhatsApp Link <span className="text-slate-400 font-normal">(Optional — can add later)</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://chat.whatsapp.com/... or channel link"
                        value={communityLink}
                        onChange={(e) => setCommunityLink(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                ) : (
                  /* ===================================================== */
                  /* ADVERTISER FIELDS */
                  /* ===================================================== */
                  <div className="pt-2 space-y-3.5 border-t border-slate-100 dark:border-slate-800">
                    {/* Business Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Business or Brand Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SwiftPay, Nova Fashion, Zed Logistics"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    {/* Target Audience (PLAIN TEXT FIELD) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Target Audience or Niche *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. University students, Tech lovers, Online shoppers, Crypto traders"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    {/* Monthly Budget */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Estimated Monthly Ad Spend
                      </label>
                      <select
                        value={adBudget}
                        onChange={(e) => setAdBudget(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                      >
                        <option value="">Select an estimate</option>
                        <option value="UNDER_50K">Under ₦50,000</option>
                        <option value="50K_250K">₦50,000 – ₦250,000</option>
                        <option value="250K_1M">₦250,000 – ₦1,000,000</option>
                        <option value="1M_PLUS">₦1,000,000+</option>
                        <option value="NOT_SURE">Just starting / Not sure yet</option>
                      </select>
                    </div>

                    {/* Promoting description (Optional) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        What are you promoting? <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mobile app, online course, discounts, clothes"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full font-bold shadow-lg shadow-brand-500/25"
                  >
                    <span>
                      {chosenRole === 'COMMUNITY_OWNER'
                        ? 'Join Waitlist as Group Owner'
                        : 'Join Waitlist as Advertiser'}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WaitlistPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Sparkles className="w-4 h-4 text-brand-500 animate-spin" />
            <span>Loading waitlist...</span>
          </div>
        </div>
      }
    >
      <WaitlistContent />
    </Suspense>
  );
}
