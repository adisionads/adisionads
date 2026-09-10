'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/app-context';
import { CAMPAIGN_PACKAGES, COMMUNITY_CATEGORIES_LIST } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { CommunityCategory } from '@/types';
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
  Megaphone,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { authFetch } from '@/lib/auth/auth-fetch';

export default function NewCampaignPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { createCampaign } = useApp();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCopied, setPaymentCopied] = useState(false);

  // Live Checkout State
  const [checkoutData, setCheckoutData] = useState<{
    campaign_id: string;
    reference: string;
    amount: number;
    payment_link?: string;
    virtual_account: {
      bank_name: string;
      account_number: string;
      account_name: string;
      expiry_time?: string;
    };
  } | null>(null);
  const [isGeneratingCheckout, setIsGeneratingCheckout] = useState(false);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CommunityCategory>('STUDENTS_CAMPUS');
  const [adCopy, setAdCopy] = useState(
    '⚡️ UNBEATABLE OFFER FOR STUDENTS! ⚡️\n\nGet 50% discount on all premium laptops & gadgets this week only.\n\n🎁 Use promo code ADISION50 for instant bonus!'
  );
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80');
  const [destinationUrl, setDestinationUrl] = useState('https://myshop.ng/deal');
  const [ctaText, setCtaText] = useState('Claim 50% Off 🛍️');

  // Outcome-based Package State
  const [selectedPackageId, setSelectedPackageId] = useState(CAMPAIGN_PACKAGES[1].id); // Corporate by default
  const [targetQuantity, setTargetQuantity] = useState(50); // 50 signups or 20 customers

  const selectedPackage = CAMPAIGN_PACKAGES.find((p) => p.id === selectedPackageId) || CAMPAIGN_PACKAGES[1];

  // Calculate dynamic upfront budget deposit
  const calculatedBudget =
    selectedPackage.billing_model === 'PER_SIGNUP'
      ? targetQuantity * 350
      : selectedPackage.billing_model === 'PER_CUSTOMER'
      ? targetQuantity * 750
      : 5750;

  const handleSelectPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    if (pkgId === 'pkg_corporate') setTargetQuantity(50);
    else if (pkgId === 'pkg_gold_salesman') setTargetQuantity(20);
    else setTargetQuantity(1);
  };

  const handleCreateAndProceedToPayment = async () => {
    if (!title.trim()) {
      alert('Please provide a campaign title.');
      return;
    }
    if (!destinationUrl.trim()) {
      alert('Please provide a destination link.');
      return;
    }

    setIsGeneratingCheckout(true);

    try {
      const res = await authFetch('/api/campaigns/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advertiser_id: user?.id,
          advertiser_email: user?.email || profile?.email || 'advertiser@adision.co',
          advertiser_name: profile?.full_name || 'Advertiser',
          title,
          category,
          ad_copy: adCopy,
          media_url: mediaUrl,
          destination_url: destinationUrl,
          cta_text: ctaText,
          package_name: selectedPackage.name,
          duration_days: selectedPackage.duration_days,
          budget_amount: calculatedBudget,
          billing_model: selectedPackage.billing_model,
          target_quantity: targetQuantity,
          unit_price: selectedPackage.unit_price,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.status) {
        throw new Error(result.message || 'Failed to generate payment virtual account.');
      }

      setCheckoutData(result.data);
      setShowPaymentModal(true);
    } catch (err: any) {
      alert(err.message || 'Failed to initiate checkout. Please try again.');
    } finally {
      setIsGeneratingCheckout(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!checkoutData) return;
    setIsSimulatingPayment(true);

    try {
      const res = await authFetch('/api/campaigns/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: checkoutData.reference,
          amount: checkoutData.amount,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Payment simulation failed');
      }

      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPaymentModal(false);
        router.push('/advertiser');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Simulation error');
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-dark-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Step Progress Indicator */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create Ad Campaign</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Launch targeted broadcasts across verified WhatsApp groups.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === step
                    ? 'bg-brand-500 text-dark-900 ring-4 ring-brand-500/20'
                    : currentStep > step
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {currentStep > step ? '✓' : step}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Form Cards */}
        <div className="space-y-6">
          {/* STEP 1: CAMPAIGN DETAILS & TARGET */}
          {currentStep === 1 && (
            <Card className="p-6 sm:p-8 space-y-6 border-slate-800">
              <CardHeader className="p-0 mb-4">
                <div className="inline-flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Megaphone className="w-4 h-4" />
                  <span>Step 1: Campaign Details</span>
                </div>
                <CardTitle>What are you promoting?</CardTitle>
                <CardDescription>
                  Define your campaign objective and select the target audience category.
                </CardDescription>
              </CardHeader>

              <div className="space-y-4">
                <Input
                  label="Campaign Title / Brand Name"
                  placeholder="e.g. Acme Tech Campus Deal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Target Community Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CommunityCategory)}
                    className="w-full h-11 rounded-xl border border-slate-700/80 bg-slate-900 px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    {COMMUNITY_CATEGORIES_LIST.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label} — {cat.description}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Destination Link (Where Clicks Go)"
                  placeholder="https://yourwebsite.com/deal"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  helperText="Every click will be tracked via Adision with bot protection."
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => {
                    if (!title.trim()) return alert('Please enter a campaign title.');
                    if (!destinationUrl.trim()) return alert('Please enter a destination URL.');
                    setCurrentStep(2);
                  }}
                  className="font-bold gap-2"
                >
                  <span>Next: Compose Ad Copy</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: CREATIVE & AD COPY */}
          {currentStep === 2 && (
            <Card className="p-6 sm:p-8 space-y-6 border-slate-800">
              <CardHeader className="p-0 mb-4">
                <div className="inline-flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Step 2: WhatsApp Broadcast Creative</span>
                </div>
                <CardTitle>Compose Your WhatsApp Message</CardTitle>
                <CardDescription>
                  This is the exact broadcast message that community owners will share in their groups.
                </CardDescription>
              </CardHeader>

              <div className="space-y-4">
                <TextArea
                  label="Ad Copy (WhatsApp Broadcast Message)"
                  rows={6}
                  value={adCopy}
                  onChange={(e) => setAdCopy(e.target.value)}
                  helperText="Use emojis and line breaks to make your message attractive and readable on mobile."
                  required
                />

                <Input
                  label="Image / Banner URL (Optional)"
                  placeholder="https://yourdomain.com/ad-flyer.jpg"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  helperText="Direct image link that group admins will download and post with your text."
                />

                <Input
                  label="Call to Action Button Text"
                  placeholder="Claim 50% Off 🛍️"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-between">
                <Button size="md" variant="ghost" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button size="md" variant="primary" onClick={() => setCurrentStep(3)} className="font-bold gap-2">
                  <span>Select Outcome & Budget</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: OUTCOME-BASED PACKAGE & DEPOSIT */}
          {currentStep === 3 && (
            <Card className="p-6 sm:p-8 space-y-6 border-slate-800">
              <CardHeader className="p-0 mb-4">
                <div className="inline-flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Zap className="w-4 h-4" />
                  <span>Step 3: Outcome & Budget</span>
                </div>
                <CardTitle>Select What You Want To Achieve</CardTitle>
                <CardDescription>
                  Choose between Reach, New User Signups, or Paying Customers. Your funds are held safely until results are delivered.
                </CardDescription>
              </CardHeader>

              <div className="space-y-6">
                {/* 3 Outcome Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {CAMPAIGN_PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedPackageId === pkg.id
                          ? 'border-brand-500 bg-brand-500/10 shadow-lg'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-[11px] font-bold text-brand-400 mb-1">
                          {pkg.outcome_title}
                        </div>
                        <h4 className="font-black text-white text-base">{pkg.name}</h4>
                        <div className="mt-2 mb-3">
                          <span className="text-xl font-black text-white">
                            {pkg.billing_model === 'PER_SIGNUP'
                              ? '₦350'
                              : pkg.billing_model === 'PER_CUSTOMER'
                              ? '₦750'
                              : '₦5,750'}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {pkg.billing_model === 'PER_SIGNUP'
                              ? 'per qualified signup'
                              : pkg.billing_model === 'PER_CUSTOMER'
                              ? 'per paying customer'
                              : 'fixed campaign fee'}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
                        {pkg.outcome_description}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Target Quantity Customizer (for Corporate & Gold Salesman) */}
                {selectedPackage.billing_model === 'PER_SIGNUP' && (
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="text-xs font-bold text-white uppercase block">
                          Target Number of Qualified Signups
                        </label>
                        <span className="text-[11px] text-slate-400">
                          ₦350 per verified signup attributed to your campaign
                        </span>
                      </div>
                      <span className="text-2xl font-black text-brand-400">{targetQuantity} Signups</span>
                    </div>

                    <input
                      type="range"
                      min={20}
                      max={300}
                      step={10}
                      value={targetQuantity}
                      onChange={(e) => setTargetQuantity(Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                    />

                    <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                      <span>20 signups (₦7,000)</span>
                      <span>50 signups (₦17,500)</span>
                      <span>300 signups (₦105,000)</span>
                    </div>
                  </div>
                )}

                {selectedPackage.billing_model === 'PER_CUSTOMER' && (
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="text-xs font-bold text-white uppercase block">
                          Target Number of Paying Customers
                        </label>
                        <span className="text-[11px] text-slate-400">
                          ₦750 per customer completing signup + qualifying purchase/deposit
                        </span>
                      </div>
                      <span className="text-2xl font-black text-amber-400">{targetQuantity} Customers</span>
                    </div>

                    <input
                      type="range"
                      min={10}
                      max={150}
                      step={5}
                      value={targetQuantity}
                      onChange={(e) => setTargetQuantity(Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />

                    <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                      <span>10 customers (₦7,500)</span>
                      <span>20 customers (₦15,000)</span>
                      <span>150 customers (₦112,500)</span>
                    </div>
                  </div>
                )}

                {/* Summary & Deposit Calculation */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Campaign Goal:</span>
                    <span className="font-bold text-white">
                      {selectedPackage.name} ({selectedPackage.outcome_description})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Target Delivery:</span>
                    <span className="text-slate-200 font-semibold">
                      {selectedPackage.billing_model === 'FIXED'
                        ? '14 Days + 1 Bonus Day (15 Days Total)'
                        : selectedPackage.billing_model === 'PER_SIGNUP'
                        ? `${targetQuantity} Qualified Signups (@ ₦350 each)`
                        : `${targetQuantity} Paying Customers (@ ₦750 each)`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Placement Verification & Safe Payment Protection:</span>
                    <span className="text-brand-400 font-bold">Included (100% Guaranteed)</span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-black text-white">
                    <span>Upfront Campaign Deposit:</span>
                    <span className="text-2xl text-brand-400 font-black">
                      {formatCurrency(calculatedBudget)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    💡 Unused balance remains available in your account if the target is not reached.
                  </p>
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
                  isLoading={isGeneratingCheckout}
                  className="font-bold gap-2 shadow-lg shadow-brand-500/20"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Payment ({formatCurrency(calculatedBudget)})</span>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* POCKETFI PAYMENT MODAL */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Fund Campaign Deposit (PocketFi)"
        description="Transfer to the dedicated account or pay with card. Your funds are held safely until delivered."
        maxWidth="md"
      >
        <div className="space-y-6">
          {paymentSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-black text-white">Payment Confirmed!</h4>
              <p className="text-xs text-slate-300">
                Your deposit of {formatCurrency(checkoutData?.amount || calculatedBudget)} has been received and is safely held in your campaign balance.
              </p>
              <p className="text-xs text-brand-400 font-semibold">
                Going to your campaign dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* Payment Amount Card */}
              <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Deposit Amount Due:</span>
                  <div className="text-2xl font-black text-brand-400">
                    {formatCurrency(checkoutData?.amount || calculatedBudget)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-400">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              {/* PocketFi Virtual Bank Account Details */}
              <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Bank Name:</span>
                  <span className="font-bold text-white">
                    {checkoutData?.virtual_account.bank_name || 'Kuda Bank / PocketFi'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-slate-900">
                  <span className="text-slate-400">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-brand-400">
                      {checkoutData?.virtual_account.account_number || 'Generating...'}
                    </span>
                    <button
                      onClick={() => {
                        const acc = checkoutData?.virtual_account.account_number;
                        if (acc) {
                          navigator.clipboard?.writeText(acc);
                          setPaymentCopied(true);
                          setTimeout(() => setPaymentCopied(false), 2000);
                        }
                      }}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Copy Account Number"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-slate-900">
                  <span className="text-slate-400">Account Name:</span>
                  <span className="font-bold text-white">
                    {checkoutData?.virtual_account.account_name || `ADISION / ${title.slice(0, 14)}`}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-slate-900">
                  <span className="text-slate-400">Payment Reference:</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {checkoutData?.reference || 'Pending'}
                  </span>
                </div>
              </div>

              {paymentCopied && (
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs text-center font-semibold">
                  Account Number copied to clipboard!
                </div>
              )}

              {/* Online Checkout Link (if available) */}
              {checkoutData?.payment_link && (
                <a
                  href={checkoutData.payment_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    type="button"
                    size="md"
                    variant="outline"
                    className="w-full text-xs font-bold gap-2 text-brand-400 border-brand-500/30 hover:bg-brand-500/10"
                  >
                    <span>Pay with Debit Card / Web Checkout</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
              )}

              {/* Sandbox Test Simulator & Transfer Actions */}
              <div className="space-y-3 pt-2">
                <Button
                  size="md"
                  variant="primary"
                  onClick={handleSimulatePayment}
                  isLoading={isSimulatingPayment}
                  className="w-full font-bold shadow-lg shadow-brand-500/20 gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Simulate Transfer (Test Sandbox Mode)</span>
                </Button>

                <p className="text-[11px] text-center text-slate-400 leading-relaxed">
                  💡 <strong>Test Mode:</strong> Click the button above to test paying for this campaign safely without spending real money.
                </p>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
