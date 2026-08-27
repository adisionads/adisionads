export type UserRole = 'ADVERTISER' | 'COMMUNITY_PARTNER' | 'ADMIN';

export type CommunityPlatform = 'WHATSAPP_GROUP' | 'WHATSAPP_CHANNEL' | 'TELEGRAM' | 'DISCORD';

export type CommunityCategory =
  | 'STUDENTS_CAMPUS'
  | 'BUSINESS_FINANCE'
  | 'TECHNOLOGY'
  | 'CRYPTO_WEB3'
  | 'JOBS_CAREERS'
  | 'ENTERTAINMENT'
  | 'FASHION_LIFESTYLE'
  | 'SPORTS'
  | 'GENERAL'
  | 'LOCAL_COMMUNITIES';

export type CommunityStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

export type CampaignStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type AssignmentStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'PUBLISHED'
  | 'PROOF_SUBMITTED'
  | 'VERIFIED'
  | 'COMPLETED'
  | 'DISPUTED';

export type ProofStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';

export type LedgerTransactionType =
  | 'DEPOSIT'
  | 'ESCROW_HOLD'
  | 'COMMISSION_DEDUCTION'
  | 'CAMPAIGN_PAYOUT'
  | 'WITHDRAWAL'
  | 'REFUND';

export type TransactionDirection = 'CREDIT' | 'DEBIT';

export type WithdrawalStatus = 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export interface UserProfile {
  id: string;
  role: UserRole;
  email: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Community {
  id: string;
  owner_id: string;
  name: string;
  platform: CommunityPlatform;
  category: CommunityCategory;
  invite_link: string;
  member_count: number;
  description?: string;
  location?: string;
  verification_image_url?: string;
  status: CommunityStatus;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  performance_score?: number;
}

export interface CampaignPackage {
  id: string;
  name: string;
  price: number; // in NGN
  estimated_reach: string;
  community_count: number;
  duration_days: number;
  features: string[];
  is_popular?: boolean;
}

export interface VirtualAccountInfo {
  bank_name: string;
  account_number: string;
  account_name: string;
  expiry_time: string;
  amount: number;
  reference: string;
}

export interface Campaign {
  id: string;
  advertiser_id: string;
  title: string;
  category: CommunityCategory;
  ad_copy: string;
  media_url?: string;
  destination_url: string;
  cta_text: string;
  package_name: string;
  duration_days: number;
  budget_amount: number;
  commission_rate: number;
  distributable_pool: number;
  status: CampaignStatus;
  payment_status: PaymentStatus;
  payment_reference?: string;
  virtual_account_details?: VirtualAccountInfo;
  created_at: string;
  updated_at: string;
  total_clicks?: number;
  unique_clicks?: number;
  assigned_count?: number;
}

export interface CampaignAssignment {
  id: string;
  campaign_id: string;
  community_id: string;
  assigned_by?: string;
  tracking_code: string;
  payout_amount: number;
  status: AssignmentStatus;
  accepted_at?: string;
  published_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  campaign?: Campaign;
  community?: Community;
}

export interface TrackingLink {
  id: string;
  assignment_id: string;
  tracking_code: string;
  target_url: string;
  total_clicks: number;
  unique_clicks: number;
  created_at: string;
}

export interface ClickEvent {
  id: string;
  tracking_code: string;
  assignment_id: string;
  hashed_ip: string;
  user_agent?: string;
  referer?: string;
  is_unique: boolean;
  clicked_at: string;
}

export interface ProofRecord {
  id: string;
  assignment_id: string;
  community_id: string;
  submitted_by: string;
  proof_image_url: string;
  placement_timestamp: string;
  notes?: string;
  status: ProofStatus;
  reviewed_by?: string;
  review_feedback?: string;
  submitted_at: string;
  reviewed_at?: string;
  assignment?: CampaignAssignment;
  community?: Community;
}

export interface Wallet {
  id: string;
  user_id: string;
  available_balance: number;
  pending_balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  currency: string;
  updated_at: string;
}

export interface LedgerTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  transaction_type: LedgerTransactionType;
  amount: number;
  direction: TransactionDirection;
  balance_after: number;
  reference_id?: string;
  reference_type?: string;
  description: string;
  status: string;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  bank_name: string;
  bank_code?: string;
  account_number: string;
  account_name: string;
  status: WithdrawalStatus;
  processed_by?: string;
  transaction_reference?: string;
  notes?: string;
  created_at: string;
  processed_at?: string;
}

export interface PerformanceScore {
  id: string;
  community_id: string;
  reliability_score: number;
  activity_score: number;
  performance_score: number;
  composite_score: number;
  total_assignments: number;
  completed_assignments: number;
  total_clicks_generated: number;
  last_updated: string;
}

