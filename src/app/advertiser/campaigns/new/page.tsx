'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { CAMPAIGN_PACKAGES, COMMUNITY_CATEGORIES_LIST } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { CommunityCategory } from '@/types';
import { WhatsAppMockup } from '@/components/previews/WhatsAppMockup';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, TextArea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Layers,
  Megaphone,
  QrCode,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function NewCampaignPage() {
  const router = useRouter();
  const { createCampaign } = useApp();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCopied, setPaymentCopied] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CommunityCategory>('STUDENTS_CAMPUS');
  const [adCopy, setAdCopy] = useState(
    '⚡️ UNBEATABLE OFFER FOR STUDENTS! ⚡️\n\nGet 50% discount on all premium laptops & gadgets this week only.\n\n🎁 Use promo code ADISION50 for instant bonus!'
  );
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80');
  const [destinationUrl, setDestinationUrl] = useState('https://myshop.ng/deal');
  const [ctaText, setCtaText] = useState('Claim 50% Off 🛍️');
  const [selectedPackageId, setSelectedPackageId] = useState(CAMPAIGN_PACKAGES[1].id);

  const selectedPackage = CAMPAIGN_PACKAGES.find((p) => p.id === selectedPackageId) || CAMPAIGN_PACKAGES[1];

  const handleCreateAndProceedToPayment = () => {
    if (!title.trim()) {
      alert('Please provide a campaign title.');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      createCampaign({
        title,
        category,
        adCopy,
        media_url: mediaUrl,
        destination_url: destinationUrl,
        cta_text: ctaText,
        package_name: selectedPackage.name,
        duration_days: selectedPackage.duration_days,
        budget_amount: selectedPackage.price,
        commission_rate: 30.0,
        distributable_pool: selectedPackage.price * 0.7,
      });
      setIsSubmitting(false);
      setShowPaymentModal(false);
      router.push('/advertiser');
    }, 1200);
  };

  return (
    <div className="py-8 sm:py-12 bg-dark-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full text-xs font-extrabold flex items-center justify-center transition-all ${
                    currentStep === step
                      ? 'bg-brand-500 text-dark-900 ring-4 ring-brand-500/20'
                      : currentStep > step
                      ? 'bg-emerald-500 text-dark-900'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {currentStep > step ? <CheckCircle2 className="w-4 h-4" /> : step}
                </div>
                <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                  {step === 1 ? 'Targeting' : step === 2 ? 'Creative Copy' : 'Package & Pay'}
                </span>
                {step < 3 && <div className="w-6 h-[1px] bg-slate-800 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Main Grid: Form on Left, Live WhatsApp Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Columns: Step Forms */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: CAMPAIGN DETAILS & TARGETING */}
            {currentStep === 1 && (
              <Card className="p-6 sm:p-8 space-y-6 border-slate-800">
                <CardHeader className="p-0 mb-4">
                  <div className="inline-flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Megaphone className="w-4 h-4" />
                    <span>Step 1: Campaign Details</span>
                  </div>
                  <CardTitle>What are you promoting?</CardTitle>
                  <CardDescription>
                    Define your campaign title and choose the ideal audience category to match with.
                  </CardDescription>
                </CardHeader>

                <div className="space-y-4">
                  <Input
                    label="Campaign Title"
                    placeholder="e.g. SwiftPay 10% Cashback Promo"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    helperText="Visible in your reports and to matched community admins."
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Target Audience Category
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {COMMUNITY_CATEGORIES_LIST.map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            category === cat.id
                              ? 'border-brand-500 bg-brand-500/10 text-white shadow-md'
                              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold text-white mb-0.5">{cat.label}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{cat.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => {
                      if (!title.trim()) {
                        alert('Please enter a campaign title.');
                        return;
                      }
                      setCurrentStep(2);
                    }}
                    className="font-bold gap-2"
                  >
                    <span>Continue to Creative Copy</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* STEP 2: CREATIVE ASSETS & DESTINATION LINK */}
            {currentStep === 2 && (
              <Card className="p-6 sm:p-8 space-y-6 border-slate-800">
                <CardHeader className="p-0 mb-4">
                  <div className="inline-flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Step 2: WhatsApp Ad Creative</span>
                  </div>
                  <CardTitle>Craft Your WhatsApp Broadcast</CardTitle>
                  <CardDescription>
                    Write your engaging ad copy and provide the landing page or WhatsApp order link.
                  </CardDescription>
                </CardHeader>

                <div className="space-y-4">
                  <TextArea
                    label="WhatsApp Ad Copy & Message"
                    rows={6}
                    placeholder="Type the message that will be broadcasted to group members..."
                    value={adCopy}
                    onChange={(e) => setAdCopy(e.target.value)}
                    helperText="Emojis and clear line breaks produce the highest click-through rates."
                  />

                  <Input
                    label="Creative Image Media URL"
                    placeholder="https://your-domain.com/ad-flyer.jpg"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    helperText="Link to your promotional flyer or product banner (PNG / JPG / WebP)."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Destination URL"
                      placeholder="https://yourwebsite.com/deal"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      helperText="Where users land when clicking your ad."
                    />

                    <Input
                      label="Call-To-Action (CTA) Button"
                      placeholder="e.g. Order on WhatsApp 🛒"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button size="md" variant="ghost" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => setCurrentStep(3)}
                    className="font-bold gap-2"
                  >
                    <span>Select Package & Budget</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* STEP 3: PACKAGE SELECTION & CHECKOUT */}
            {currentStep === 3 && (
              <Card className="p-6 sm:p-8 space-y-6 border-slate-800">
                <CardHeader className="p-0 mb-4">
                  <div className="inline-flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <Zap className="w-4 h-4" />
                    <span>Step 3: Distribution Package</span>
                  </div>
                  <CardTitle>Select Reach & Payment</CardTitle>
                  <CardDescription>
                    Choose your campaign package. Funds are held safely in escrow.
                  </CardDescription>
                </CardHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CAMPAIGN_PACKAGES.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedPackageId === pkg.id
                            ? 'border-brand-500 bg-brand-500/10 shadow-lg'
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-white text-sm">{pkg.name}</span>
                          <span className="text-sm font-extrabold text-brand-400">
                            {formatCurrency(pkg.price)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{pkg.estimated_reach}</p>
                        <div className="text-[11px] text-slate-500 mt-2 font-medium">
                          {pkg.community_count} Verified Communities • {pkg.duration_days} Days
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal Budget:</span>
                      <span className="font-bold text-white">{formatCurrency(selectedPackage.price)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Placement Verification & Escrow:</span>
                      <span className="text-brand-400 font-bold">Included</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black text-white">
                      <span>Total Due:</span>
                      <span className="text-brand-400">{formatCurrency(selectedPackage.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button size="md" variant="ghost" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button
                    size="md"
                    variant="primary"
                    onClick={handleCreateAndProceedToPayment}
                    className="font-bold gap-2 shadow-lg shadow-brand-500/20"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Proceed to Payment ({formatCurrency(selectedPackage.price)})</span>
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right 5 Columns: Live Interactive WhatsApp Mockup */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live WhatsApp Ad Preview
              </span>
              <span className="text-[10px] bg-brand-500/20 text-brand-400 font-bold px-2 py-0.5 rounded-full">
                Real-Time
              </span>
            </div>

            <WhatsAppMockup
              communityName="Matched WhatsApp Community"
              category={category}
              adCopy={adCopy}
              mediaUrl={mediaUrl}
              destinationUrl={destinationUrl}
              ctaText={ctaText}
              trackingCode="ad_live_preview"
            />
          </div>
        </div>
      </div>

      {/* PAYMENTPOINT VIRTUAL ACCOUNT CHECKOUT MODAL */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Complete Bank Transfer Payment"
        description="Transfer the exact amount to the PaymentPoint dedicated account below."
        maxWidth="md"
      >
        <div className="space-y-6">
          {/* Payment Amount Card */}
          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Amount Due:</span>
              <div className="text-2xl font-black text-brand-400">
                {formatCurrency(selectedPackage.price)}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-400">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          {/* Virtual Bank Account Details */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Bank Name:</span>
              <span className="font-bold text-white">Wema Bank (ALAT) / PaymentPoint</span>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-slate-900">
              <span className="text-slate-400">Account Number:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-brand-400">9948291048</span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText('9948291048');
                    setPaymentCopied(true);
                    setTimeout(() => setPaymentCopied(false), 2000);
                  }}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-slate-900">
              <span className="text-slate-400">Account Name:</span>
              <span className="font-bold text-white">ADISION / {title.slice(0, 14) || 'CAMPAIGN'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-t border-slate-900">
              <span className="text-slate-400">Account Type:</span>
              <span className="font-medium text-emerald-400">Dynamic Instant Settlement</span>
            </div>
          </div>

          {paymentCopied && (
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs text-center font-semibold">
              Account Number copied to clipboard!
            </div>
          )}

          {/* Action button to simulate transfer completion */}
          <div className="space-y-2">
            <Button
              size="lg"
              variant="primary"
              onClick={handleConfirmPayment}
              isLoading={isSubmitting}
              className="w-full font-bold shadow-lg shadow-brand-500/20"
            >
              <span>I Have Transferred {formatCurrency(selectedPackage.price)}</span>
            </Button>
            <p className="text-[11px] text-center text-slate-400">
              PaymentPoint automatically verifies transfer within 30 seconds.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

