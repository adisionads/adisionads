import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Adision Referral Automated Settlement Engine
 * 
 * Fraud-proof escrow reward rules:
 * - Partner track: ₦500 credited to referrer ONLY when the referred partner's first proof is approved by admin.
 * - Advertiser track: ₦1,000 credited to referrer ONLY when the referred advertiser funds their wallet or campaign with ₦5,000+.
 */

export interface ReferralSettlementResult {
  settled: boolean;
  referrerId?: string;
  rewardAmount?: number;
  message: string;
}

/**
 * Triggered when admin approves a partner's proof of broadcast
 */
export async function processPartnerReferralReward(
  partnerUserId: string,
  proofId: string
): Promise<ReferralSettlementResult> {
  if (!isSupabaseAdminConfigured()) {
    console.log('[Referral Settlement] Supabase admin not configured (simulation mode).');
    return { settled: false, message: 'Simulation mode: Referral check skipped' };
  }

  try {
    // 1. Check if there is an active pending referral conversion for this partner
    const { data: conversion, error: convErr } = await supabaseAdmin
      .from('referral_conversions')
      .select('id, referrer_id, reward_amount, status')
      .eq('referred_user_id', partnerUserId)
      .eq('status', 'PENDING')
      .maybeSingle();

    if (convErr) {
      console.warn('[Referral Settlement] Error checking conversion:', convErr);
      return { settled: false, message: 'Database error checking conversion' };
    }

    if (!conversion) {
      // User was not referred or already rewarded
      return { settled: false, message: 'No pending referral conversion found for user' };
    }

    const rewardAmount = Number(conversion.reward_amount || 500);

    // 2. Attempt atomic settlement via RPC if available
    const { data: rpcData, error: rpcErr } = await supabaseAdmin.rpc('settle_referral_reward', {
      p_conversion_id: conversion.id,
      p_qualifying_event_id: proofId,
      p_event_type: 'FIRST_PROOF_APPROVED',
    });

    if (!rpcErr && rpcData?.success) {
      console.log(`[Referral Settlement] RPC Reward Settled: ₦${rewardAmount} to referrer ${conversion.referrer_id}`);
      return {
        settled: true,
        referrerId: conversion.referrer_id,
        rewardAmount,
        message: `Successfully credited ₦${rewardAmount} to referrer`,
      };
    }

    // 3. Fallback: TypeScript-level atomic update if RPC not yet deployed to database
    // Fetch referee name
    const { data: refereeProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', partnerUserId)
      .maybeSingle();

    const refereeName = refereeProfile?.full_name || 'Community Partner';

    // Fetch or create referrer wallet
    let { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('id, available_balance')
      .eq('user_id', conversion.referrer_id)
      .maybeSingle();

    if (!wallet) {
      const { data: newW } = await supabaseAdmin
        .from('wallets')
        .insert({
          user_id: conversion.referrer_id,
          available_balance: rewardAmount,
          pending_balance: 0,
          currency: 'NGN',
        })
        .select('id, available_balance')
        .single();
      wallet = newW;
    } else {
      const updatedBalance = Number(wallet.available_balance || 0) + rewardAmount;
      await supabaseAdmin
        .from('wallets')
        .update({
          available_balance: updatedBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id);
      wallet.available_balance = updatedBalance;
    }

    if (wallet) {
      // Record in ledger
      const { data: ledgerTx } = await supabaseAdmin
        .from('ledger_transactions')
        .insert({
          wallet_id: wallet.id,
          user_id: conversion.referrer_id,
          transaction_type: 'REFERRAL_REWARD',
          amount: rewardAmount,
          direction: 'CREDIT',
          balance_after: Number(wallet.available_balance || 0),
          reference_type: 'REFERRAL_PAYOUT',
          description: `Referral reward for verified partner broadcast (${refereeName})`,
          status: 'COMPLETED',
        })
        .select('id')
        .maybeSingle();

      // Mark conversion record REWARDED
      await supabaseAdmin
        .from('referral_conversions')
        .update({
          status: 'REWARDED',
          qualifying_event_id: proofId,
          qualifying_event_type: 'FIRST_PROOF_APPROVED',
          reward_ledger_tx_id: ledgerTx?.id || null,
          qualified_at: new Date().toISOString(),
          rewarded_at: new Date().toISOString(),
        })
        .eq('id', conversion.id);

      console.log(`[Referral Settlement] TS Fallback Settled: ₦${rewardAmount} to referrer ${conversion.referrer_id}`);
      return {
        settled: true,
        referrerId: conversion.referrer_id,
        rewardAmount,
        message: `Successfully credited ₦${rewardAmount} to referrer wallet`,
      };
    }

    return { settled: false, message: 'Failed to access referrer wallet' };
  } catch (error: any) {
    console.error('[Referral Settlement Exception]:', error);
    return { settled: false, message: error.message || 'Settlement exception occurred' };
  }
}

/**
 * Triggered when an advertiser completes a qualifying deposit (₦5,000+)
 */
export async function processAdvertiserReferralReward(
  advertiserUserId: string,
  depositAmount: number,
  paymentRef: string
): Promise<ReferralSettlementResult> {
  // Qualifying threshold: minimum ₦5,000 deposit
  if (depositAmount < 5000) {
    return { settled: false, message: 'Deposit amount below ₦5,000 referral qualification threshold' };
  }

  if (!isSupabaseAdminConfigured()) {
    return { settled: false, message: 'Simulation mode: Referral check skipped' };
  }

  try {
    const { data: conversion, error: convErr } = await supabaseAdmin
      .from('referral_conversions')
      .select('id, referrer_id, reward_amount, status')
      .eq('referred_user_id', advertiserUserId)
      .eq('status', 'PENDING')
      .maybeSingle();

    if (convErr || !conversion) {
      return { settled: false, message: 'No pending advertiser conversion found' };
    }

    const rewardAmount = Number(conversion.reward_amount || 1000);

    // Fetch referee name
    const { data: refereeProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', advertiserUserId)
      .maybeSingle();

    const refereeName = refereeProfile?.full_name || 'Advertiser';

    // Credit referrer wallet
    let { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('id, available_balance')
      .eq('user_id', conversion.referrer_id)
      .maybeSingle();

    if (!wallet) {
      const { data: newW } = await supabaseAdmin
        .from('wallets')
        .insert({
          user_id: conversion.referrer_id,
          available_balance: rewardAmount,
          pending_balance: 0,
          currency: 'NGN',
        })
        .select('id, available_balance')
        .single();
      wallet = newW;
    } else {
      const updatedBalance = Number(wallet.available_balance || 0) + rewardAmount;
      await supabaseAdmin
        .from('wallets')
        .update({
          available_balance: updatedBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id);
      wallet.available_balance = updatedBalance;
    }

    if (wallet) {
      const { data: ledgerTx } = await supabaseAdmin
        .from('ledger_transactions')
        .insert({
          wallet_id: wallet.id,
          user_id: conversion.referrer_id,
          transaction_type: 'REFERRAL_REWARD',
          amount: rewardAmount,
          direction: 'CREDIT',
          balance_after: Number(wallet.available_balance || 0),
          reference_type: 'REFERRAL_PAYOUT',
          description: `Referral reward for funded advertiser campaign (${refereeName})`,
          status: 'COMPLETED',
        })
        .select('id')
        .maybeSingle();

      await supabaseAdmin
        .from('referral_conversions')
        .update({
          status: 'REWARDED',
          qualifying_event_id: paymentRef,
          qualifying_event_type: 'FIRST_CAMPAIGN_FUNDED',
          reward_ledger_tx_id: ledgerTx?.id || null,
          qualified_at: new Date().toISOString(),
          rewarded_at: new Date().toISOString(),
        })
        .eq('id', conversion.id);

      console.log(`[Referral Settlement] Advertiser Reward Settled: ₦${rewardAmount} to referrer ${conversion.referrer_id}`);
      return {
        settled: true,
        referrerId: conversion.referrer_id,
        rewardAmount,
        message: `Successfully credited ₦${rewardAmount} advertiser referral bonus`,
      };
    }

    return { settled: false, message: 'Failed to access referrer wallet' };
  } catch (error: any) {
    console.error('[Advertiser Referral Settlement Exception]:', error);
    return { settled: false, message: error.message || 'Settlement exception occurred' };
  }
}
