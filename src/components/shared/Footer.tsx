import React from 'react';
import Link from 'next/link';

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
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Escrow-backed distribution network with verified screenshot proof and real-time click attribution.
            </p>

            {/* Owned by Rektina Badge */}
            <div className="pt-2 flex items-center gap-2.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Designed & Owned by</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black border border-slate-800 shadow-sm">
                <img
                  src="/brand/rektina-logo.jpg"
                  alt="Rektina"
                  className="h-4 w-auto object-contain"
                />
              </div>
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
                <Link href="/signup?role=advertiser" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
                  Start Advertising
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
                <Link href="/signup?role=community" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Partner Registration
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
          <p>© {new Date().getFullYear()} Adision. Designed & owned by <strong className="text-slate-700 dark:text-slate-300">Rektina</strong>. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/signup" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Create Free Account
            </Link>
            <span>•</span>
            <span>Safe Payments Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
