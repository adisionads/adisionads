'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CAMPAIGN_PACKAGES } from '@/lib/constants';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  Calculator,
  ArrowRight,
  Target,
  Users,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function PricingPage() {
  // Calculator state
  const [selectedPlanId, setSelectedPlanId] = useState<'pkg_starter' | 'pkg_corporate' | 'pkg_gold_salesman'>('pkg_corporate');
  const [corporateSignups, setCorporateSignups] = useState(50);
  const [goldCustomers, setGoldCustomers] = useState(20);

  // Active plan calculation
  const calculateTotalFunding = () => {
    if (selectedPlanId === 'pkg_starter') return 5750;
    if (selectedPlanId === 'pkg_corporate') return corporateSignups * 350;
    if (selectedPlanId === 'pkg_gold_salesman') return goldCustomers * 500;
    return 5750;
  };

  const totalCalculated = calculateTotalFunding();

  return (
    <div className="py-16 sm:py-24 bg-dark-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Outcome-Based Advertising Model</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Adision Advertising Pricing Model
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            WhatsApp-first customer acquisition and advertising for Nigerian businesses.
          </p>
        </div>

        {/* The Problem vs The Adision Approach */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 sm:p-8 border-rose-500/30 bg-rose-950/10 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-rose-400">
              The Problem
            </span>
            <h3 className="text-lg font-bold text-white">
              Wasted Ad Spend With No Attribution
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Businesses can spend <strong>₦100k–₦300k</strong> on adverts and still struggle to know what actually produced customers.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 border-brand-500/30 bg-brand-950/10 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-brand-400">
              The Adision Approach
            </span>
            <h3 className="text-lg font-bold text-white">
              Pay Only For Real Customer Outcomes
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Choose whether you want <strong>reach</strong>, <strong>qualified signups</strong>, or <strong>paying customers</strong> — then fund the campaign upfront and track delivery.
            </p>
          </Card>
        </div>

        {/* The Three Outcomes Cards */}
        <div>
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              The Three Outcomes
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Pick the outcome that fits your growth stage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1. Starter */}
            <Card className="p-6 sm:p-8 border-slate-800 bg-slate-900/60 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold mb-4">
                  I want reach.
                </div>
                <h3 className="text-2xl font-black text-white">Starter</h3>
                <p className="text-xs text-brand-400 font-semibold mt-1">Reach & visibility</p>

                <div className="my-6">
                  <div className="text-4xl font-extrabold text-white">
                    ₦5,750
                  </div>
                  <span className="text-xs text-slate-400 block mt-1">
                    Fixed campaign fee • 14 days + 1 bonus day
                  </span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300 mb-8 border-t border-slate-800 pt-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <span>14-day advertising campaign</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <span>Distribution across relevant WhatsApp groups/channels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <span><strong>1 bonus advertising day</strong> (15 days total)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <span>Campaign tracking and basic performance reporting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <span>Best for businesses testing Adision and building awareness</span>
                  </li>
                </ul>
              </div>

              <Link href="/waitlist" className="w-full">
                <Button variant="outline" className="w-full font-bold text-sm">
                  Start With Reach (₦5,750)
                </Button>
              </Link>
            </Card>

            {/* 2. Corporate */}
            <Card className="p-6 sm:p-8 border-brand-500 bg-gradient-to-b from-brand-500/10 via-slate-900 to-slate-900 flex flex-col justify-between relative shadow-2xl shadow-brand-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-dark-900 text-[11px] font-black uppercase px-3 py-0.5 rounded-full shadow-md">
                Acquire New Users
              </div>

              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold mb-4">
                  I want new users.
                </div>
                <h3 className="text-2xl font-black text-white">Corporate</h3>
                <p className="text-xs text-brand-400 font-semibold mt-1">Acquire new users</p>

                <div className="my-6">
                  <div className="text-4xl font-extrabold text-white">
                    ₦350
                  </div>
                  <span className="text-xs text-slate-300 font-semibold block mt-1">
                    per qualified signup
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-6 text-xs text-slate-300">
                  <span className="text-slate-400 block mb-0.5">Example Funding:</span>
                  <span className="font-bold text-white">50 signups × ₦350 = </span>
                  <span className="text-brand-400 font-extrabold">₦17,500</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300 mb-8 border-t border-slate-800 pt-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <span>Advertiser chooses the number of qualified signups required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <span>Campaign is funded upfront into campaign balance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <span>Only verified new users attributed to the campaign count</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <span><strong>Zero waste:</strong> Unused campaign balance remains available after delivery</span>
                  </li>
                </ul>
              </div>

              <Link href="/waitlist" className="w-full">
                <Button variant="primary" className="w-full font-bold text-sm">
                  Acquire Users (₦350/Signup)
                </Button>
              </Link>
            </Card>

            {/* 3. Gold Salesman */}
            <Card className="p-6 sm:p-8 border-amber-500/50 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 flex flex-col justify-between hover:border-amber-400 transition-all">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-4">
                  I want paying customers.
                </div>
                <h3 className="text-2xl font-black text-white">Gold Salesman</h3>
                <p className="text-xs text-amber-400 font-semibold mt-1">Acquire paying customers</p>

                <div className="my-6">
                  <div className="text-4xl font-extrabold text-white">
                    ₦500
                  </div>
                  <span className="text-xs text-slate-300 font-semibold block mt-1">
                    per qualified paying customer
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-6 text-xs text-slate-300">
                  <span className="text-slate-400 block mb-0.5">Example Funding:</span>
                  <span className="font-bold text-white">20 customers × ₦500 = </span>
                  <span className="text-amber-400 font-extrabold">₦10,000</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300 mb-8 border-t border-slate-800 pt-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Advertiser chooses target number of paying customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Campaign is funded upfront into campaign balance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Counts only after campaign-attributed signup + qualifying purchase/deposit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Guaranteed safety:</strong> Unused balance is not consumed when target is not reached</span>
                  </li>
                </ul>
              </div>

              <Link href="/waitlist" className="w-full">
                <Button variant="outline" className="w-full font-bold text-sm border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
                  Acquire Customers (₦500/Customer)
                </Button>
              </Link>
            </Card>
          </div>
        </div>

        {/* Interactive Prepaid Calculator */}
        <Card className="p-8 sm:p-12 border-brand-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold">
                <Calculator className="w-4 h-4" />
                <span>Prepaid Campaign Budget Calculator</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Calculate Your Upfront Campaign Deposit
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Choose your goal and set your target. Funds are deposited into your campaign balance upfront, and only verified results consume your balance.
              </p>

              {/* Plan Switcher */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedPlanId('pkg_starter')}
                  className={`py-2 px-3 rounded-xl transition-all ${
                    selectedPlanId === 'pkg_starter'
                      ? 'bg-brand-500 text-dark-900 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Starter (Reach)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlanId('pkg_corporate')}
                  className={`py-2 px-3 rounded-xl transition-all ${
                    selectedPlanId === 'pkg_corporate'
                      ? 'bg-brand-500 text-dark-900 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Corporate (Signups)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlanId('pkg_gold_salesman')}
                  className={`py-2 px-3 rounded-xl transition-all ${
                    selectedPlanId === 'pkg_gold_salesman'
                      ? 'bg-brand-500 text-dark-900 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Gold (Customers)
                </button>
              </div>

              {/* Sliders depending on selection */}
              {selectedPlanId === 'pkg_starter' && (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="font-bold text-white text-sm">Fixed Campaign Reach</div>
                  <p>Fixed fee of ₦5,750 gives you 14 days + 1 bonus day (15 days total) distributed across relevant WhatsApp groups and channels.</p>
                </div>
              )}

              {selectedPlanId === 'pkg_corporate' && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300 uppercase">Target Qualified Signups:</span>
                    <span className="text-2xl font-black text-brand-400">{corporateSignups} Signups</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={500}
                    step={10}
                    value={corporateSignups}
                    onChange={(e) => setCorporateSignups(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>20 signups (₦7,000)</span>
                    <span>50 signups (₦17,500)</span>
                    <span>500 signups (₦175,000)</span>
                  </div>
                </div>
              )}

              {selectedPlanId === 'pkg_gold_salesman' && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300 uppercase">Target Paying Customers:</span>
                    <span className="text-2xl font-black text-amber-400">{goldCustomers} Customers</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={200}
                    step={5}
                    value={goldCustomers}
                    onChange={(e) => setGoldCustomers(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>10 customers (₦5,000)</span>
                    <span>20 customers (₦10,000)</span>
                    <span>200 customers (₦100,000)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Live Calculation Output Card */}
            <div className="lg:col-span-5 bg-dark-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Deposit Summary
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Selected Outcome</span>
                  <span className="text-sm font-bold text-white">
                    {selectedPlanId === 'pkg_starter'
                      ? 'Reach (15 Days)'
                      : selectedPlanId === 'pkg_corporate'
                      ? `${corporateSignups} Verified Signups`
                      : `${goldCustomers} Paying Customers`}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Rate / Unit</span>
                  <span className="text-sm font-bold text-slate-300">
                    {selectedPlanId === 'pkg_starter'
                      ? 'Fixed ₦5,750'
                      : selectedPlanId === 'pkg_corporate'
                      ? '₦350 / signup'
                      : '₦500 / customer'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Required Campaign Deposit</span>
                  <span className="text-2xl font-black text-brand-400">
                    {formatCurrency(totalCalculated)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl text-[11px] text-slate-400 leading-relaxed border border-slate-700/40">
                💡 <strong>Prepaid Guarantee:</strong> Any unused balance is never lost. If your campaign does not reach the target, remaining funds remain in your balance.
              </div>

              <Link href="/waitlist" className="block pt-1">
                <Button size="md" variant="primary" className="w-full font-bold">
                  <span>Get Started With This Plan</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* How the Prepaid Model Works */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              How The Prepaid Model Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Advertisers fund the maximum campaign value before Adision begins delivery. This protects both sides and makes campaign consumption transparent.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border border-slate-800 rounded-2xl overflow-hidden min-w-[640px]">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-16">#</th>
                  <th className="px-6 py-4 w-48">Step</th>
                  <th className="px-6 py-4">What Happens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                <tr>
                  <td className="px-6 py-4 font-mono font-bold text-brand-400">1</td>
                  <td className="px-6 py-4 font-bold text-white">Choose a plan</td>
                  <td className="px-6 py-4 text-xs text-slate-300">
                    Select <strong>Starter</strong>, <strong>Corporate</strong>, or <strong>Gold Salesman</strong> based on the outcome you want.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono font-bold text-brand-400">2</td>
                  <td className="px-6 py-4 font-bold text-white">Set a target</td>
                  <td className="px-6 py-4 text-xs text-slate-300">
                    For Corporate or Gold Salesman, choose the number of qualified users or customers required.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono font-bold text-brand-400">3</td>
                  <td className="px-6 py-4 font-bold text-white">Fund the campaign</td>
                  <td className="px-6 py-4 text-xs text-slate-300">
                    Deposit the full campaign value into the Adision campaign balance (via PocketFi transfer or card).
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono font-bold text-brand-400">4</td>
                  <td className="px-6 py-4 font-bold text-white">Adision distributes</td>
                  <td className="px-6 py-4 text-xs text-slate-300">
                    Your campaign is delivered through the Adision WhatsApp-first publisher network across verified groups.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono font-bold text-brand-400">5</td>
                  <td className="px-6 py-4 font-bold text-white">Track results</td>
                  <td className="px-6 py-4 text-xs text-slate-300">
                    Attribution records campaign activity, user signups, and qualifying actions in real time.
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono font-bold text-brand-400">6</td>
                  <td className="px-6 py-4 font-bold text-white">Balance is consumed</td>
                  <td className="px-6 py-4 text-xs text-slate-300">
                    Only qualifying delivered results consume the applicable per-result amount. Unused funds remain in your balance.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Real Example Scenario & What Counts As A Qualified Customer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Example Table */}
          <Card className="p-6 sm:p-8 border-slate-800 bg-slate-900/60 space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-brand-400">
              Live Example Scenario
            </span>
            <h3 className="text-lg font-bold text-white">
              Example: Gold Salesman In Action
            </h3>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-300">Target (20 paying customers @ ₦500 each):</span>
                <span className="font-bold text-white">₦10,000 max deposit</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-300">Delivered Results (13 customers achieved):</span>
                <span className="font-bold text-emerald-400">₦6,500 consumed</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-brand-500/10 border border-brand-500/30">
                <span className="text-brand-300 font-bold">Remaining Balance Preserved:</span>
                <span className="font-black text-brand-400">₦3,500 remains available</span>
              </div>
            </div>
          </Card>

          {/* Qualified Customer Rules */}
          <Card className="p-6 sm:p-8 border-slate-800 bg-slate-900/60 space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Clear Rules
            </span>
            <h3 className="text-lg font-bold text-white">
              What Counts as a Qualified Customer?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              For Gold Salesman, a user must be attributable to the advertiser&apos;s Adision campaign, create a new account with the advertiser, and complete the advertiser&apos;s defined qualifying purchase or deposit. This prevents simple clicks or inactive registrations from being counted as paying customers.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400">
              <strong>Important:</strong> Adision provides acquisition and attribution. The advertiser remains responsible for its offer, onboarding, customer support, retention, and reactivation after acquisition.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
