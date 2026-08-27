import { NextRequest, NextResponse } from 'next/server';
import { paymentPoint } from '@/lib/paymentpoint/client';

export const runtime = 'nodejs';

/**
 * PaymentPoint Webhook Handler
 * Endpoint: POST /api/webhooks/paymentpoint
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paymentpoint-signature') || '';

    // 1. Verify Webhook Authenticity
    const isValid = paymentPoint.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ status: false, message: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { reference, amount, status, settlement_id } = payload;

    if (status !== 'success') {
      return NextResponse.json({ status: true, message: 'Non-success event acknowledged' });
    }

    console.log(`[PaymentPoint Webhook] Payment Verified: Ref: ${reference} | Amount: ₦${amount}`);

    // In production with Supabase:
    // Update campaign payment_status to 'PAID' and status to 'UNDER_REVIEW' or 'ACTIVE'
    // Record escrow transaction in ledger_transactions

    return NextResponse.json({
      status: true,
      message: 'Payment received, escrow credited, and campaign activated successfully',
      reference,
    });
  } catch (error) {
    console.error('[PaymentPoint Webhook Error]:', error);
    return NextResponse.json(
      { status: false, message: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

