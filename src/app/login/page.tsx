'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const { signIn, role } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setErrorMsg(error);
      setIsLoading(false);
      return;
    }

    // Determine destination
    if (redirectParam && redirectParam.startsWith('/')) {
      router.push(redirectParam);
    } else if (email.toLowerCase().includes('admin') || role === 'ADMIN') {
      router.push('/admin');
    } else if (role === 'COMMUNITY_PARTNER') {
      router.push('/partner');
    } else {
      router.push('/advertiser');
    }
  };

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
          Welcome to Adision
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Sign in to access your advertising portal or community earnings.
        </p>
      </div>

      {redirectParam && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 text-xs text-center font-medium">
          Please sign in to access <span className="font-mono font-bold">{redirectParam}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-medium space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <span>⚠️</span>
            <span>Sign In Notice</span>
          </div>
          <p className="leading-relaxed">
            {errorMsg.toLowerCase().includes('email not confirmed')
              ? 'Your email has not been verified yet. Please check your inbox for the confirmation link before signing in.'
              : errorMsg}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            Email Address
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

        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
            Password
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
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link
            href={`/signup${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
            className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Create an Account
          </Link>
        </p>

        <div className="pt-2">
          <Link
            href="/waitlist"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Not ready? Join the VIP Early Access Waitlist</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="py-16 sm:py-24 min-h-[85vh] flex items-center justify-center px-4 bg-slate-50 dark:bg-dark-900 transition-colors">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
