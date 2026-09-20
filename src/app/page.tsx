'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CAMPAIGN_PACKAGES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { WhatsAppMockup } from '@/components/previews/WhatsAppMockup';

const FAQ_ITEMS = [
  {
    q: 'How does Adision ensure my ad is actually posted?',
    a: 'Every WhatsApp group or channel admin is required to upload timestamped screenshot proof showing your ad live inside their group. In addition, Adision generates a unique tracking link with your ad so you can monitor real human clicks in real time on your dashboard.',
  },
  {
    q: 'What happens if a group admin deletes the ad or fails to post?',
    a: 'Your payment is held safely by Adision. Community admins only receive payment after proof of post is submitted and verified. If an admin fails to post or deletes the ad prematurely, they do not get paid, and your money stays safe in your account.',
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
    q: 'How quickly can my ad campaign start?',
    a: 'Immediately. Once you choose a campaign package and fund your balance, your broadcast task is instantly dispatched to matching verified community admins who post your ad with timestamped screenshot proof.',
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
    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-900 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Persona Segmented Switcher */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/70 dark:border-slate-700/60">
              <button
                onClick={() => setActivePersona('advertiser')}
                className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activePersona === 'advertiser'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                For Advertisers
              </button>
              <button
                onClick={() => setActivePersona('partner')}
                className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activePersona === 'partner'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                For Community Admins
              </button>
            </div>
          </div>

          {/* Dual Column Layout with Real Product Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {activePersona === 'advertiser' ? (
                <>
                  <div className="inline-block text-xs font-semibold tracking-wider uppercase text-brand-700 dark:text-brand-400">
                    Targeted Community Ads
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                    Direct WhatsApp distribution. Verified with real click attribution.
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                    Stop direct-messaging random group admins or worrying about payment fraud. Broadcast sponsored updates across verified WhatsApp groups and channels, with timestamped screenshot proof and genuine link clicks.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                    <Link href="/signup?role=advertiser" className="w-full sm:w-auto">
                      <Button size="lg" variant="primary" className="w-full font-semibold text-sm px-6">
                        Start Advertising
                      </Button>
                    </Link>
                    <Link href="/pricing" className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="w-full text-sm font-medium px-6">
                        View Pricing & Packages
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-block text-xs font-semibold tracking-wider uppercase text-brand-700 dark:text-brand-400">
                    Community Monetization
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                    Turn your WhatsApp audience into predictable income.
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                    Receive verified sponsored broadcast tasks in your dashboard, post them into your WhatsApp community, upload a screenshot proof, and withdraw your earnings directly to your Nigerian bank.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                    <Link href="/signup?role=community" className="w-full sm:w-auto">
                      <Button size="lg" variant="primary" className="w-full font-semibold text-sm px-6">
                        Register Your Community
                      </Button>
                    </Link>
                    <a href="#how-it-works" className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="w-full text-sm font-medium px-6">
                        How Payouts Work
                      </Button>
                    </a>
                  </div>
                </>
              )}

              {/* Restrained Trust Points */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">100% Escrow</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Funds held until proof verified</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Real Attribution</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Live click & visit metrics</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Direct Payouts</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">1-click to any Nigerian bank</div>
                </div>
              </div>
            </div>

            {/* Right Visual: Actual Product WhatsApp Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm">
                <WhatsAppMockup
                  communityName={activePersona === 'advertiser' ? 'Lagos Tech & Founders Hub' : 'UNILAG Campus Updates'}
                  category={activePersona === 'advertiser' ? 'TECHNOLOGY_STARTUPS' : 'STUDENTS_CAMPUS'}
                  adCopy={
                    activePersona === 'advertiser'
                      ? 'Looking for vetted engineering talent or early user traction?\n\nCheck out the new developer hub and hire in 48 hours:'
                      : 'Flash Update: Student developer fellowship registrations are now open for all departments.\n\nReserve your slot here:'
                  }
                  destinationUrl="https://adision.co/r/live_preview"
                  ctaText="Explore Details"
                  trackingCode="live_track_204"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (EDITORIAL STEPPER) */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400 mb-2">
              Workflow
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activePersona === 'advertiser'
                ? 'How advertising on Adision works'
                : 'How community admins earn on Adision'}
            </h3>
          </div>

          {activePersona === 'advertiser' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-6 space-y-3">
                <div className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">01</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Create & Target</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Draft your message, add creative media, and choose your target niche (Students, Tech, Business, Fashion, or Crypto).
                </p>
              </div>

              <div className="border-t-2 border-brand-500 pt-6 space-y-3">
                <div className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">02</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Escrow-Backed Funding</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Fund via direct bank transfer. Your money is secured in escrow and only released to community admins once verified.
                </p>
              </div>

              <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-6 space-y-3">
                <div className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">03</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Proof & Attribution</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Inspect timestamped screenshot proof showing your ad inside groups and track genuine link visits on your live dashboard.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-6 space-y-3">
                <div className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">01</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Submit Community</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Submit your WhatsApp Group or Channel with basic member info. Our team verifies genuine engagement.
                </p>
              </div>

              <div className="border-t-2 border-brand-500 pt-6 space-y-3">
                <div className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">02</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Accept & Broadcast</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Review matching ad tasks in your dashboard. Accept tasks and broadcast the copy with your assigned tracking link.
                </p>
              </div>

              <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-6 space-y-3">
                <div className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">03</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Upload Proof & Withdraw</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Upload a screenshot proof of the post. Once verified, funds land in your wallet for immediate withdrawal to any bank.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. FEATURED PRICING TIERS */}
      <section className="py-16 sm:py-20 bg-slate-50/50 dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400 mb-2">
              Pricing & Packages
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Transparent packages. Clear deliverables.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CAMPAIGN_PACKAGES.slice(0, 3).map((pkg) => (
              <Card
                key={pkg.id}
                className={`p-8 relative flex flex-col justify-between ${
                  pkg.is_popular
                    ? 'border-brand-500 bg-white dark:bg-slate-900 shadow-lg'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                }`}
              >
                {pkg.is_popular && (
                  <div className="absolute -top-3 left-6 bg-brand-500 text-dark-900 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Recommended
                  </div>
                )}

                <div>
                  <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">
                    {pkg.outcome_title || 'Outcome-Based'}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">{pkg.name}</h4>
                  <div className="mt-3 mb-6">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                      {pkg.billing_model === 'PER_SIGNUP'
                        ? '₦350'
                        : pkg.billing_model === 'PER_CUSTOMER'
                        ? '₦750'
                        : formatCurrency(pkg.price)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                      {pkg.billing_model === 'PER_SIGNUP'
                        ? 'per qualified signup (from ₦17,500 deposit)'
                        : pkg.billing_model === 'PER_CUSTOMER'
                        ? 'per paying customer (from ₦15,000 deposit)'
                        : 'Fixed fee • 14 days + 1 bonus day'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 mb-6 text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between">
                    <span>Outcome Goal:</span>
                    <span className="text-brand-600 dark:text-brand-400 font-bold">{pkg.outcome_description}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 mb-8">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/pricing" className="w-full">
                  <Button
                    variant={pkg.is_popular ? 'primary' : 'outline'}
                    className="w-full font-semibold text-xs"
                  >
                    Select {pkg.name}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 sm:py-20 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400 mb-2">
              Questions & Answers
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand-500' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/50 dark:border-slate-800/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-dark-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ready to advertise or monetize your community?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Join vetted businesses and WhatsApp community admins across Nigeria on Adision.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link href="/signup?role=advertiser">
              <Button size="lg" variant="primary" className="w-full sm:w-auto font-semibold text-sm px-6">
                Start Advertising
              </Button>
            </Link>
            <Link href="/signup?role=community">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold text-sm px-6">
                Register WhatsApp Group
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
