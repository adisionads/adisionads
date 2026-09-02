'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  GraduationCap,
  Layers,
  MessageCircle,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { WhatsAppMockup } from '@/components/previews/WhatsAppMockup';
import { COMMUNITY_CATEGORIES_LIST, CAMPAIGN_PACKAGES } from '@/lib/constants';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function HomePage() {
  const [activePersona, setActivePersona] = useState<'advertiser' | 'partner'>('advertiser');
  const { setCurrentRole } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION WITH DUAL PERSONA SWITCHER */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800/80 bg-gradient-to-b from-dark-900 via-dark-900 to-[#070b12]">
        {/* Background glow flares */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Persona Switcher Pill */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-2xl">
              <button
                onClick={() => setActivePersona('advertiser')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  activePersona === 'advertiser'
                    ? 'bg-brand-500 text-dark-900 shadow-lg shadow-brand-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Advertise with ADISION</span>
              </button>

              <button
                onClick={() => setActivePersona('partner')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  activePersona === 'partner'
                    ? 'bg-brand-500 text-dark-900 shadow-lg shadow-brand-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Earn with Your Community</span>
              </button>
            </div>
          </div>

          {/* Hero Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Dynamic Copy based on Persona */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span>Adision — Performance Community Ad Marketplace</span>
              </div>

              {activePersona === 'advertiser' ? (
                <>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                    Reach <span className="text-brand-400">Thousands</span> in Verified WhatsApp Communities.
                  </h1>
                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Stop messaging individual group admins and getting scammed. Launch high-converting ad campaigns across verified WhatsApp Groups & Channels with real unique link click tracking.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                    <Link
                      href="/advertiser/campaigns/new"
                      onClick={() => setCurrentRole('ADVERTISER')}
                      className="w-full sm:w-auto"
                    >
                      <Button size="lg" variant="primary" className="w-full font-bold text-base">
                        <span>Launch a Campaign</span>
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                    <Link href="/pricing" className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="w-full">
                        <span>View Pricing Packages</span>
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                    Monetize Your <span className="text-brand-400">WhatsApp Group</span> on Autopilot.
                  </h1>
                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Turn your active WhatsApp audience into regular income. Receive pre-paid ad broadcast jobs, post them in your group, submit a screenshot proof, and get paid instantly to your bank account.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                    <Link
                      href="/partner/communities"
                      onClick={() => setCurrentRole('COMMUNITY_PARTNER')}
                      className="w-full sm:w-auto"
                    >
                      <Button size="lg" variant="primary" className="w-full font-bold text-base">
                        <span>Register Your Group</span>
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                    <Link
                      href="/partner/wallet"
                      onClick={() => setCurrentRole('COMMUNITY_PARTNER')}
                      className="w-full sm:w-auto"
                    >
                      <Button size="lg" variant="outline" className="w-full">
                        <span>View Partner Earnings Hub</span>
                      </Button>
                    </Link>
                  </div>
                </>
              )}

              {/* Quick Trust Counters */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">50+</div>
                  <div className="text-xs text-slate-400 font-medium">Verified Groups</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-brand-400">120K+</div>
                  <div className="text-xs text-slate-400 font-medium">Active Reach</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">99.4%</div>
                  <div className="text-xs text-slate-400 font-medium">Placement Proof</div>
                </div>
              </div>
            </div>

            {/* Right Column: Live WhatsApp Interactive Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm relative">
                {/* Visual authenticity tag */}
                <div className="absolute -top-4 -right-4 bg-brand-500 text-dark-900 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg z-20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Live Preview
                </div>
                <WhatsAppMockup
                  communityName={
                    activePersona === 'advertiser'
                      ? 'UNILAG Tech & Deals Hub 🚀'
                      : 'Campus Student Union Lounge 📚'
                  }
                  adCopy={
                    activePersona === 'advertiser'
                      ? `⚡️ NEVER RUN OUT OF DATA AGAIN! ⚡️\n\nGet 1GB Data for just ₦220 on SwiftPay.\nInstant airtime, electricity, and exam pins.\n\n🎁 Use Code: ADISION50 for 10% bonus!`
                      : `🎉 New Brand Partnership!\n\nCheck out the latest tech gadgets and student discounts for this semester.`
                  }
                  mediaUrl="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80"
                  destinationUrl="https://adision.co/r/live_preview"
                  ctaText="Download App & Claim 📲"
                  trackingCode="ad_live_preview"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section className="py-20 bg-dark-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">
              Simple & Reliable Workflow
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {activePersona === 'advertiser'
                ? 'How Advertisers Distribute in 3 Steps'
                : 'How Community Owners Earn in 3 Steps'}
            </h3>
          </div>

          {activePersona === 'advertiser' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-8 relative group hover:border-brand-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 font-extrabold text-xl flex items-center justify-center mb-6">
                  1
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Build Your Campaign</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Write your copy, upload creative images, select target categories (e.g. Students, Tech, VTU, Fashion), and preview your live WhatsApp ad mockup.
                </p>
              </Card>

              <Card className="p-8 relative group hover:border-brand-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 font-extrabold text-xl flex items-center justify-center mb-6">
                  2
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Pay via Bank Transfer</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Pay securely through PaymentPoint dynamic virtual bank accounts. ADISION holds funds in escrow until ad placement is verified.
                </p>
              </Card>

              <Card className="p-8 relative group hover:border-brand-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 font-extrabold text-xl flex items-center justify-center mb-6">
                  3
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Track Live Performance</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Watch unique clicks arrive in real time through unique tracking links, view screenshot proofs of placement, and download full reports.
                </p>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-8 relative group hover:border-brand-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 font-extrabold text-xl flex items-center justify-center mb-6">
                  1
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Register & Verify Group</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Submit your WhatsApp Group or Channel with follower proof screenshot. Our team verifies active engagement within hours.
                </p>
              </Card>

              <Card className="p-8 relative group hover:border-brand-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 font-extrabold text-xl flex items-center justify-center mb-6">
                  2
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Receive & Post Ads</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Accept matched campaign assignments in your dashboard, broadcast the ad copy + creative with your unique tracking link to your group.
                </p>
              </Card>

              <Card className="p-8 relative group hover:border-brand-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 font-extrabold text-xl flex items-center justify-center mb-6">
                  3
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Upload Proof & Withdraw</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Upload a screenshot showing the post in your group. Once verified, cash lands in your ADISION wallet for 1-click withdrawal to any Nigerian bank.
                </p>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* 3. POPULAR COMMUNITY CATEGORIES */}
      <section className="py-20 bg-[#070b12] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">
                Audience Niches
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Target High-Converting Communities
              </h3>
            </div>
            <Link href="/pricing">
              <span className="text-sm font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 mt-4 md:mt-0">
                Explore all packages <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMMUNITY_CATEGORIES_LIST.slice(0, 6).map((cat) => (
              <Card
                key={cat.id}
                className="p-6 bg-slate-900/40 hover:bg-slate-900/80 border-slate-800 hover:border-brand-500/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors">
                      {cat.label}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cat.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRICING TIERS */}
      <section className="py-20 bg-dark-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">
              Transparent Pricing
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Simple Packages. Guaranteed Distribution.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CAMPAIGN_PACKAGES.slice(0, 3).map((pkg) => (
              <Card
                key={pkg.id}
                className={`p-8 relative flex flex-col justify-between ${
                  pkg.is_popular
                    ? 'border-brand-500/50 bg-gradient-to-b from-brand-500/10 via-slate-900/90 to-slate-900 shadow-2xl'
                    : 'border-slate-800'
                }`}
              >
                {pkg.is_popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-500 text-dark-900 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Most Popular
                  </div>
                )}

                <div>
                  <h4 className="text-xl font-bold text-white">{pkg.name}</h4>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-black text-white">{formatCurrency(pkg.price)}</span>
                    <span className="text-xs text-slate-400 block mt-1">{pkg.duration_days} Days Active Distribution</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 mb-6 text-xs text-slate-300 font-semibold flex items-center justify-between">
                    <span>Target Reach:</span>
                    <span className="text-brand-400 font-bold">{pkg.estimated_reach}</span>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300 mb-8">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/advertiser/campaigns/new"
                  onClick={() => setCurrentRole('ADVERTISER')}
                  className="w-full"
                >
                  <Button
                    variant={pkg.is_popular ? 'primary' : 'outline'}
                    className="w-full font-bold"
                  >
                    Select {pkg.name}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="py-20 bg-gradient-to-r from-brand-950 via-dark-900 to-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Ready to reach the right communities?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Launch Your First Campaign on ADISION Today.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Get started in under 3 minutes. Clean escrow payments with PaymentPoint, real-time analytics, and guaranteed verified WhatsApp placements.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/advertiser/campaigns/new" onClick={() => setCurrentRole('ADVERTISER')}>
              <Button size="lg" variant="primary" className="w-full sm:w-auto font-bold text-base">
                Create Campaign Now
              </Button>
            </Link>
            <Link href="/partner/communities" onClick={() => setCurrentRole('COMMUNITY_PARTNER')}>
              <Button size="lg" variant="dark" className="w-full sm:w-auto font-bold text-base">
                Register as Community Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

