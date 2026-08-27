'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import { CAMPAIGN_PACKAGES } from '@/lib/constants';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckCircle2, ShieldCheck, Zap, Calculator, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const { setCurrentRole } = useApp();
  const [sliderBudget, setSliderBudget] = useState(20000);

  // Dynamic Reach Calculation Logic
  const estimatedCommunities = Math.max(2, Math.round(sliderBudget / 2500));
  const estimatedReachMin = estimatedCommunities * 1500;
  const estimatedReachMax = estimatedCommunities * 3500;
  const estimatedClicks = Math.round(estimatedReachMin * 0.035);

  return (
    <div className="py-16 sm:py-24 bg-dark-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Guaranteed Distribution Packages</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Transparent Pricing for High-Impact Community Reach
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Choose a pre-configured package or calculate your custom reach. All packages include unique link tracking and placement proof verification.
          </p>
        </div>

        {/* 1. Pre-configured Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {CAMPAIGN_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`p-6 sm:p-8 flex flex-col justify-between relative transition-all hover:scale-[1.02] ${
                pkg.is_popular
                  ? 'border-brand-500 bg-gradient-to-b from-brand-500/10 via-slate-900 to-slate-900 shadow-2xl shadow-brand-500/10'
                  : 'border-slate-800'
              }`}
            >
              {pkg.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-dark-900 text-[11px] font-black uppercase px-3 py-0.5 rounded-full shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                <div className="my-5">
                  <div className="text-3xl sm:text-4xl font-extrabold text-white">
                    {formatCurrency(pkg.price)}
                  </div>
                  <span className="text-xs text-slate-400 block mt-1">
                    {pkg.duration_days} Days Active Distribution
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-6 text-xs text-slate-300">
                  <div className="flex justify-between mb-1 font-medium">
                    <span className="text-slate-400">Target Reach:</span>
                    <span className="text-brand-400 font-bold">{pkg.estimated_reach}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-400">Communities:</span>
                    <span className="text-white font-bold">{pkg.community_count} Verified Groups</span>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  {pkg.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
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
                  className="w-full font-bold text-sm"
                >
                  Choose {pkg.name}
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* 2. Interactive Campaign Budget & Reach Calculator */}
        <Card className="p-8 sm:p-12 border-brand-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold">
                <Calculator className="w-4 h-4" />
                <span>Interactive ROI Calculator</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Estimate Your Campaign Performance
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Adjust your marketing budget to see estimated community placements, audience reach, and click-through projections.
              </p>

              {/* Slider Control */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 uppercase">Your Budget (NGN):</span>
                  <span className="text-2xl font-black text-brand-400">
                    {formatCurrency(sliderBudget)}
                  </span>
                </div>
                <input
                  type="range"
                  min={7000}
                  max={200000}
                  step={5000}
                  value={sliderBudget}
                  onChange={(e) => setSliderBudget(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                  <span>₦7,000 (Starter)</span>
                  <span>₦50,000</span>
                  <span>₦200,000 (Enterprise)</span>
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="lg:col-span-5 bg-dark-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Estimated Delivery Projections
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Verified Communities</span>
                  <span className="text-lg font-bold text-white">~{estimatedCommunities} Groups</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Total Member Reach</span>
                  <span className="text-lg font-bold text-brand-400">
                    {formatNumber(estimatedReachMin)} – {formatNumber(estimatedReachMax)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Projected Clicks (CTR 3-5%)</span>
                  <span className="text-lg font-bold text-emerald-400">~{formatNumber(estimatedClicks)}+ clicks</span>
                </div>
              </div>

              <Link
                href="/advertiser/campaigns/new"
                onClick={() => setCurrentRole('ADVERTISER')}
                className="block pt-2"
              >
                <Button size="md" variant="primary" className="w-full font-bold">
                  <span>Launch With This Budget</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

