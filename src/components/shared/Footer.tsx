import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-dark-900 text-slate-600 dark:text-slate-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand & Authenticity Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-auto rounded-xl overflow-hidden shadow-md bg-brand-500 flex items-center px-1">
                <img
                  src="/brand/logo-horizontal.jpg"
                  alt="Adision"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-sm">
              Adision is the premier performance-driven marketplace connecting businesses with verified WhatsApp Groups, Channels, and digital communities.
            </p>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-700 dark:text-brand-400 text-xs font-semibold max-w-sm">
              <ShieldCheck className="w-4 h-4 shrink-0 text-brand-600 dark:text-brand-400" />
              <span>Verified Community Advertising Network</span>
            </div>
          </div>

          {/* Advertisers */}
          <div>
            <h4 className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider mb-4">Advertisers</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/pricing" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Campaign Packages
                </Link>
              </li>
              <li>
                <Link href="/advertiser/campaigns/new" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Create Ad Campaign
                </Link>
              </li>
              <li>
                <Link href="/advertiser" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Live Click Tracking
                </Link>
              </li>
              <li>
                <Link href="/waitlist" className="text-brand-600 dark:text-brand-400 font-bold flex items-center gap-1 hover:underline">
                  <Sparkles className="w-3 h-3" />
                  <span>Early Access Waitlist</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Partners */}
          <div>
            <h4 className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider mb-4">Community Partners</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/partner/communities" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Register WhatsApp Group
                </Link>
              </li>
              <li>
                <Link href="/partner/assignments" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Ad Placement Tasks
                </Link>
              </li>
              <li>
                <Link href="/partner/wallet" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Wallet & Bank Payouts
                </Link>
              </li>
              <li>
                <Link href="/waitlist" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Early Partner Onboarding
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Categories */}
          <div>
            <h4 className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider mb-4">Top Categories</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="text-slate-700 dark:text-slate-300">Students & Campus</span>
              </li>
              <li>
                <span className="text-slate-700 dark:text-slate-300">Business & VTU Traders</span>
              </li>
              <li>
                <span className="text-slate-700 dark:text-slate-300">Technology & Startups</span>
              </li>
              <li>
                <span className="text-slate-700 dark:text-slate-300">Crypto & Web3</span>
              </li>
              <li>
                <span className="text-slate-700 dark:text-slate-300">Fashion & Thrift Vendors</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Adision. All rights reserved. Reach the right communities.</p>
          <div className="flex items-center gap-6">
            <Link href="/waitlist" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Join Early Access Waitlist
            </Link>
            <span>•</span>
            <span>Safe Payments Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
