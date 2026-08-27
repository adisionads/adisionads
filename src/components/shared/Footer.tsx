import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, MessageCircle, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-dark-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand & Authenticity Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-auto rounded-xl overflow-hidden shadow-md bg-brand-500 flex items-center px-1">
                <img
                  src="/brand/logo-horizontal.jpg"
                  alt="ADISION by REKTINA"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              ADISION by REKTINA is the premier performance-driven marketplace connecting businesses with verified WhatsApp Groups, Channels, and digital communities.
            </p>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold max-w-sm">
              <ShieldCheck className="w-4 h-4 shrink-0 text-brand-400" />
              <span>Mark of Authenticity: Official REKTINA Ecosystem Product</span>
            </div>
          </div>

          {/* Advertisers */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Advertisers</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/pricing" className="hover:text-brand-400 transition-colors">
                  Campaign Packages
                </Link>
              </li>
              <li>
                <Link href="/advertiser/campaigns/new" className="hover:text-brand-400 transition-colors">
                  Create Ad Campaign
                </Link>
              </li>
              <li>
                <Link href="/advertiser" className="hover:text-brand-400 transition-colors">
                  Live Click Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Partners */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Community Partners</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/partner/communities" className="hover:text-brand-400 transition-colors">
                  Register WhatsApp Group
                </Link>
              </li>
              <li>
                <Link href="/partner/assignments" className="hover:text-brand-400 transition-colors">
                  Ad Placement Tasks
                </Link>
              </li>
              <li>
                <Link href="/partner/wallet" className="hover:text-brand-400 transition-colors">
                  Wallet & Bank Payouts
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Categories */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Top Categories</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="text-slate-300">Students & Campus</span>
              </li>
              <li>
                <span className="text-slate-300">Business & VTU Traders</span>
              </li>
              <li>
                <span className="text-slate-300">Technology & Startups</span>
              </li>
              <li>
                <span className="text-slate-300">Crypto & Web3</span>
              </li>
              <li>
                <span className="text-slate-300">Fashion & Thrift Vendors</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ADISION by REKTINA. All rights reserved. Reach the right communities.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>WhatsApp Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
