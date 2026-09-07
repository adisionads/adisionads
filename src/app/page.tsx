'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  DollarSign,
  GraduationCap,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COMMUNITY_CATEGORIES_LIST, CAMPAIGN_PACKAGES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

const FAQ_ITEMS = [
  {
    q: 'How does Adision ensure my ad is actually posted?',
    a: 'Every WhatsApp group or channel admin is required to upload timestamped screenshot proof showing your ad live inside their group. In addition, Adision generates a unique tracking link with your ad so you can monitor real human clicks in real time on your dashboard.',
  },
  {
    q: 'What happens if a group admin deletes the ad or fails to post?',
    a: 'Your campaign payment is held safely in escrow. Community admins only receive payment after proof of post is submitted and verified. If an admin fails to post or deletes the ad prematurely, they do not get paid, and your campaign budget is refunded or reassigned.',
  },
  {
    q: 'How and when do WhatsApp community admins get paid?',
    a: 'After you broadcast the assigned ad and upload your screenshot proof, your earnings are credited directly to your Adision wallet. You can withdraw to any Nigerian bank account (OPay, PalmPay, Moniepoint, Kuda, GTB, Access, Zenith, etc.) at any time.',
  },
  {
    q: 'Do I give up control or admin rights of my WhatsApp group?',
    a: 'Never. You maintain 100% ownership and control of your community. Adision never asks for group ownership. You simply receive sponsored broadcast tasks in your Adision dashboard that you choose to accept and post.',
  },
  {
    q: 'What is the Early Access Waitlist?',
    a: 'We are onboarding vetted communities and advertisers in curated batches to ensure high audience quality. Joining the waitlist reserves your priority spot and notifies you as soon as campaigns launch in your niche.',
  },
  {
    q: 'Can I advertise with a small budget?',
    a: 'Yes! Our Starter package starts from ₦7,000, allowing small businesses, creators, and vendors to reach thousands of targeted community members without expensive agency retainers.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

export default function HomePage() {
  const [activePersona, setActivePersona] = useState<'advertiser' | 'partner'>('advertiser');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { setCurrentRole } = useApp();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-dark-900 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* 1. HERO SECTION WITH DUAL PERSONA SWITCHER */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-slate-100/80 via-white to-slate-50 dark:from-dark-900 dark:via-dark-900 dark:to-[#070b12]">
        {/* Background glow flares */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Persona Switcher Pill */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-lg">
              <button
                onClick={() => setActivePersona('advertiser')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  activePersona === 'advertiser'
                    ? 'bg-brand-500 text-dark-900 shadow-md shadow-brand-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Advertise with ADISION</span>
              </button>

              <button
                onClick={() => setActivePersona('partner')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  activePersona === 'partner'
                    ? 'bg-brand-500 text-dark-900 shadow-md shadow-brand-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Earn with Your Community</span>
              </button>
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 text-brand-700 dark:text-brand-400 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Adision — Performance Community Ad Marketplace</span>
            </div>

            {activePersona === 'advertiser' ? (
              <>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                  Reach Real Customers in <span className="text-brand-600 dark:text-brand-400">Verified WhatsApp Communities</span>.
                </h1>
                <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
                  Stop direct-messaging random group admins or worrying about scams. Run targeted ads across verified WhatsApp groups and channels, and track real visits with genuine link clicks.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Link
                    href="/waitlist"
                    className="w-full sm:w-auto"
                  >
                    <Button size="lg" variant="primary" className="w-full font-bold text-base shadow-lg shadow-brand-500/20 gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Join Early Access Waitlist</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link
                    href="/pricing"
                    className="w-full sm:w-auto"
                  >
                    <Button size="lg" variant="outline" className="w-full text-base font-semibold">
                      <span>Explore Pricing & Packages</span>
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                  Monetize Your WhatsApp Audience with <span className="text-brand-600 dark:text-brand-400">Direct Bank Payouts</span>.
                </h1>
                <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
                  Turn your active WhatsApp audience into regular income. Receive paid ad jobs, post them in your community, upload a screenshot proof, and withdraw your cash straight to your Nigerian bank.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Link
                    href="/waitlist"
                    className="w-full sm:w-auto"
                  >
                    <Button size="lg" variant="primary" className="w-full font-bold text-base shadow-lg shadow-brand-500/20 gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Join Partner Waitlist</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <a
                    href="#how-it-works"
                    className="w-full sm:w-auto"
                  >
                    <Button size="lg" variant="outline" className="w-full text-base font-semibold">
                      <span>How Community Payouts Work</span>
                    </Button>
                  </a>
                </div>
              </>
            )}

            {/* Genuine Value Proposition Pillars */}
            <div className="pt-10 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Verified Admins</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Every group is checked by hand for real members and active chats</div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Safe Escrow Payments</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Admins only get paid after they prove your ad was posted</div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Real Click Tracking</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">See actual visits from real people — no bots, no duplicate clicks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
              Simple & Transparent
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activePersona === 'advertiser'
                ? 'How Advertising Works in 3 Easy Steps'
                : 'How Community Owners Earn in 3 Easy Steps'}
            </h3>
          </div>

          {activePersona === 'advertiser' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-8 relative group hover:border-brand-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 font-extrabold text-xl flex items-center justify-center mb-6">
                  1
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Create Your Ad</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Write your message, add an optional image, and choose your target audience (such as Students, Tech, Business, or Fashion).
                </p>
              </Card>

              <Card className="p-8 relative group hover:border-brand-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 font-extrabold text-xl flex items-center justify-center mb-6">
                  2
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pay via Bank Transfer</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Make a quick transfer to your unique virtual bank account. Adision holds your money safely in escrow until the ad is confirmed live.
                </p>
              </Card>

              <Card className="p-8 relative group hover:border-brand-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 font-extrabold text-xl flex items-center justify-center mb-6">
                  3
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Watch Live Results</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  See real-time clicks as members visit your link, view screenshot proofs showing your ad inside each group, and track results.
                </p>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-8 relative group hover:border-brand-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 font-extrabold text-xl flex items-center justify-center mb-6">
                  1
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Register Your Group</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Submit your WhatsApp Group or Channel with a quick screenshot of your member info. We verify active engagement within hours.
                </p>
              </Card>

              <Card className="p-8 relative group hover:border-brand-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 font-extrabold text-xl flex items-center justify-center mb-6">
                  2
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Receive & Post Ads</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Accept matched ad tasks in your dashboard, post the message with your tracking link into your group, and keep it active.
                </p>
              </Card>

              <Card className="p-8 relative group hover:border-brand-500/50 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 font-extrabold text-xl flex items-center justify-center mb-6">
                  3
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload Proof & Get Paid</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Upload a screenshot showing the post in your group. Once verified, funds land in your wallet for 1-click withdrawal to any Nigerian bank.
                </p>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* 3. POPULAR COMMUNITY CATEGORIES */}
      <section className="py-20 bg-slate-100/60 dark:bg-[#070b12] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
                Audience Niches
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Target High-Converting Communities
              </h3>
            </div>
            <Link href="/pricing">
              <span className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 mt-4 md:mt-0">
                Explore all packages <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMMUNITY_CATEGORIES_LIST.slice(0, 6).map((cat) => (
              <Card
                key={cat.id}
                className="p-6 bg-white dark:bg-slate-900/40 hover:border-brand-500/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {cat.label}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{cat.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRICING TIERS */}
      <section className="py-20 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
              Transparent Pricing
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Simple Packages. Verified Distribution.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CAMPAIGN_PACKAGES.slice(0, 3).map((pkg) => (
              <Card
                key={pkg.id}
                className={`p-8 relative flex flex-col justify-between ${
                  pkg.is_popular
                    ? 'border-brand-500/50 bg-gradient-to-b from-brand-50 via-white to-white dark:from-brand-500/10 dark:via-slate-900/90 dark:to-slate-900 shadow-xl'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {pkg.is_popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-500 text-dark-900 text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Most Popular
                  </div>
                )}

                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">{pkg.name}</h4>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">{formatCurrency(pkg.price)}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">{pkg.duration_days} Days Active Distribution</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 mb-6 text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-between">
                    <span>Target Reach:</span>
                    <span className="text-brand-600 dark:text-brand-400 font-bold">{pkg.estimated_reach}</span>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 mb-8">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/waitlist"
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

      {/* 5. FREQUENTLY ASKED QUESTIONS (ZERO AMBIGUITY) */}
      <section className="py-20 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              Everything you need to know about how advertising, verification, and payouts work on Adision.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand-500' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/50 dark:border-slate-800/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-20 bg-gradient-to-r from-brand-900/20 via-white dark:via-dark-900 to-brand-900/10 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-400 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Ready to reach the right communities?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Reserve Your Early Access Spot Today.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Join the waitlist to be notified first when we open campaigns and community onboarding in your category.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/waitlist">
              <Button size="lg" variant="primary" className="w-full sm:w-auto font-bold text-base gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Join the Early Access Waitlist</span>
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold text-base">
                <span>View Launch Packages</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
