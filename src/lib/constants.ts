import { CampaignPackage, CommunityCategory } from '@/types';

export const CAMPAIGN_PACKAGES: CampaignPackage[] = [
  {
    id: 'pkg_starter',
    name: 'Starter',
    outcome_title: 'I want reach.',
    outcome_description: 'Reach & visibility',
    price: 5750,
    billing_model: 'FIXED',
    duration_days: 14,
    estimated_reach: 'Targeted WhatsApp Reach',
    community_count: 5,
    features: [
      '14-day advertising campaign',
      'Distribution across relevant WhatsApp groups/channels',
      '1 bonus advertising day (15 days total)',
      'Campaign tracking and basic performance reporting',
      'Best for businesses testing Adision and building awareness',
    ],
  },
  {
    id: 'pkg_corporate',
    name: 'Corporate',
    outcome_title: 'I want new users.',
    outcome_description: 'Acquire new users',
    price: 17500, // Example: 50 signups × ₦350
    unit_price: 350,
    default_quantity: 50,
    billing_model: 'PER_SIGNUP',
    duration_days: 14,
    estimated_reach: 'Verified User Signups',
    community_count: 12,
    is_popular: true,
    features: [
      '₦350 per qualified signup',
      'Advertiser chooses the number of signups required (e.g. 50 × ₦350 = ₦17,500)',
      'Campaign is funded upfront into your campaign balance',
      'Only verified new users attributed to the campaign count',
      'Unused campaign balance remains available after delivery',
    ],
  },
  {
    id: 'pkg_gold_salesman',
    name: 'Gold Salesman',
    outcome_title: 'I want paying customers.',
    outcome_description: 'Acquire paying customers',
    price: 10000, // Example: 20 customers × ₦500
    unit_price: 500,
    default_quantity: 20,
    billing_model: 'PER_CUSTOMER',
    duration_days: 30,
    estimated_reach: 'Direct Paying Customers',
    community_count: 20,
    features: [
      '₦500 per qualified paying customer',
      'Advertiser chooses target number of paying customers (e.g. 20 × ₦500 = ₦10,000)',
      'Campaign is funded upfront into your campaign balance',
      'Counts only after signup + qualifying purchase/deposit',
      'Unused balance is not consumed when target is not reached',
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

