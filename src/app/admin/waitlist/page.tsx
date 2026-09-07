'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  Copy,
  Download,
  Filter,
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
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADVERTISER' | 'COMMUNITY_PARTNER'>('ALL');
  const [copiedPhones, setCopiedPhones] = useState(false);

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

  const filteredEntries = entries.filter((e) => {
    const matchesRole = roleFilter === 'ALL' || e.role === roleFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      e.full_name?.toLowerCase().includes(query) ||
      e.email?.toLowerCase().includes(query) ||
      e.phone?.toLowerCase().includes(query) ||
      e.country?.toLowerCase().includes(query) ||
      e.company_or_community_name?.toLowerCase().includes(query);
    return matchesRole && matchesSearch;
  });

  const exportCSV = () => {
    if (filteredEntries.length === 0) return;
    const headers = [
      'Position',
      'Full Name',
      'Email',
      'WhatsApp Phone',
      'Country',
      'Role',
      'Company or Community',
      'Estimated Budget or Reach',
      'Referral Code',
      'Date Joined',
    ];

    const rows = filteredEntries.map((e) => [
      e.position,
      `"${(e.full_name || '').replace(/"/g, '""')}"`,
      `"${(e.email || '').replace(/"/g, '""')}"`,
      `"${(e.phone || '').replace(/"/g, '""')}"`,
      `"${(e.country || 'Nigeria').replace(/"/g, '""')}"`,
      e.role,
      `"${(e.company_or_community_name || '').replace(/"/g, '""')}"`,
      `"${(e.estimated_reach_or_budget || '').replace(/"/g, '""')}"`,
      e.referral_code,
      new Date(e.created_at).toLocaleDateString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `adision_waitlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyWhatsAppNumbers = () => {
    const numbers = filteredEntries
      .map((e) => e.phone)
      .filter(Boolean)
      .join(', ');
    if (!numbers) return;
    navigator.clipboard.writeText(numbers);
    setCopiedPhones(true);
    setTimeout(() => setCopiedPhones(false), 2500);
  };

  const advertiserCount = entries.filter((e) => e.role === 'ADVERTISER').length;
  const partnerCount = entries.filter((e) => e.role === 'COMMUNITY_PARTNER').length;
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
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>VIP Waitlist Database</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-500/30">
                {entries.length} Total Signups
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time early access records for prospective advertisers and community partners.
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
              onClick={copyWhatsAppNumbers}
              size="sm"
              variant="outline"
              disabled={filteredEntries.length === 0}
              className="gap-1.5 font-semibold text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-brand-500" />
              <span>{copiedPhones ? 'Copied to Clipboard!' : 'Copy WhatsApp Numbers'}</span>
            </Button>

            <Button
              onClick={exportCSV}
              size="sm"
              variant="primary"
              disabled={filteredEntries.length === 0}
              className="gap-1.5 font-bold text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Quick KPI Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-white dark:bg-slate-900">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Waitlist
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {entries.length}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Permanent early signups</div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-900">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-brand-500" />
              <span>Advertisers</span>
            </div>
            <div className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">
              {advertiserCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ready to buy ad reach</div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-900">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>Community Admins</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {partnerCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">WhatsApp groups/channels</div>
          </Card>

          <Card className="p-4 bg-white dark:bg-slate-900">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>Countries</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {uniqueCountries}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Regional distribution</div>
          </Card>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  roleFilter === 'ALL'
                    ? 'bg-brand-500 text-dark-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({entries.length})
              </button>
              <button
                onClick={() => setRoleFilter('ADVERTISER')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  roleFilter === 'ADVERTISER'
                    ? 'bg-brand-500 text-dark-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Ads ({advertiserCount})
              </button>
              <button
                onClick={() => setRoleFilter('COMMUNITY_PARTNER')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  roleFilter === 'COMMUNITY_PARTNER'
                    ? 'bg-brand-500 text-dark-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Partners ({partnerCount})
              </button>
            </div>
          </div>
        </div>

        {/* Waitlist Data Table */}
        <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
              <span>Fetching waitlist database...</span>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="py-16 text-center px-4 space-y-3">
              <Sparkles className="w-10 h-10 text-brand-500/50 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {searchQuery ? 'No signups match your search' : 'No waitlist signups recorded yet'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try changing or clearing your search term.'
                  : 'Signups submitted from /waitlist will appear here permanently with full contact info and export capabilities.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[800px]">
                <thead className="bg-slate-100 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4"># Position</th>
                    <th className="px-6 py-4">Name & Role</th>
                    <th className="px-6 py-4">WhatsApp Contact</th>
                    <th className="px-6 py-4">Email & Country</th>
                    <th className="px-6 py-4">Brand / Group & Scale</th>
                    <th className="px-6 py-4">Referral Code</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                  {filteredEntries.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-black text-brand-600 dark:text-brand-400">
                        #{e.position}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {e.full_name}
                        </div>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            e.role === 'ADVERTISER'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {e.role === 'ADVERTISER' ? 'Advertiser' : 'Community Partner'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{e.email}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{e.country || 'Nigeria'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {e.company_or_community_name || '—'}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                          {e.estimated_reach_or_budget || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {e.referral_code}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400">
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
    </div>
  );
}
