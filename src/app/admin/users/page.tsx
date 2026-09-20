'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/app-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  Users,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  Building2,
  Share2,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Megaphone,
  Wallet,
} from 'lucide-react';

interface MockPlatformUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'ADVERTISER' | 'COMMUNITY_ADMIN';
  business_name?: string;
  created_at: string;
  campaign_count?: number;
  total_spent?: number;
  community_count?: number;
  wallet_balance?: number;
  status: 'ACTIVE' | 'PENDING_KYC';
}

const INITIAL_DIRECTORY_USERS: MockPlatformUser[] = [
  {
    id: 'usr_adv_01',
    full_name: 'Babajide Adeleke',
    email: 'adeleke@lagosmedia.ng',
    phone: '2348031234567',
    role: 'ADVERTISER',
    business_name: 'Lagos Campus Media Hub',
    created_at: '2026-09-18T10:30:00Z',
    campaign_count: 3,
    total_spent: 45000,
    status: 'ACTIVE',
  },
  {
    id: 'usr_adv_02',
    full_name: 'Chidinma Okonjo',
    email: 'chidinma@vtuconnect.com.ng',
    phone: '2348149876543',
    role: 'ADVERTISER',
    business_name: 'VTU Connect Nigeria',
    created_at: '2026-09-19T14:15:00Z',
    campaign_count: 1,
    total_spent: 17500,
    status: 'ACTIVE',
  },
  {
    id: 'usr_part_01',
    full_name: 'Emmanuel Nnamdi',
    email: 'emmanuel@unilagupdates.ng',
    phone: '2348023456789',
    role: 'COMMUNITY_ADMIN',
    business_name: 'UNILAG Direct Community',
    created_at: '2026-09-17T09:00:00Z',
    community_count: 2,
    wallet_balance: 14000,
    status: 'ACTIVE',
  },
  {
    id: 'usr_part_02',
    full_name: 'Aisha Bello',
    email: 'aisha@abujacrypto.com',
    phone: '2349012345678',
    role: 'COMMUNITY_ADMIN',
    business_name: 'Abuja Web3 Traders',
    created_at: '2026-09-19T11:45:00Z',
    community_count: 1,
    wallet_balance: 7500,
    status: 'ACTIVE',
  },
  {
    id: 'usr_adv_03',
    full_name: 'Tunde Bakare',
    email: 'tunde@swiftlogistics.ng',
    phone: '2348056789012',
    role: 'ADVERTISER',
    business_name: 'Swift Delivery Express',
    created_at: '2026-09-20T08:20:00Z',
    campaign_count: 1,
    total_spent: 7000,
    status: 'ACTIVE',
  },
];

export default function AdminUsersDirectoryPage() {
  const { campaigns, communities } = useApp();
  const [filterRole, setFilterRole] = useState<'ALL' | 'ADVERTISER' | 'COMMUNITY_ADMIN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    return INITIAL_DIRECTORY_USERS.filter((user) => {
      const matchesRole = filterRole === 'ALL' || user.role === filterRole;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        user.full_name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.phone.includes(q) ||
        (user.business_name && user.business_name.toLowerCase().includes(q));
      return matchesRole && matchesSearch;
    });
  }, [filterRole, searchQuery]);

  const totalAdvertisers = INITIAL_DIRECTORY_USERS.filter((u) => u.role === 'ADVERTISER').length;
  const totalPartners = INITIAL_DIRECTORY_USERS.filter((u) => u.role === 'COMMUNITY_ADMIN').length;

  const exportCSV = () => {
    const headers = 'ID,Full Name,Role,Email,Phone,Business Name,Created At\n';
    const rows = filteredUsers
      .map(
        (u) =>
          `"${u.id}","${u.full_name}","${u.role}","${u.email}","${u.phone}","${u.business_name || ''}","${u.created_at}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adision-users-${filterRole.toLowerCase()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-dark-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mb-2 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Control</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Registered Users Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Directory of verified advertisers and community admins distinct from waitlist signups.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/waitlist">
              <Button size="sm" variant="outline" className="font-bold text-xs gap-1.5">
                <span>View Waitlist</span>
              </Button>
            </Link>
            <Button size="sm" variant="primary" onClick={exportCSV} className="font-bold text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Advertisers
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {totalAdvertisers}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Community Partners
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {totalPartners}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Active Live Campaigns
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {campaigns.length}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Controls & Search */}
        <Card className="p-4 bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 w-full sm:w-auto">
            <button
              onClick={() => setFilterRole('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterRole === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Users ({INITIAL_DIRECTORY_USERS.length})
            </button>
            <button
              onClick={() => setFilterRole('ADVERTISER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterRole === 'ADVERTISER'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Advertisers ({totalAdvertisers})
            </button>
            <button
              onClick={() => setFilterRole('COMMUNITY_ADMIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterRole === 'COMMUNITY_ADMIN'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Partners ({totalPartners})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">User / Business</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Activity & Balance</th>
                  <th className="px-5 py-3">Registered</th>
                  <th className="px-5 py-3 text-right">Direct Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {user.full_name}
                        </div>
                        {user.business_name && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{user.business_name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            user.role === 'ADVERTISER'
                              ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {user.role === 'ADVERTISER' ? 'Advertiser' : 'Community Partner'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 space-y-0.5">
                        <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>+{user.phone}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {user.role === 'ADVERTISER' ? (
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatCurrency(user.total_spent || 0)}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                              {user.campaign_count} campaign(s)
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(user.wallet_balance || 0)}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                              {user.community_count} WhatsApp group(s)
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(user.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <a
                          href={`https://wa.me/${user.phone}?text=${encodeURIComponent(
                            `Hello ${user.full_name}, this is Adision Operations reaching out regarding your account.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

