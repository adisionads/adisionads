'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COUNTRY_DIAL_CODES, normalizePhoneNumber } from '@/lib/utils';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  User as UserIcon,
  Users,
} from 'lucide-react';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const { signUp } = useAuth();

  const [role, setRole] = useState<UserRole>('ADVERTISER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dialCode, setDialCode] = useState('+234');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('Please provide your active WhatsApp phone number.');
      return;
    }

    // Automatically format phone number to international WhatsApp standard
    const formattedPhone = normalizePhoneNumber(phone, dialCode);

    setIsLoading(true);

    const { error, requiresEmailConfirmation } = await signUp(email, password, {
      fullName: fullName.trim(),
      role,
      phone: formattedPhone,
    });

    if (error) {
      setErrorMsg(error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);

    if (requiresEmailConfirmation) {
      setNeedsConfirmation(true);
      return;
    }

    setSuccess(true);

    setTimeout(() => {
      if (redirectParam && redirectParam.startsWith('/')) {
        router.push(redirectParam);
      } else if (role === 'COMMUNITY_PARTNER') {
        router.push('/partner');
      } else {
        router.push('/advertiser');
      }
    }, 1500);
  };

  if (needsConfirmation) {
    return (
      <Card className="max-w-md w-full mx-auto p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-600 dark:text-brand-400">
          <Mail className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Check Your Email</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            We sent a verification link to <br />
            <span className="font-bold text-slate-900 dark:text-white">{email}</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
            Click the link in your email to confirm your account, then you can log in directly.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/login">
            <Button variant="primary" size="lg" className="w-full font-bold">
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="max-w-md w-full mx-auto p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-600 dark:text-brand-400">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Account Created!</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Welcome to Adision. Redirecting you to your dashboard now...
        </p>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full mx-auto p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="h-10 w-auto rounded-xl overflow-hidden shadow-md bg-brand-500 inline-flex items-center px-1 mb-2">
          <img
            src="/brand/logo-horizontal.jpg"
            alt="Adision"
            className="h-8 w-auto object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Create Your Account
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Join Adision to reach active communities or monetize your WhatsApp audience.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          Select Your Goal:
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setRole('ADVERTISER')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${
              role === 'ADVERTISER'
                ? 'bg-brand-500 text-dark-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Advertise</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('COMMUNITY_PARTNER')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${
              role === 'COMMUNITY_PARTNER'
                ? 'bg-brand-500 text-dark-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Monetize Group</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-medium space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <span>⚠️</span>
            <span>Registration Notice</span>
          </div>
          <p className="leading-relaxed">
            {errorMsg.toLowerCase().includes('rate limit')
              ? "Supabase email rate limit exceeded. To fix this instantly: open your Supabase Dashboard -> Authentication -> Providers -> Email, toggle 'Confirm email' to OFF, click Save, and submit again for instant signup!"
              : errorMsg}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <UserIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. Tunde Balogun"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-base font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-base font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* WhatsApp Phone Number with Country Code Dropdown */}
        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            WhatsApp Phone Number *
          </label>
          <div className="flex gap-2">
            <select
              value={dialCode}
              onChange={(e) => setDialCode(e.target.value)}
              className="w-32 py-3 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              {COUNTRY_DIAL_CODES.map((c) => (
                <option key={c.country} value={c.code}>
                  {c.flag} {c.code || 'Other'}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <input
                type="tel"
                required
                placeholder="e.g. 08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-base font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            💡 <strong>How to enter:</strong> Type with or without the 0 (e.g. <strong>08012345678</strong> or <strong>8012345678</strong>). We format it for WhatsApp.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            Password (min 6 characters) *
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-base font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full font-extrabold text-base shadow-lg shadow-brand-500/20 mt-2 py-3.5"
        >
          <span>Create My Account</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            href={`/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
            className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Sign In
          </Link>
        </p>

        <div className="pt-1">
          <Link
            href="/waitlist"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Prefer to join the early access waitlist? Click here</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default function SignUpPage() {
  return (
    <div className="py-16 sm:py-24 min-h-[85vh] flex items-center justify-center px-4 bg-slate-50 dark:bg-dark-900 transition-colors">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading sign up...</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
