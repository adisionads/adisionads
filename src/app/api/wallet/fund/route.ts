import { NextRequest, NextResponse } from 'next/server';
import { pocketFi } from '@/lib/pocketfi/client';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server-auth';
import { checkRateLimit } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

/**
 * Direct Wallet Funding API (PocketFi)
 * Endpoint: POST /api/wallet/fund
 * Security: Requires authenticated user session
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    // Rate limit: Max 10 fund requests per minute
    const rateCheck = checkRateLimit(request, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { status: false, message: 'Too many deposit attempts. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const amount = Number(body.amount);

    if (!amount || isNaN(amount) || amount < 10) {
      return NextResponse.json(
        { status: false, message: 'Minimum deposit amount is ₦10' },
        { status: 400 }
      );
    }

    const userId = auth.user!.id;
    const userEmail = auth.user!.email || 'advertiser@adision.xyz';
    const userName = body.name || 'Adision Member';

    // 1. Generate unique deposit reference
    const reference = `wlt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 2. Request Virtual Account & Hosted Checkout from PocketFi
    const virtualAccount = await pocketFi.createVirtualAccount({
      amount,
      email: userEmail,
      name: userName,
      reference,
      bank: 'kuda',
    });

    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adision.xyz';
    const checkoutSession = await pocketFi.createCheckoutSession({
      amount,
      email: userEmail,
      name: userName,
      reference,
      redirectUrl: `${appBaseUrl}/advertiser`,
    });

    // 3. Ensure user has a wallet record and log pending transaction
    if (isSupabaseAdminConfigured()) {
      let { data: wallet } = await supabaseAdmin
        .from('wallets')
        .select('id, available_balance')
        .eq('user_id', userId)
        .maybeSingle();

      if (!wallet) {
        const { data: newW } = await supabaseAdmin
          .from('wallets')
          .insert({
            user_id: userId,
            available_balance: 0,
            pending_balance: 0,
            currency: 'NGN',
          })
          .select('id, available_balance')
          .single();
        wallet = newW;
      }

      if (wallet && checkoutSession.paymentId) {
        await supabaseAdmin.from('ledger_transactions').insert({
          wallet_id: wallet.id,
          user_id: userId,
          transaction_type: 'DEPOSIT',
          amount,
          direction: 'CREDIT',
          balance_after: Number(wallet.available_balance || 0),
          reference_type: 'POCKETFI_DEPOSIT',
          description: `PocketFi payment ID: ${checkoutSession.paymentId} | Ref: ${reference}`,
          status: 'PENDING',
        });
      }
    }

    return NextResponse.json({
      status: true,
      data: {
        reference,
        amount,
        payment_link: checkoutSession.paymentLink,
        payment_id: checkoutSession.paymentId,
        virtual_account: virtualAccount,
      },
    });
  } catch (error: any) {
    console.error('[Wallet Fund Error]:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to initiate wallet deposit' },
      { status: 500 }
    );
  }
}

