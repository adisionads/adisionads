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
      '';

    // 1. Verify Webhook Signature Authenticity
    const isValid = pocketFi.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[PocketFi Webhook] Rejected: Invalid SHA-512 HMAC signature.');
      return NextResponse.json({ status: false, message: 'Invalid webhook signature' }, { status: 401 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ status: false, message: 'Invalid JSON payload' }, { status: 400 });
    }

    const reference = payload.reference || payload.data?.reference;
    const amount = Number(payload.amount || payload.data?.amount);
    const status = payload.status || payload.data?.status;

    // Acknowledge non-success events without error
    if (status !== 'success' && status !== 'successful') {
      return NextResponse.json({ status: true, message: 'Non-success event acknowledged' });
    }

    if (!reference || !amount) {
      return NextResponse.json(
        { status: false, message: 'Missing reference or amount in webhook payload' },
        { status: 400 }
      );
    }

    console.log(`[PocketFi Webhook] Verified Payment Event: Ref: ${reference} | Amount: ₦${amount}`);

    // 2. Production Settlement via Atomic Database Stored Procedure
    if (isSupabaseAdminConfigured()) {
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
