import { CampaignPackage, CommunityCategory } from '@/types';

export const CAMPAIGN_PACKAGES: CampaignPackage[] = [
  {
    id: 'pkg_starter',
    name: 'Starter Boost',
    price: 7000,
    estimated_reach: '3,000 – 6,000 members',
    community_count: 3,
    duration_days: 3,
    features: [
      '3 Verified WhatsApp Communities',
      'Unique Link Click Tracking',
      'Proof of Placement Verification',
      '3-Day Active Distribution',
      'Real-Time Performance Dashboard',
    ],
  },
  {
    id: 'pkg_growth',
    name: 'Growth Blast',
    price: 20000,
    estimated_reach: '12,000 – 25,000 members',
    community_count: 8,
    duration_days: 7,
    is_popular: true,
    features: [
      '8 High-Performing Verified Groups',
      'Niche Category Audience Targeting',
      'Priority Broadcast Slot',
      'Unique Click & CTR Analytics',
      'Screenshot Proof Review Guarantee',
      '7-Day Distribution Support',
    ],
  },
  {
    id: 'pkg_scale',
    name: 'Dominance Pro',
    price: 50000,
    estimated_reach: '35,000 – 70,000 members',
    community_count: 20,
    duration_days: 14,
    features: [
      '20 Top-Tier High Engagement Communities',
      'Multi-Category Cross Distribution',
      'Dedicated Campaign Moderator',
      'Advanced Click Fraud Filtering',
      'Full Placement Proof Reports',
      '14-Day Extended Reach',
    ],
  },
  {
    id: 'pkg_enterprise',
    name: 'Mega Viral Takeover',
    price: 150000,
    estimated_reach: '120,000+ members',
    community_count: 50,
    duration_days: 30,
    features: [
      '50+ Verified WhatsApp Mega Groups & Channels',
      'Maximum Campus & Tech Viral Penetration',
      'Custom Delivery Timing & Pinning',
      'Full Attribution Telemetry & Raw Click Logs',
      'Direct Account Manager',
      '30-Day Nationwide Saturation',
    ],
  },
];

export const COMMUNITY_CATEGORIES_LIST: { id: CommunityCategory; label: string; description: string; icon: string }[] = [
  {
    id: 'STUDENTS_CAMPUS',
    label: 'Students & Campus',
    description: 'Universities, polytechnics, student unions, hostel and department groups.',
    icon: 'GraduationCap',
  },
  {
    id: 'BUSINESS_FINANCE',
    label: 'Business & Finance',
    description: 'Entrepreneurs, SME founders, investments, VTU traders, and side-hustlers.',
    icon: 'Briefcase',
  },
  {
    id: 'TECHNOLOGY',
    label: 'Technology & Startups',
    description: 'Software engineers, designers, product builders, AI enthusiasts.',
    icon: 'Cpu',
  },
  {
    id: 'CRYPTO_WEB3',
    label: 'Crypto & Web3',
    description: 'Traders, airdrop hunters, blockchain communities, and DeFi enthusiasts.',
    icon: 'Coins',
  },
  {
    id: 'JOBS_CAREERS',
    label: 'Jobs & Opportunities',
    description: 'Job seekers, remote work vacancies, scholarships, and career coaching.',
    icon: 'SearchCheck',
  },
  {
    id: 'ENTERTAINMENT',
    label: 'Entertainment & Comedy',
    description: 'Meme groups, music fans, viral trends, movies, and pop culture.',
    icon: 'Film',
  },
  {
    id: 'FASHION_LIFESTYLE',
    label: 'Fashion & Lifestyle',
    description: 'Clothing vendors, beauty, skincare, thrift enthusiasts, lifestyle.',
    icon: 'Sparkles',
  },
  {
    id: 'SPORTS',
    label: 'Sports & Gaming',
    description: 'Football discussions, Premier League/UCL fans, betting analysis, gamers.',
    icon: 'Trophy',
  },
  {
    id: 'LOCAL_COMMUNITIES',
    label: 'Local Communities',
    description: 'State-specific hubs (Lagos, Abuja, Port Harcourt, Ibadan, Enugu, etc.).',
    icon: 'MapPin',
  },
  {
    id: 'GENERAL',
    label: 'General Audience',
    description: 'Broad interest groups, open broadcast channels, and lifestyle forums.',
    icon: 'Users',
  },
];

export const NIGERIAN_BANKS = [
  { name: 'Access Bank', code: '044' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
  { name: 'United Bank for Africa (UBA)', code: '033' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'Kuda Microfinance Bank', code: '50211' },
  { name: 'OPay Digital Services', code: '999992' },
  { name: 'Palmpay', code: '999991' },
  { name: 'Moniepoint MFB', code: '50515' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'Wema Bank (ALAT)', code: '035' },
];

