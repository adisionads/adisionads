import { NextRequest, NextResponse } from 'next/server';
import { paymentPoint } from '@/lib/paymentpoint/client';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/**
 * PaymentPoint Webhook Handler
 * Endpoint: POST /api/webhooks/paymentpoint
 *
 * Security:
 * - Cryptographic HMAC SHA-256 signature verification
 * - Idempotency protection against duplicate gateway retries
 * - Atomic double-entry escrow ledger recording via PostgreSQL RPC
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get('x-paymentpoint-signature') ||
      request.headers.get('paymentpoint-signature') ||
      '';

    // 1. Verify Webhook Authenticity
    const isValid = paymentPoint.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[PaymentPoint Webhook] Rejected: Invalid HMAC signature.');
      return NextResponse.json({ status: false, message: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { reference, amount, status } = payload;

    // Acknowledge non-success events without error
    if (status !== 'success') {
      return NextResponse.json({ status: true, message: 'Non-success event acknowledged' });
    }

    console.log(`[PaymentPoint Webhook] Verified Payment Event: Ref: ${reference} | Amount: ₦${amount}`);

    // 2. Production Settlement via Atomic Database Stored Procedure
    if (isSupabaseAdminConfigured()) {
      const { data, error } = await supabaseAdmin.rpc('process_campaign_payment', {
        p_payment_reference: reference,
        p_amount: Number(amount),
      });

      if (error) {
        console.error('[PaymentPoint Webhook DB Error]:', error);
        return NextResponse.json(
          { status: false, message: 'Database ledger processing failed', error: error.message },
          { status: 500 }
        );
      }

      console.log('[PaymentPoint Webhook Result]:', data);

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
  } catch (error) {
    console.error('[PaymentPoint Webhook Handler Exception]:', error);
    return NextResponse.json(
      { status: false, message: 'Internal webhook processing exception' },
      { status: 500 }
    );
  }
}
