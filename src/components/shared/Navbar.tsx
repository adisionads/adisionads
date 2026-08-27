'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { formatCurrency } from '@/lib/utils';
import {
  Briefcase,
  ChevronDown,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Shield,
  Sparkles,
  Users,
  Wallet as WalletIcon,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const pathname = usePathname();
  const { currentRole, setCurrentRole, currentUser, wallet } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getPortalLink = () => {
    if (currentRole === 'ADVERTISER') return '/advertiser';
    if (currentRole === 'COMMUNITY_PARTNER') return '/partner';
    return '/admin';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-dark-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-auto rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform bg-brand-500 flex items-center px-1">
              <img
                src="/brand/logo-horizontal.jpg"
                alt="ADISION by REKTINA"
                className="h-9 w-auto object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block -mb-1">
                by REKTINA
              </span>
              <span className="text-xs font-semibold text-brand-400">Community Ad Market</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-brand-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Marketplace
            </Link>
            <Link
              href="/pricing"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                pathname === '/pricing' ? 'text-brand-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Packages & Pricing
            </Link>
            <Link
              href={getPortalLink()}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname.startsWith('/advertiser') || pathname.startsWith('/partner') || pathname.startsWith('/admin')
                  ? 'text-brand-400 bg-brand-500/10 border border-brand-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </nav>
        </div>

        {/* Right Section: Role Switcher & User Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Interactive Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors shadow-inner"
            >
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-slate-400">View as:</span>
              <span className="text-brand-400 uppercase">
                {currentRole === 'ADVERTISER' ? 'Advertiser' : currentRole === 'COMMUNITY_PARTNER' ? 'Partner (Admin)' : 'ADISION Admin'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Switch Active Role
                </div>
                <button
                  onClick={() => {
                    setCurrentRole('ADVERTISER');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                    currentRole === 'ADVERTISER' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-brand-400" />
                  <div>
                    <div className="font-semibold">Advertiser Hub</div>
                    <div className="text-[10px] text-slate-400">Create ads, buy reach</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCurrentRole('COMMUNITY_PARTNER');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors mt-1 ${
                    currentRole === 'COMMUNITY_PARTNER' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold">Community Partner</div>
                    <div className="text-[10px] text-slate-400">Publish ads, earn wallet cash</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCurrentRole('ADMIN');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors mt-1 ${
                    currentRole === 'ADMIN' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-semibold">ADISION Operations</div>
                    <div className="text-[10px] text-slate-400">Matchmaking, verify proofs</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Quick Wallet Pill for Partner */}
          {currentRole === 'COMMUNITY_PARTNER' && (
            <Link
              href="/partner/wallet"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <WalletIcon className="w-3.5 h-3.5" />
              <span>{formatCurrency(wallet.available_balance)}</span>
            </Link>
          )}

          {/* Direct Action Button */}
          {currentRole === 'ADVERTISER' ? (
            <Link href="/advertiser/campaigns/new">
              <Button size="sm" variant="primary" className="gap-1.5">
                <PlusCircle className="w-4 h-4" />
                <span>Launch Campaign</span>
              </Button>
            </Link>
          ) : currentRole === 'COMMUNITY_PARTNER' ? (
            <Link href="/partner/communities">
              <Button size="sm" variant="primary" className="gap-1.5">
                <PlusCircle className="w-4 h-4" />
                <span>Add Community</span>
              </Button>
            </Link>
          ) : (
            <Link href="/admin">
              <Button size="sm" variant="primary" className="gap-1.5">
                <Shield className="w-4 h-4" />
                <span>Control Center</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-brand-400 border border-slate-700"
          >
            {currentRole === 'ADVERTISER' ? 'Adv' : currentRole === 'COMMUNITY_PARTNER' ? 'Partner' : 'Admin'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900/95 px-4 py-5 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Marketplace
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Packages & Pricing
            </Link>
            <Link
              href={getPortalLink()}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-brand-400 bg-brand-500/10"
            >
              Open Dashboard
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">Switch View:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setCurrentRole('ADVERTISER');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-xs font-semibold ${
                  currentRole === 'ADVERTISER' ? 'bg-brand-500 text-dark-900 font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Advertiser
              </button>
              <button
                onClick={() => {
                  setCurrentRole('COMMUNITY_PARTNER');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-xs font-semibold ${
                  currentRole === 'COMMUNITY_PARTNER' ? 'bg-brand-500 text-dark-900 font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Partner
              </button>
              <button
                onClick={() => {
                  setCurrentRole('ADMIN');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-xs font-semibold ${
                  currentRole === 'ADMIN' ? 'bg-brand-500 text-dark-900 font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
