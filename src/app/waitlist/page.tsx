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
  HelpCircle,
  Megaphone,
  MessageSquare,
  Radio,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
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

  // Community Owner Specific Fields (NO business name)
  const [communityName, setCommunityName] = useState('');
  const [communityType, setCommunityType] = useState<'GROUP' | 'CHANNEL'>('GROUP');
  const [memberRange, setMemberRange] = useState('');
  const [exactMemberCount, setExactMemberCount] = useState('');
  const [communityCategory, setCommunityCategory] = useState('STUDENTS_CAMPUS');
  const [communityLink, setCommunityLink] = useState('');

  // Advertiser Specific Fields (NO member count)
  const [businessName, setBusinessName] = useState('');
  const [adBudget, setAdBudget] = useState('');
  const [targetAudience, setTargetAudience] = useState('TECHNOLOGY');
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

    // Payload based on role
    let payload: any = {
      full_name: fullName,
      email,
      phone: formattedPhone,
      country,
    };

    if (chosenRole === 'COMMUNITY_OWNER') {
      // For Group / Channel Owners: No business name, only group name, type, member count/range, category, link
      const computedReach = exactMemberCount
        ? `${exactMemberCount} members (${communityType === 'GROUP' ? 'WhatsApp Group' : 'WhatsApp Channel'})`
        : memberRange || 'Not specified';

      payload = {
        ...payload,
        role: 'COMMUNITY_PARTNER',
        company_or_community_name: communityName,
        estimated_reach_or_budget: computedReach,
        notes: `Community Type: ${communityType === 'GROUP' ? 'WhatsApp Group' : 'WhatsApp Channel'}. Category: ${communityCategory}.${communityLink ? ` Link: ${communityLink}` : ''}`,
      };
    } else {
      // For Advertisers: Business name, budget, audience, product note (NO member count)
      payload = {
        ...payload,
        role: 'ADVERTISER',
        company_or_community_name: businessName,
        estimated_reach_or_budget: adBudget || 'Not specified',
        notes: `Target Audience: ${targetAudience}.${productDescription ? ` Description: ${productDescription}` : ''}`,
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
    <div className="py-12 sm:py-20 min-h-screen bg-slate-50 dark:bg-dark-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Badge & Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-500/30 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-spin" />
            <span>Early Access Priority Waitlist</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Reach the Right Communities <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-500">
              Before Anyone Else.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Adision connects active WhatsApp groups & channels with verified businesses. Join the waitlist for early access.
          </p>
        </div>

        {/* 1. SUCCESS VIEW */}
        {successData ? (
          <Card className="max-w-2xl mx-auto border-brand-500/40 bg-white/95 dark:bg-slate-900/90 shadow-2xl p-8 sm:p-10 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mx-auto mb-6 text-brand-600 dark:text-brand-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 text-xs font-black uppercase tracking-widest mb-3">
              Spot Reserved
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {successData.isExisting ? "You're Already on the Waitlist!" : "You're on the Waitlist!"}
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 max-w-md mx-auto">
              {successData.message ||
                "Thank you for joining early. We will notify you via WhatsApp and email as soon as your onboarding batch opens."}
            </p>

            {/* Position Box */}
            <div className="my-8 p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-around gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Your Priority Position
                </span>
                <div className="text-4xl font-black text-brand-600 dark:text-brand-400 mt-1">
                  #{successData.position}
                </div>
              </div>

              <div className="h-10 w-[1px] bg-slate-300 dark:bg-slate-700 hidden sm:block" />

              <div>
                <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Your Referral Code
                </span>
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                  {successData.referralCode}
                </div>
              </div>
            </div>

            {/* Referral / Share Actions */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                🔗 <span className="font-bold text-slate-900 dark:text-white">Invite Others:</span> Share your invite link with other community admins or business owners:
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={shareOnWhatsApp}
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto font-bold gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </Button>

                <Button
                  onClick={copyShareLink}
                  variant="outline"
                  size="md"
                  className="w-full sm:w-auto font-semibold gap-2"
                >
                  {copied ? <BadgeCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
                </Button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400 font-medium">
                Return to Home
              </Link>
              <span>•</span>
              <Link href="/pricing" className="hover:text-brand-600 dark:hover:text-brand-400 font-medium">
                View Launch Pricing
              </Link>
            </div>
          </Card>
        ) : chosenRole === null ? (
          /* 2. INITIAL SELECTION: TWO CLEAR BUTTONS / CARDS */
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                How Do You Want to Use Adision?
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Select your option below to open your customized registration:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* BUTTON 1: WhatsApp Group / Channel Owners */}
              <div
                onClick={() => setChosenRole('COMMUNITY_OWNER')}
                className="group relative cursor-pointer rounded-2xl p-7 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Get Paid to Post
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      I Own a WhatsApp Group or Channel
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      You manage an active WhatsApp group or broadcast channel. Get paid directly to your bank account for sharing verified sponsor announcements with your members.
                    </p>
                  </div>

                  <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Monetize your active members</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Direct bank payouts upon verified post</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>You keep 100% control of your group</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-brand-500 hover:bg-brand-600 text-dark-900 flex items-center justify-center gap-2 transition-colors shadow-md shadow-brand-500/20"
                  >
                    <span>Register as Community Owner</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* BUTTON 2: Businesses & Advertisers */}
              <div
                onClick={() => setChosenRole('ADVERTISER')}
                className="group relative cursor-pointer rounded-2xl p-7 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                      Get Customers & Clicks
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      I Want to Advertise My Business
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      You run a business, shop, startup, or service. Reach targeted Nigerian customers directly inside active WhatsApp communities with genuine link click tracking.
                    </p>
                  </div>

                  <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>Target specific niches (Students, Tech, etc.)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>Real-time link click analytics & proof</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>Safe payment hold until ad is verified</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <span>Register to Advertise</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 3. DEDICATED REGISTRATION FORM */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
            <div className="lg:col-span-7">
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xl p-6 sm:p-8">
                {/* Back / Switch Header */}
                <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setChosenRole(null);
                      setErrorMsg(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Options</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Registering as:
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30">
                      {chosenRole === 'COMMUNITY_OWNER' ? 'WhatsApp Community Owner' : 'Business Advertiser'}
                    </span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel Okon"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {/* WhatsApp Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      WhatsApp Phone Number *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={dialCode}
                        onChange={(e) => setDialCode(e.target.value)}
                        className="w-32 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                      >
                        {COUNTRY_DIAL_CODES.map((c) => (
                          <option key={c.country} value={c.code}>
                            {c.flag} {c.code || 'Other'}
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 08012345678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Start with 0 or without 0. We format it automatically for WhatsApp notifications.
                    </p>
                  </div>

                  {/* Email & Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Country *
                      </label>
                      <select
                        value={country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                  {/* ROLE SPECIFIC FIELDS */}
                  {/* ===================================================== */}

                  {chosenRole === 'COMMUNITY_OWNER' ? (
                    /* COMMUNITY OWNER FIELDS (NO BUSINESS NAME) */
                    <div className="pt-2 space-y-4 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                        Community Details
                      </div>

                      {/* Group or Channel Type Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Is this a WhatsApp Group or Channel? *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setCommunityType('GROUP')}
                            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                              communityType === 'GROUP'
                                ? 'border-brand-500 bg-brand-500/10 text-slate-900 dark:text-white'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-bold">WhatsApp Group</div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                Up to 1,024 members
                              </div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCommunityType('CHANNEL')}
                            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                              communityType === 'CHANNEL'
                                ? 'border-brand-500 bg-brand-500/10 text-slate-900 dark:text-white'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <Radio className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs font-bold">WhatsApp Channel</div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                Unlimited followers
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Group / Channel Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          {communityType === 'GROUP' ? 'WhatsApp Group Name *' : 'WhatsApp Channel Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={
                            communityType === 'GROUP'
                              ? 'e.g. Unilag Tech Community, Lagos Forex Hub'
                              : 'e.g. Daily Tech Updates, Nigeria Career Alerts'
                          }
                          value={communityName}
                          onChange={(e) => setCommunityName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>

                      {/* Member Count Number or Range */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Member Count Range *
                          </label>
                          <select
                            required
                            value={memberRange}
                            onChange={(e) => setMemberRange(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="">Select range</option>
                            <option value="100 – 300 members">100 – 300 members</option>
                            <option value="300 – 500 members">300 – 500 members</option>
                            <option value="500 – 1,024 members (Full Group)">500 – 1,024 members (Full Group)</option>
                            <option value="1,000 – 5,000 followers (Channel)">1,000 – 5,000 followers (Channel)</option>
                            <option value="5,000 – 10,000 followers">5,000 – 10,000 followers</option>
                            <option value="10,000+ followers">10,000+ followers</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Exact Number of Members <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 780"
                            value={exactMemberCount}
                            onChange={(e) => setExactMemberCount(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                      </div>

                      {/* Community Niche / Category */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Community Topic / Niche *
                        </label>
                        <select
                          value={communityCategory}
                          onChange={(e) => setCommunityCategory(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="STUDENTS_CAMPUS">University / Campus Students</option>
                          <option value="TECHNOLOGY">Tech, Coding & Design</option>
                          <option value="BUSINESS_FINANCE">Business & Personal Finance</option>
                          <option value="CRYPTO_WEB3">Crypto & Forex</option>
                          <option value="JOBS_CAREERS">Jobs & Vacancies</option>
                          <option value="FASHION_LIFESTYLE">Wholesale, Fashion & Vendors</option>
                          <option value="GENERAL">General & Social Discussion</option>
                        </select>
                      </div>

                      {/* Group Link (Optional) */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          WhatsApp Invite Link or Channel Link <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="url"
                          placeholder="https://chat.whatsapp.com/... or https://whatsapp.com/channel/..."
                          value={communityLink}
                          onChange={(e) => setCommunityLink(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Helps us verify your community faster during early access batch review.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* ADVERTISER FIELDS (NO MEMBER COUNT) */
                    <div className="pt-2 space-y-4 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Business & Campaign Details
                      </div>

                      {/* Business / Brand Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Business, Brand, or Product Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SwiftPay, Nova Fashion, Zed Logistics"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>

                      {/* Monthly Budget & Target Audience */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Estimated Monthly Ad Spend
                          </label>
                          <select
                            value={adBudget}
                            onChange={(e) => setAdBudget(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="">Select an estimate</option>
                            <option value="UNDER_50K">Under ₦50,000</option>
                            <option value="50K_250K">₦50,000 – ₦250,000</option>
                            <option value="250K_1M">₦250,000 – ₦1,000,000</option>
                            <option value="1M_PLUS">₦1,000,000+</option>
                            <option value="NOT_SURE">Just starting / Not sure yet</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Target Audience Niche
                          </label>
                          <select
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="TECHNOLOGY">Tech & Software Developers</option>
                            <option value="STUDENTS_CAMPUS">University / Campus Students</option>
                            <option value="BUSINESS_FINANCE">Business & Personal Finance</option>
                            <option value="CRYPTO_WEB3">Crypto & Web3 Traders</option>
                            <option value="JOBS_CAREERS">Jobs, Remote Work & Opportunities</option>
                            <option value="FASHION_LIFESTYLE">Fashion, Beauty & Lifestyle</option>
                            <option value="GENERAL">General & Entertainment</option>
                          </select>
                        </div>
                      </div>

                      {/* What are you promoting? (Optional) */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          What product or service will you be promoting? <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Mobile app launch, university campus discounts, ecommerce store"
                          value={productDescription}
                          onChange={(e) => setProductDescription(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isLoading}
                      className="w-full font-bold shadow-lg shadow-brand-500/25"
                    >
                      <span>
                        {chosenRole === 'COMMUNITY_OWNER'
                          ? 'Reserve Spot for My Community'
                          : 'Reserve Spot to Advertise'}
                      </span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>

                  <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2">
                    🔒 No spam. We will notify you on WhatsApp and email as soon as your batch opens.
                  </p>
                </form>
              </Card>
            </div>

            {/* Right Column: Role Perks & Guidance */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm p-6 space-y-5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <span>
                    {chosenRole === 'COMMUNITY_OWNER' ? 'For Community Owners' : 'For Business Advertisers'}
                  </span>
                </h3>

                <div className="space-y-4">
                  {chosenRole === 'COMMUNITY_OWNER' ? (
                    <>
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Priority Community Verification
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Your WhatsApp group or channel is reviewed first for upcoming sponsor campaigns in your category.
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Direct Bank Withdrawals
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Post the assigned sponsor ad, upload a quick screenshot proof, and withdraw your earnings directly to your bank.
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            You Keep 100% Control
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Adision never requests admin rights to your group. You decide when to accept and post ad jobs.
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Direct Early Access
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Be the first to launch campaigns into curated, high-activity WhatsApp groups in your target niche.
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Safe Payment Protection
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Your payment is held safely until the community admin uploads screenshot proof that your ad is live.
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Live Link Click Analytics
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Track genuine human clicks on your unique campaign link in real-time on your dashboard.
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Direct Inquiries / Contact Card */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">Need Any Help?</div>
                  <div className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Have questions about community verification or running ads? Contact us anytime at{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">adisionads@gmail.com</span>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WaitlistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Sparkles className="w-4 h-4 text-brand-500 animate-spin" />
          <span>Loading early access waitlist...</span>
        </div>
      </div>
    }>
      <WaitlistContent />
    </Suspense>
  );
}
