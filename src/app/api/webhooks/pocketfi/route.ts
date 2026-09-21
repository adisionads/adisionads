import { NextRequest, NextResponse } from 'next/server';
import { pocketFi } from '@/lib/pocketfi/client';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/**
 * PocketFi Webhook Handler
 * Endpoint: POST /api/webhooks/pocketfi
 *
 * Security:
 * - SHA-512 HMAC cryptographic signature verification
 * - Idempotency protection against duplicate gateway retries
 * - Atomic double-entry escrow ledger recording via PostgreSQL RPC
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get('x-pocketfi-signature') ||
      request.headers.get('pocketfi-signature') ||
      request.headers.get('x-signature') ||
      request.headers.get('signature') ||
      '';

    // 1. Verify Webhook Signature Authenticity
    const isValid = pocketFi.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[PocketFi Webhook] Rejected: Invalid or missing SHA-512 HMAC signature.');
      return NextResponse.json(
        { status: false, message: 'Invalid or missing webhook signature' },
        { status: 401 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ status: false, message: 'Invalid JSON payload' }, { status: 400 });
    }

    // Extract reference across possible PocketFi payload formats
    const reference =
      payload.reference ||
      payload.data?.reference ||
      payload.payment_reference ||
      payload.data?.payment_reference;

    // Extract amount
    const amount = Number(
      payload.amount ||
      payload.data?.amount ||
      payload.total_amount ||
      0
    );

    // Extract status/event
    const rawStatus = (
      payload.status ||
      payload.data?.status ||
      payload.event ||
      ''
    ).toLowerCase();

    const isSuccess =
      rawStatus === 'success' ||
      rawStatus === 'successful' ||
      rawStatus.includes('success') ||
      rawStatus.includes('credit') ||
      rawStatus.includes('paid') ||
      rawStatus.includes('completed');

    // Acknowledge non-success events without error to prevent continuous retries
    if (!isSuccess) {
      console.log(`[PocketFi Webhook] Non-success event received (${rawStatus}). Acknowledged.`);
      return NextResponse.json({ status: true, message: `Event acknowledged (${rawStatus})` });
    }

    if (!reference || !amount) {
      console.warn('[PocketFi Webhook] Missing reference or amount:', { reference, amount, payload });
      return NextResponse.json(
        { status: false, message: 'Missing reference or amount in webhook payload' },
        { status: 400 }
      );
    }

    console.log(`[PocketFi Webhook] Verified Payment Event: Ref: ${reference} | Amount: ₦${amount}`);

    // 2. Production Settlement
    if (isSupabaseAdminConfigured()) {
      // Branch A: Direct Wallet Funding
      if (reference.startsWith('wlt_')) {
        const paymentKey = payload.payment_id || reference;
        // Check idempotency: only ignore if ALREADY COMPLETED
        const { data: alreadyCompleted } = await supabaseAdmin
          .from('ledger_transactions')
          .select('id')
          .eq('reference_type', 'POCKETFI_DEPOSIT')
          .eq('status', 'COMPLETED')
          .ilike('description', `%${paymentKey}%`)
          .maybeSingle();

        if (alreadyCompleted) {
          return NextResponse.json({ status: true, message: 'Wallet deposit already credited' });
        }

        // Check for pending transaction created by /api/wallet/fund
        const { data: pendingTx } = await supabaseAdmin
          .from('ledger_transactions')
          .select('*')
          .eq('reference_type', 'POCKETFI_DEPOSIT')
          .eq('status', 'PENDING')
          .ilike('description', `%${paymentKey}%`)
          .maybeSingle();

        let walletId = pendingTx?.wallet_id;
        let targetUserId = pendingTx?.user_id;

        if (!walletId) {
          const email = payload.email || payload.data?.email || payload.customer_email;
          if (email) {
            const { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('email', email).maybeSingle();
            if (profile?.id) {
              targetUserId = profile.id;
            }
          }
          if (targetUserId) {
            const { data: w } = await supabaseAdmin.from('wallets').select('id').eq('user_id', targetUserId).maybeSingle();
            walletId = w?.id;
          }
        }

        if (walletId) {
          const { data: currentWallet } = await supabaseAdmin.from('wallets').select('available_balance').eq('id', walletId).single();
          const newBal = Number(currentWallet?.available_balance || 0) + amount;
          await supabaseAdmin.from('wallets').update({ available_balance: newBal, updated_at: new Date().toISOString() }).eq('id', walletId);

          if (pendingTx) {
            await supabaseAdmin.from('ledger_transactions').update({
              status: 'COMPLETED',
              amount,
              balance_after: newBal,
            }).eq('id', pendingTx.id);
          } else {
            await supabaseAdmin.from('ledger_transactions').insert({
              wallet_id: walletId,
              user_id: targetUserId,
              transaction_type: 'DEPOSIT',
              amount,
              direction: 'CREDIT',
              balance_after: newBal,
              reference_type: 'POCKETFI_DEPOSIT',
              description: `Direct wallet deposit via PocketFi (${paymentKey})`,
              status: 'COMPLETED',
            });
          }
        }

        return NextResponse.json({ status: true, message: 'Wallet deposit credited successfully' });
      }

      // Branch B: Campaign Escrow Payment
      const { data, error } = await supabaseAdmin.rpc('process_campaign_payment', {
        p_payment_reference: reference,
        p_amount: amount,
      });

      if (error) {
        console.error('[PocketFi Webhook DB Error]:', error);
        return NextResponse.json(
          { status: false, message: 'Database ledger processing failed', error: error.message },
          { status: 500 }
        );
      }

      console.log('[PocketFi Webhook Result]:', data);

      return NextResponse.json({
        status: true,
        message: data?.message || 'Payment settled and campaign activated',
        reference,
      });
    }

    // 3. Fallback for Local / Sandbox Simulation
    return NextResponse.json({
      status: true,
      message: 'Payment verified and processed in simulation mode',
      reference,
    });
  } catch (error: any) {
    console.error('[PocketFi Webhook Exception]:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Internal webhook processing exception' },
      { status: 500 }
    );
  }
}
