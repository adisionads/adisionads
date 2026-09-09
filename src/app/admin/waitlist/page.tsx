'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  Copy,
  Download,
  Globe,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface WaitlistEntry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  role: 'ADVERTISER' | 'COMMUNITY_PARTNER';
  company_or_community_name?: string;
  estimated_reach_or_budget?: string;
  notes?: string;
  referral_code: string;
  position: number;
  status: string;
  created_at: string;
}

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'BOTH' | 'COMMUNITIES' | 'ADVERTISERS'>('BOTH');
  const [copiedPartnerPhones, setCopiedPartnerPhones] = useState(false);
  const [copiedAdvertiserPhones, setCopiedAdvertiserPhones] = useState(false);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/waitlist');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setEntries(data.data);
      }
    } catch (err) {
      console.error('Failed to load waitlist entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const query = searchQuery.toLowerCase();
  const matchesSearch = (e: WaitlistEntry) =>
    !query ||
    e.full_name?.toLowerCase().includes(query) ||
    e.email?.toLowerCase().includes(query) ||
    e.phone?.toLowerCase().includes(query) ||
    e.country?.toLowerCase().includes(query) ||
    e.company_or_community_name?.toLowerCase().includes(query);

  const partnerEntries = entries.filter((e) => e.role === 'COMMUNITY_PARTNER' && matchesSearch(e));
  const advertiserEntries = entries.filter((e) => e.role === 'ADVERTISER' && matchesSearch(e));

  const exportCSV = (subset: 'ALL' | 'PARTNERS' | 'ADVERTISERS') => {
    let target = entries;
    if (subset === 'PARTNERS') target = entries.filter((e) => e.role === 'COMMUNITY_PARTNER');
    if (subset === 'ADVERTISERS') target = entries.filter((e) => e.role === 'ADVERTISER');
    if (target.length === 0) return;

    const headers = [
      'Position',
      'Role',
      'Full Name',
      'WhatsApp Phone',
      'Email',
      'Country',
      'Community or Business Name',
      'Member Count or Budget',
      'Referral Code',
      'Notes',
      'Date Joined',
    ];

    const rows = target.map((e) => [
      e.position,
      e.role === 'COMMUNITY_PARTNER' ? 'WhatsApp Community Owner' : 'Business Advertiser',
      `"${(e.full_name || '').replace(/"/g, '""')}"`,
      `"${(e.phone || '').replace(/"/g, '""')}"`,
      `"${(e.email || '').replace(/"/g, '""')}"`,
      `"${(e.country || 'Nigeria').replace(/"/g, '""')}"`,
      `"${(e.company_or_community_name || '').replace(/"/g, '""')}"`,
      `"${(e.estimated_reach_or_budget || '').replace(/"/g, '""')}"`,
      e.referral_code,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
      new Date(e.created_at).toLocaleDateString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `adision_waitlist_${subset.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyPhones = (target: WaitlistEntry[], type: 'PARTNER' | 'ADVERTISER') => {
    const numbers = target
      .map((e) => e.phone)
      .filter(Boolean)
      .join(', ');
    if (!numbers) return;
    navigator.clipboard.writeText(numbers);
    if (type === 'PARTNER') {
      setCopiedPartnerPhones(true);
      setTimeout(() => setCopiedPartnerPhones(false), 2500);
    } else {
      setCopiedAdvertiserPhones(true);
      setTimeout(() => setCopiedAdvertiserPhones(false), 2500);
    }
  };

  const totalPartnerCount = entries.filter((e) => e.role === 'COMMUNITY_PARTNER').length;
  const totalAdvertiserCount = entries.filter((e) => e.role === 'ADVERTISER').length;
  const uniqueCountries = new Set(entries.map((e) => e.country || 'Nigeria')).size;

  return (
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-dark-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Operations Hub
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Waitlist Operations Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Separate databases for WhatsApp group owners and business advertisers.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={fetchWaitlist}
              size="sm"
              variant="outline"
              className="gap-1.5 font-semibold text-xs"
              title="Refresh list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              onClick={() => exportCSV('ALL')}
              size="sm"
              variant="primary"
              disabled={entries.length === 0}
              className="gap-1.5 font-bold text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full CSV</span>
            </Button>
          </div>
        </div>

        {/* Quick KPI Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <Card className="p-3 sm:p-4 bg-white dark:bg-slate-900 flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
            <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
              {entries.length}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Total Waitlist
            </span>
          </Card>

          <Card className="p-3 sm:p-4 bg-white dark:bg-slate-900 flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
            <span className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {totalPartnerCount}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 min-w-0 truncate">
              <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">Group Owners</span>
            </span>
          </Card>

          <Card className="p-3 sm:p-4 bg-white dark:bg-slate-900 flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
            <span className="text-lg sm:text-2xl font-black text-blue-600 dark:text-blue-400">
              {totalAdvertiserCount}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 min-w-0 truncate">
              <Briefcase className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">Advertisers</span>
            </span>
          </Card>

          <Card className="p-3 sm:p-4 bg-white dark:bg-slate-900 flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
            <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
              {uniqueCountries}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 min-w-0 truncate">
              <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">Countries</span>
            </span>
          </Card>
        </div>

        {/* View Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, group, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs w-full sm:w-auto">
            <button
              onClick={() => setViewMode('BOTH')}
              className={`px-3 py-1.5 rounded-lg font-bold text-center transition-all ${
                viewMode === 'BOTH'
                  ? 'bg-brand-500 text-dark-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setViewMode('COMMUNITIES')}
              className={`px-3 py-1.5 rounded-lg font-bold text-center transition-all ${
                viewMode === 'COMMUNITIES'
                  ? 'bg-brand-500 text-dark-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Group Owners
            </button>
            <button
              onClick={() => setViewMode('ADVERTISERS')}
              className={`px-3 py-1.5 rounded-lg font-bold text-center transition-all ${
                viewMode === 'ADVERTISERS'
                  ? 'bg-brand-500 text-dark-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Advertisers
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABLE 1: WHATSAPP GROUP & CHANNEL OWNERS */}
        {/* ========================================================================= */}
        {(viewMode === 'BOTH' || viewMode === 'COMMUNITIES') && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  WhatsApp Group & Channel Owners
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={() => copyPhones(partnerEntries, 'PARTNER')}
                  size="sm"
                  variant="outline"
                  disabled={partnerEntries.length === 0}
                  className="gap-1.5 font-bold text-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{copiedPartnerPhones ? 'Numbers Copied!' : 'Copy Group Admins WhatsApp'}</span>
                </Button>
                <Button
                  onClick={() => exportCSV('PARTNERS')}
                  size="sm"
                  variant="outline"
                  disabled={partnerEntries.length === 0}
                  className="gap-1.5 font-semibold text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </div>

            <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-brand-500" />
                  <span>Loading community list...</span>
                </div>
              ) : partnerEntries.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                  No community group owners found matching your search.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[800px]">
                    <thead className="bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-600 dark:text-slate-300 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5"># Pos</th>
                        <th className="px-5 py-3.5">Community Niche & Type</th>
                        <th className="px-5 py-3.5">Admin Name</th>
                        <th className="px-5 py-3.5">WhatsApp Contact</th>
                        <th className="px-5 py-3.5">Member Count / Range</th>
                        <th className="px-5 py-3.5">Category & Details</th>
                        <th className="px-5 py-3.5">Ref Code</th>
                        <th className="px-5 py-3.5 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {partnerEntries.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-black text-emerald-600 dark:text-emerald-400">
                            #{e.position}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white text-sm">
                            {e.company_or_community_name || 'General Community'}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                            {e.full_name}
                          </td>
                          <td className="px-5 py-3.5">
                            <a
                              href={`https://wa.me/${e.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{e.phone}</span>
                            </a>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              👥 {e.estimated_reach_or_budget || 'Count not specified'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={e.notes}>
                            {e.notes || '—'}
                          </td>
                          <td className="px-5 py-3.5 font-mono font-bold text-slate-600 dark:text-slate-400">
                            {e.referral_code}
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(e.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TABLE 2: BUSINESSES & ADVERTISERS */}
        {/* ========================================================================= */}
        {(viewMode === 'BOTH' || viewMode === 'ADVERTISERS') && (
          <div className="space-y-3 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Businesses & Advertisers
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={() => copyPhones(advertiserEntries, 'ADVERTISER')}
                  size="sm"
                  variant="outline"
                  disabled={advertiserEntries.length === 0}
                  className="gap-1.5 font-bold text-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  <span>{copiedAdvertiserPhones ? 'Numbers Copied!' : 'Copy Advertisers WhatsApp'}</span>
                </Button>
                <Button
                  onClick={() => exportCSV('ADVERTISERS')}
                  size="sm"
                  variant="outline"
                  disabled={advertiserEntries.length === 0}
                  className="gap-1.5 font-semibold text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </div>

            <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-brand-500" />
                  <span>Loading advertisers list...</span>
                </div>
              ) : advertiserEntries.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                  No business advertisers found matching your search.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[800px]">
                    <thead className="bg-blue-50/50 dark:bg-blue-950/20 text-slate-600 dark:text-slate-300 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5"># Pos</th>
                        <th className="px-5 py-3.5">Business / Brand Name</th>
                        <th className="px-5 py-3.5">Contact Person</th>
                        <th className="px-5 py-3.5">WhatsApp Contact</th>
                        <th className="px-5 py-3.5">Email & Country</th>
                        <th className="px-5 py-3.5">Estimated Ad Budget</th>
                        <th className="px-5 py-3.5">Audience & Notes</th>
                        <th className="px-5 py-3.5">Ref Code</th>
                        <th className="px-5 py-3.5 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {advertiserEntries.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-black text-blue-600 dark:text-blue-400">
                            #{e.position}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white text-sm">
                            {e.company_or_community_name || 'Unnamed Business'}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                            {e.full_name}
                          </td>
                          <td className="px-5 py-3.5">
                            <a
                              href={`https://wa.me/${e.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{e.phone}</span>
                            </a>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-slate-800 dark:text-slate-200 font-medium">{e.email}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Globe className="w-3 h-3 text-slate-400" />
                              <span>{e.country || 'Nigeria'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                              💼 {e.estimated_reach_or_budget || 'Budget not specified'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={e.notes}>
                            {e.notes || '—'}
                          </td>
                          <td className="px-5 py-3.5 font-mono font-bold text-slate-600 dark:text-slate-400">
                            {e.referral_code}
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(e.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
