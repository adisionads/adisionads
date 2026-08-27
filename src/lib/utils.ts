import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CommunityCategory, CommunityPlatform } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount).replace('NGN', '₦');
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatCategoryName(category: CommunityCategory | string): string {
  const categoryMap: Record<string, string> = {
    STUDENTS_CAMPUS: 'Students & Campus',
    BUSINESS_FINANCE: 'Business & Finance',
    TECHNOLOGY: 'Technology & Startups',
    CRYPTO_WEB3: 'Crypto & Web3',
    JOBS_CAREERS: 'Jobs & Opportunities',
    ENTERTAINMENT: 'Entertainment & Comedy',
    FASHION_LIFESTYLE: 'Fashion & Lifestyle',
    SPORTS: 'Sports & Gaming',
    GENERAL: 'General Audience',
    LOCAL_COMMUNITIES: 'Local Communities',
  };
  return categoryMap[category] || category.replace(/_/g, ' ');
}

export function formatPlatformName(platform: CommunityPlatform | string): string {
  const platformMap: Record<string, string> = {
    WHATSAPP_GROUP: 'WhatsApp Group',
    WHATSAPP_CHANNEL: 'WhatsApp Channel',
    TELEGRAM: 'Telegram Community',
    DISCORD: 'Discord Server',
  };
  return platformMap[platform] || platform;
}

export function generateTrackingCode(prefix: string = 'ad'): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${result}`;
}

export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status.toUpperCase()) {
    case 'VERIFIED':
    case 'ACTIVE':
    case 'PAID':
    case 'APPROVED':
    case 'COMPLETED':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'PENDING':
    case 'REQUESTED':
    case 'PROCESSING':
    case 'ASSIGNED':
    case 'ACCEPTED':
    case 'PUBLISHED':
    case 'PROOF_SUBMITTED':
      return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
    case 'REJECTED':
    case 'FAILED':
    case 'CANCELLED':
    case 'SUSPENDED':
    case 'DECLINED':
    case 'DISPUTED':
      return { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' };
    case 'DRAFT':
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
  }
}

