import {
  Campaign,
  CampaignAssignment,
  Community,
  LedgerTransaction,
  ProofRecord,
  UserProfile,
  Wallet,
  WithdrawalRequest,
} from '@/types';

export const INITIAL_USER_ADVERTISER: UserProfile = {
  id: 'usr_adv_001',
  role: 'ADVERTISER',
  email: 'advertiser@adision.co',
  phone: '+2348000000001',
  full_name: 'Adision Advertiser',
  avatar_url: '',
  is_verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const INITIAL_USER_PARTNER: UserProfile = {
  id: 'usr_part_001',
  role: 'COMMUNITY_PARTNER',
  email: 'partner@adision.co',
  phone: '+2348000000002',
  full_name: 'Community Partner',
  avatar_url: '',
  is_verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const INITIAL_USER_ADMIN: UserProfile = {
  id: 'usr_admin_001',
  role: 'ADMIN',
  email: 'admin@adision.co',
  phone: '+2348000000000',
  full_name: 'Adision Operations',
  avatar_url: '/brand/logo-square.jpg',
  is_verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Empty initial arrays for clean real-data management
export const INITIAL_COMMUNITIES: Community[] = [];

export const INITIAL_CAMPAIGNS: Campaign[] = [];

export const INITIAL_ASSIGNMENTS: CampaignAssignment[] = [];

export const INITIAL_PROOFS: ProofRecord[] = [];

export const INITIAL_WALLET_PARTNER: Wallet = {
  id: 'wlt_part_001',
  user_id: 'usr_part_001',
  available_balance: 0,
  pending_balance: 0,
  lifetime_earned: 0,
  lifetime_spent: 0,
  currency: 'NGN',
  updated_at: new Date().toISOString(),
};

export const INITIAL_LEDGER_TRANSACTIONS: LedgerTransaction[] = [];

export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [];
