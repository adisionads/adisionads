import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server-auth';

export const runtime = 'nodejs';

/**
 * Admin Withdrawals Management API
 * GET: List all withdrawal requests
 * POST: Approve (Mark Completed) or Reject (Refund to wallet)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ success: true, withdrawals: [] });
    }

    const { data: withdrawals, error } = await supabaseAdmin
      .from('withdrawal_requests')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, withdrawals });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const { withdrawal_id, action, notes } = await request.json();
    const admin_id = auth.user!.id;

    if (!withdrawal_id || !action) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal ID and action (APPROVE/REJECT) are required' },
        { status: 400 }
      );
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ success: true, message: `Withdrawal ${action} in simulation mode` });
    }

    // 1. Fetch withdrawal record
    const { data: withdrawal, error: fetchErr } = await supabaseAdmin
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawal_id)
      .single();

    if (fetchErr || !withdrawal) {
      return NextResponse.json({ success: false, error: 'Withdrawal request not found' }, { status: 404 });
    }

    if (withdrawal.status === 'COMPLETED' || withdrawal.status === 'REJECTED') {
      return NextResponse.json(
        { success: false, error: `Withdrawal already marked as ${withdrawal.status}` },
        { status: 400 }
      );
    }

    if (action === 'APPROVE') {
      // Mark as completed
      const { error: updateErr } = await supabaseAdmin
        .from('withdrawal_requests')
        .update({
          status: 'COMPLETED',
          processed_at: new Date().toISOString(),
          processed_by: admin_id || null,
          notes: notes || 'Bank transfer completed successfully',
        })
        .eq('id', withdrawal_id);

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Withdrawal marked as COMPLETED. Partner payout finalized.',
      });
    } else if (action === 'REJECT') {
      // Reject and refund the amount back to the partner's wallet
      const refundAmount = Number(withdrawal.amount);

      const { data: wallet, error: walletErr } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('id', withdrawal.wallet_id)
        .single();

      if (walletErr || !wallet) {
        return NextResponse.json({ success: false, error: 'Wallet not found for refund' }, { status: 404 });
      }

      const newBalance = Number(wallet.available_balance) + refundAmount;

      // Update wallet
      await supabaseAdmin
        .from('wallets')
        .update({
          available_balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id);

      // Record refund in ledger
      await supabaseAdmin
        .from('ledger_transactions')
        .insert({
          wallet_id: wallet.id,
          user_id: withdrawal.user_id,
          transaction_type: 'REFUND',
          amount: refundAmount,
          direction: 'CREDIT',
          balance_after: newBalance,
          reference_id: withdrawal.id,
          reference_type: 'WITHDRAWAL_REFUND',
          description: `Refund for rejected withdrawal: ${notes || 'Bank account details invalid'}`,
          status: 'COMPLETED',
        });

      // Update withdrawal request
      await supabaseAdmin
        .from('withdrawal_requests')
        .update({
          status: 'REJECTED',
          processed_at: new Date().toISOString(),
          processed_by: admin_id || null,
          notes: notes || 'Rejected and refunded to wallet',
        })
        .eq('id', withdrawal_id);

      return NextResponse.json({
        success: true,
        message: 'Withdrawal REJECTED and funds refunded back to partner wallet.',
        refunded_amount: refundAmount,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
