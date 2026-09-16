import { NextRequest, NextResponse } from 'next/server';
import { pocketFi } from '@/lib/pocketfi/client';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server-auth';

export const runtime = 'nodejs';

/**
 * Server-Side Payment Status Confirmation
 * Endpoint: POST /api/campaigns/confirm-payment
 *
 * Implements PocketFi's recommended server-side checkout confirmation:
 * When an advertiser returns from the hosted checkout redirect with a payment_id,
 * this endpoint calls PocketFi's /api/v1/checkout/confirm to verify the transaction
 * server-to-server before activating the campaign in Supabase.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request, ['ADVERTISER', 'ADMIN']);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const { paymentId, reference } = body;

    if (!paymentId && !reference) {
      return NextResponse.json(
        { success: false, message: 'Either paymentId or reference is required' },
        { status: 400 }
      );
    }

    // 1. If paymentId is present, verify directly against PocketFi API
    let isConfirmed = false;
    let verifiedAmount: number | undefined;

    if (paymentId) {
      const confirmResult = await pocketFi.confirmCheckout(paymentId);
      if (confirmResult.success) {
        isConfirmed = true;
        verifiedAmount = confirmResult.amount;
      }
    }

    // 2. If verified and Supabase is configured, process the payment atomically
    if (isConfirmed && reference && isSupabaseAdminConfigured()) {
      const { data, error } = await supabaseAdmin.rpc('process_campaign_payment', {
        p_payment_reference: reference,
        p_amount: verifiedAmount || 0,
      });

      if (error) {
        console.error('[Confirm Payment DB Error]:', error);
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed and campaign activated!',
        status: 'PAID',
        data,
      });
    }

    // 3. If checking existing campaign status in database
    if (reference && isSupabaseAdminConfigured()) {
      const { data: campaign } = await supabaseAdmin
        .from('campaigns')
        .select('id, status, payment_status, budget_amount')
        .eq('payment_reference', reference)
        .single();

      if (campaign && campaign.payment_status === 'PAID') {
        return NextResponse.json({
          success: true,
          message: 'Campaign payment already verified',
          status: campaign.payment_status,
          campaign,
        });
      }
    }

    return NextResponse.json({
      success: isConfirmed,
      status: isConfirmed ? 'PAID' : 'PENDING',
      message: isConfirmed ? 'Payment verified successfully' : 'Payment pending confirmation',
    });
  } catch (error: any) {
    console.error('[Confirm Payment Exception]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal payment confirmation error' },
      { status: 500 }
    );
  }
}
