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

    let effectiveReference = reference;
    let isConfirmed = false;
    let verifiedAmount: number | undefined;

    if (paymentId) {
      const confirmResult = await pocketFi.confirmCheckout(paymentId);
      if (confirmResult.success) {
        isConfirmed = true;
        verifiedAmount = confirmResult.amount;
        if (!effectiveReference && confirmResult.reference) {
          effectiveReference = confirmResult.reference;
        }
      }
    }

    // 2. If reference is not provided, look it up in Supabase using paymentId
    if (isSupabaseAdminConfigured() && !effectiveReference && paymentId) {
      const { data: matchedCamp } = await supabaseAdmin
        .from('campaigns')
        .select('payment_reference')
        .filter('virtual_account_details->>payment_id', 'eq', paymentId)
        .maybeSingle();

      if (matchedCamp?.payment_reference) {
        effectiveReference = matchedCamp.payment_reference;
      } else {
        const { data: matchedContains } = await supabaseAdmin
          .from('campaigns')
          .select('payment_reference')
          .contains('virtual_account_details', { payment_id: paymentId })
          .maybeSingle();

        if (matchedContains?.payment_reference) {
          effectiveReference = matchedContains.payment_reference;
        }
      }
    }

    // 3. If verified and Supabase is configured, process the payment atomically
    if (isConfirmed && isSupabaseAdminConfigured()) {
      // Check if this reference matches an existing campaign
      let isCampaign = false;
      if (effectiveReference) {
        const { data: campCheck } = await supabaseAdmin
          .from('campaigns')
          .select('id')
          .eq('payment_reference', effectiveReference)
          .maybeSingle();
        if (campCheck) isCampaign = true;
      }

      if (isCampaign && effectiveReference) {
        const { data, error } = await supabaseAdmin.rpc('process_campaign_payment', {
          p_payment_reference: effectiveReference,
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

      // If not a campaign, it is a direct WALLET DEPOSIT! Credit user's wallet
      const userId = auth.user!.id;
      const depositAmount = Number(verifiedAmount || 0);

      if (depositAmount > 0) {
        let { data: wallet } = await supabaseAdmin
          .from('wallets')
          .select('id, available_balance')
          .eq('user_id', userId)
          .maybeSingle();

        if (!wallet) {
          const { data: newW } = await supabaseAdmin
            .from('wallets')
            .insert({ user_id: userId, available_balance: 0, pending_balance: 0, currency: 'NGN' })
            .select('id, available_balance')
            .single();
          wallet = newW;
        }

        if (wallet) {
          const paymentKey = paymentId || effectiveReference || 'PFI_DEPOSIT';
          // Idempotency check: prevent duplicate crediting
          const { data: existingLedger } = await supabaseAdmin
            .from('ledger_transactions')
            .select('id')
            .eq('wallet_id', wallet.id)
            .ilike('description', `%${paymentKey}%`)
            .eq('status', 'COMPLETED')
            .maybeSingle();

          if (existingLedger) {
            return NextResponse.json({
              success: true,
              message: 'Wallet deposit already credited.',
              status: 'PAID',
              type: 'WALLET_DEPOSIT',
              balance: Number(wallet.available_balance || 0),
            });
          }

          const newBal = Number(wallet.available_balance || 0) + depositAmount;
          await supabaseAdmin
            .from('wallets')
            .update({ available_balance: newBal, updated_at: new Date().toISOString() })
            .eq('id', wallet.id);

          await supabaseAdmin.from('ledger_transactions').insert({
            wallet_id: wallet.id,
            user_id: userId,
            transaction_type: 'DEPOSIT',
            amount: depositAmount,
            direction: 'CREDIT',
            balance_after: newBal,
            reference_type: 'POCKETFI_DEPOSIT',
            description: `Direct wallet deposit via PocketFi (${paymentKey})`,
            status: 'COMPLETED',
          });

          return NextResponse.json({
            success: true,
            message: `Wallet funded with ₦${depositAmount.toLocaleString()}!`,
            status: 'PAID',
            type: 'WALLET_DEPOSIT',
            balance: newBal,
          });
        }
      }
    }

    // 4. If checking existing campaign status in database
    if (effectiveReference && isSupabaseAdminConfigured()) {
      const { data: campaign } = await supabaseAdmin
        .from('campaigns')
        .select('id, status, payment_status, budget_amount')
        .eq('payment_reference', effectiveReference)
        .maybeSingle();

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

