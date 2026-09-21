import { NextRequest, NextResponse } from 'next/server';
import { pocketFi } from '@/lib/pocketfi/client';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server-auth';

export const runtime = 'nodejs';

/**
 * Sync & Reconcile Pending Wallet Deposits with PocketFi
 * Endpoint: POST /api/wallet/sync & GET /api/wallet/sync
 *
 * Automatically checks all pending deposits for the current user against PocketFi
 * and credits the wallet immediately if payment has cleared.
 */
async function syncWalletDeposits(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const userId = auth.user!.id;

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ success: true, balance: 0, synced_count: 0 });
    }

    // 1. Fetch User's Wallet
    let { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('id, available_balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (!wallet) {
      return NextResponse.json({ success: true, balance: 0, synced_count: 0 });
    }

    // 2. Query all PENDING wallet deposits for this user
    const { data: pendingTxs } = await supabaseAdmin
      .from('ledger_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .eq('reference_type', 'POCKETFI_DEPOSIT')
      .eq('status', 'PENDING');

    let currentBalance = Number(wallet.available_balance || 0);
    let creditedCount = 0;
    let totalCreditedAmount = 0;

    if (pendingTxs && pendingTxs.length > 0) {
      for (const tx of pendingTxs) {
        // Extract payment ID (e.g. "PFI|6010098637") from description
        const match = tx.description.match(/(PFI\|[a-zA-Z0-9_-]+)/);
        if (!match) continue;

        const paymentId = match[1];
        try {
          const confirmRes = await pocketFi.confirmCheckout(paymentId);
          if (confirmRes.success) {
            const depositAmount = Number(confirmRes.amount || tx.amount || 0);
            currentBalance += depositAmount;
            creditedCount++;
            totalCreditedAmount += depositAmount;

            // Mark transaction completed
            await supabaseAdmin
              .from('ledger_transactions')
              .update({
                status: 'COMPLETED',
                balance_after: currentBalance,
              })
              .eq('id', tx.id);
          }
        } catch (err) {
          console.warn(`[Wallet Sync Error for ${paymentId}]:`, err);
        }
      }

      // Update wallet balance if any transactions were confirmed
      if (creditedCount > 0) {
        await supabaseAdmin
          .from('wallets')
          .update({
            available_balance: currentBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', wallet.id);
      }
    }

    return NextResponse.json({
      success: true,
      balance: currentBalance,
      credited_count: creditedCount,
      credited_amount: totalCreditedAmount,
      message: creditedCount > 0
        ? `Reconciled ${creditedCount} deposit(s)! Added ₦${totalCreditedAmount.toLocaleString()} to your wallet.`
        : 'Wallet is up to date',
    });
  } catch (error: any) {
    console.error('[Wallet Sync Exception]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to sync wallet' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return syncWalletDeposits(request);
}

export async function GET(request: NextRequest) {
  return syncWalletDeposits(request);
}
