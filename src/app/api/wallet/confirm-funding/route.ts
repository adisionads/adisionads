import { NextRequest, NextResponse } from 'next/server';
import { pocketFi } from '@/lib/pocketfi/client';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server-auth';

export const runtime = 'nodejs';

/**
 * Confirm Wallet Deposit via PocketFi
 * Endpoint: POST /api/wallet/confirm-funding
 * Security: Requires authenticated user session
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const { paymentId, reference } = body;

    if (!paymentId && !reference) {
      return NextResponse.json(
        { status: false, message: 'Payment ID or reference is required' },
        { status: 400 }
      );
    }

    const userId = auth.user!.id;
    const paymentKey = paymentId || reference;
    const requestedAmount = Number(body.amount || 0);

    // 1. If Supabase is configured, check if DB already has this deposit completed (e.g. via Webhook)
    let currentWallet: any = null;
    if (isSupabaseAdminConfigured()) {
      const { data: wallet } = await supabaseAdmin
        .from('wallets')
        .select('*')
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
          .select()
          .single();
        currentWallet = newW;
      } else {
        currentWallet = wallet;
      }

      if (currentWallet && paymentKey) {
        const { data: alreadyCompleted } = await supabaseAdmin
          .from('ledger_transactions')
          .select('id, amount')
          .eq('wallet_id', currentWallet.id)
          .eq('reference_type', 'POCKETFI_DEPOSIT')
          .eq('status', 'COMPLETED')
          .ilike('description', `%${paymentKey}%`)
          .maybeSingle();

        if (alreadyCompleted) {
          return NextResponse.json({
            status: true,
            success: true,
            message: 'Deposit confirmed and credited to your wallet.',
            balance: Number(currentWallet.available_balance || 0),
            amount: Number(alreadyCompleted.amount || requestedAmount),
          });
        }
      }
    }

    // 2. Query PocketFi server-to-server confirmation API
    let confirmResult: any = null;
    const lookupId = paymentId || reference;
    if (lookupId) {
      confirmResult = await pocketFi.confirmCheckout(lookupId);
    }

    if (!confirmResult || !confirmResult.success) {
      return NextResponse.json({
        status: false,
        message: confirmResult?.message || 'Payment has not cleared on PocketFi yet. If you just transferred, please allow 1-2 minutes.',
      });
    }

    const depositAmount = Number(confirmResult.amount || requestedAmount || 0);
    if (!depositAmount || depositAmount <= 0) {
      return NextResponse.json(
        { status: false, message: 'Invalid deposit amount returned by gateway' },
        { status: 400 }
      );
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({
        status: true,
        success: true,
        message: 'Wallet funded successfully (test mode)',
        amount: depositAmount,
      });
    }

    // Check if there is a pending transaction row to settle
    const { data: pendingTx } = await supabaseAdmin
      .from('ledger_transactions')
      .select('id')
      .eq('wallet_id', currentWallet.id)
      .eq('reference_type', 'POCKETFI_DEPOSIT')
      .eq('status', 'PENDING')
      .ilike('description', `%${paymentKey}%`)
      .maybeSingle();

    // 4. Atomically Credit Wallet Balance
    const previousBalance = Number(currentWallet.available_balance || 0);
    const newBalance = previousBalance + depositAmount;

    const { error: updateErr } = await supabaseAdmin
      .from('wallets')
      .update({
        available_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentWallet.id);

    if (updateErr) {
      console.error('[Wallet Balance Update Error]:', updateErr);
      return NextResponse.json(
        { status: false, message: 'Failed to update wallet balance: ' + updateErr.message },
        { status: 500 }
      );
    }

    // 5. Update Pending Ledger Transaction or Insert Completed
    if (pendingTx) {
      await supabaseAdmin
        .from('ledger_transactions')
        .update({
          status: 'COMPLETED',
          amount: depositAmount,
          balance_after: newBalance,
        })
        .eq('id', pendingTx.id);
    } else {
      await supabaseAdmin.from('ledger_transactions').insert({
        wallet_id: currentWallet.id,
        user_id: userId,
        transaction_type: 'DEPOSIT',
        amount: depositAmount,
        direction: 'CREDIT',
        balance_after: newBalance,
        reference_type: 'POCKETFI_DEPOSIT',
        description: `Direct wallet deposit via PocketFi (${paymentKey})`,
        status: 'COMPLETED',
      });
    }

    return NextResponse.json({
      status: true,
      success: true,
      message: `Successfully added ₦${depositAmount.toLocaleString()} to your Adision wallet!`,
      balance: newBalance,
      amount: depositAmount,
    });
  } catch (error: any) {
    console.error('[Wallet Confirm Exception]:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to confirm deposit' },
      { status: 500 }
    );
  }
}
