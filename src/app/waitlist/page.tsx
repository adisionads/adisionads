'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Copy,
  HelpCircle,
  Megaphone,
  MessageSquare,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type WaitlistRole = 'ADVERTISER' | 'COMMUNITY_PARTNER';

export default function WaitlistPage() {
  const [role, setRole] = useState<WaitlistRole>('ADVERTISER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [entityName, setEntityName] = useState('');
  const [category, setCategory] = useState('TECHNOLOGY');
  const [metricEstimate, setMetricEstimate] = useState('');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    position: number;
    referralCode: string;
    isExisting?: boolean;
    message?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          country,
          role,
          company_or_community_name: entityName,
          estimated_reach_or_budget: metricEstimate,
          notes: `${category ? `Category: ${category}. ` : ''}${notes}`,
        }),
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
      role === 'ADVERTISER'
        ? `Hey! I just joined the early access waitlist for Adision — the marketplace to run targeted ads across active WhatsApp groups with verified click analytics. Check it out here: ${link}`
        : `Hey! I just joined the early access waitlist for Adision to monetize WhatsApp groups with brand sponsorships and direct bank payouts. Join here: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="py-12 sm:py-20 min-h-screen bg-slate-50 dark:bg-dark-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Badge & Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-500/30 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-spin" />
            <span>VIP Early Access Open</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Reach the Right Communities <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-500">
              Before Anyone Else.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Adision is launching the premier performance marketplace for WhatsApp groups and channels.
            Be first in line for our public launch.
          </p>
        </div>

        {/* Success View */}
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
                "Thank you for joining early. We will notify you via email and WhatsApp as soon as your batch is activated."}
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
                🔗 <span className="font-bold text-slate-900 dark:text-white">Invite Your Network:</span> Share your invite link with colleagues or community owners:
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
        ) : (
          /* Form View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form */}
            <div className="lg:col-span-7">
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xl p-6 sm:p-8">
                {/* Role Switcher Pill */}
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                    Select Your Goal:
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setRole('ADVERTISER')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                        role === 'ADVERTISER'
                          ? 'bg-brand-500 text-dark-900 shadow-md'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>I Want to Advertise</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('COMMUNITY_PARTNER')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                        role === 'COMMUNITY_PARTNER'
                          ? 'bg-brand-500 text-dark-900 shadow-md'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>I Own a Community</span>
                    </button>
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
                      Full Name *
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

                  {/* Email, Phone & Country Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Work or Personal Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="samuel@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+234 800 000 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Country *
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="Nigeria">Nigeria 🇳🇬</option>
                        <option value="Ghana">Ghana 🇬🇭</option>
                        <option value="Kenya">Kenya 🇰🇪</option>
                        <option value="South Africa">South Africa 🇿🇦</option>
                        <option value="United Kingdom">United Kingdom 🇬🇧</option>
                        <option value="United States">United States 🇺🇸</option>
                        <option value="Canada">Canada 🇨🇦</option>
                        <option value="Other">Other / Global</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Role Fields */}
                  {role === 'ADVERTISER' ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Business / Product Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. SwiftPay, Nova Apparel"
                            value={entityName}
                            onChange={(e) => setEntityName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Monthly Ad Budget
                          </label>
                          <select
                            value={metricEstimate}
                            onChange={(e) => setMetricEstimate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="">Select an estimate</option>
                            <option value="UNDER_50K">Under ₦50,000</option>
                            <option value="50K_250K">₦50,000 – ₦250,000</option>
                            <option value="250K_1M">₦250,000 – ₦1,000,000</option>
                            <option value="1M_PLUS">₦1,000,000+</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Target Audience Niche
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
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
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            WhatsApp Group / Channel Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Lagos Tech Network"
                            value={entityName}
                            onChange={(e) => setEntityName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Member Count Estimate
                          </label>
                          <select
                            value={metricEstimate}
                            onChange={(e) => setMetricEstimate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="">Select community size</option>
                            <option value="200_500">200 – 500 members</option>
                            <option value="500_1000">500 – 1,024 members (Full Group)</option>
                            <option value="1000_5000">1,000 – 5,000 members (Channel)</option>
                            <option value="5000_PLUS">5,000+ members (Multi-group/Channel)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Community Niche
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
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
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isLoading}
                      className="w-full font-bold shadow-lg shadow-brand-500/25"
                    >
                      <span>Reserve My Early Access Spot</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>

                  <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2">
                    🔒 No spam. We will only reach out when early access keys are ready for your batch.
                  </p>
                </form>
              </Card>
            </div>

            {/* Right Column: What to Expect & Support */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm p-6 space-y-5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <span>What to Expect</span>
                </h3>

                <div className="space-y-4">
                  {role === 'ADVERTISER' ? (
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
                            Get invited to launch WhatsApp campaigns as soon as onboarding opens for your category.
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Verified Audience Placements
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Connect directly with vetted WhatsApp communities with transparent, real-time click tracking.
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Onboarding Guidance
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Direct assistance from our team to help format your ad broadcast copy and target the right audiences.
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Priority Group Verification
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Your WhatsApp community is reviewed and verified first for upcoming advertiser campaigns.
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Direct Bank Payouts
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Earn from sponsored broadcasts with payouts sent directly to your Nigerian bank account upon verification.
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Audience Quality Control
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            You review and approve every ad assignment before posting to protect your group members.
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
                  <div className="font-bold text-slate-900 dark:text-white">Questions Before Joining?</div>
                  <div className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Have questions about community eligibility or ad campaigns? Reach out to us at <span className="font-semibold text-slate-900 dark:text-white">adisionads@gmail.com</span>.
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
