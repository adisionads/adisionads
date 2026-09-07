'use client';

import React, { useEffect, useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('[Adision PWA] Service Worker registered'))
        .catch((err) => console.warn('[Adision PWA] SW registration failed:', err));
    }

    // 2. Check if already running in standalone / installed mode
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) return;

    // 3. Check if user dismissed banner recently
    const dismissed = localStorage.getItem('adision_pwa_dismissed');
    if (dismissed && Date.now() - Number(dismissed) < 1000 * 60 * 60 * 24 * 7) {
      // Don't nag user if dismissed in the last 7 days
      return;
    }

    // 4. iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleMobile);

    // 5. Android/Chromium beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt on iOS after a brief delay if not standalone
    if (isAppleMobile && !isRunningStandalone) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('adision_pwa_dismissed', Date.now().toString());
  };

  if (!showBanner || isStandalone) return null;

  return (
    <aside aria-label="Install App" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 border border-brand-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-start gap-3 relative">
        <div className="p-2.5 rounded-xl bg-brand-500 text-dark-900 font-extrabold shrink-0 shadow-md">
          <Smartphone className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-1 pr-6">
          <div className="text-sm font-bold text-white">Install Adision App</div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isIOS ? (
              <span>
                Tap <Share className="w-3.5 h-3.5 inline mx-0.5 text-brand-400" /> then select <strong>Add to Home Screen</strong> for instant access.
              </span>
            ) : (
              <span>Install to your phone home screen for fast access to campaigns and payouts.</span>
            )}
          </p>

          {!isIOS && deferredPrompt && (
            <div className="pt-2">
              <Button
                size="sm"
                variant="primary"
                onClick={handleInstallClick}
                className="font-bold text-xs gap-1.5 py-1.5 h-8 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
