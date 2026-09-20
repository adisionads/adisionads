'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const { error } = await resetPassword(email);

    setIsLoading(false);
    if (error) {
      setErrorMsg(error);
    } else {
      setIsSuccess(true);
    }
  };

  return (
    <div className="py-16 sm:py-24 min-h-[85vh] flex items-center justify-center px-4 bg-slate-50 dark:bg-dark-900 transition-colors">
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
            Reset Password
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Enter your account email and we'll send you a secure link to reset your password.
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm space-y-2 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Check your inbox
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                We sent a password reset link to <strong className="font-semibold">{email}</strong>.
                Click the link in your email to choose a new password.
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to sign in</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-medium">
                {errorMsg}
              </div>
            )}

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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-extrabold text-base shadow-lg shadow-brand-500/20 mt-2 py-3.5"
            >
              <span>Send Reset Link</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

