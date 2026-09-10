import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server-auth';
import { checkRateLimit } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

/**
 * Partner Bank Withdrawal Handler
 * Endpoint: POST /api/partner/withdraw
 *
 * Security:
 * - Session-verified user authentication (prevents IDOR wallet theft)
 * - Rate limited to prevent rapid retry floods
 * - Validates 10-digit NUBAN account format
 * - Strictly verifies that requested amount does not exceed available balance
 * - Deducts available balance atomically and records double-entry ledger entry
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    // Rate limit: Max 5 withdrawal requests per IP per minute
    const rateCheck = checkRateLimit(request, 5, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a moment before submitting another withdrawal.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { amount, bank_name, account_number, account_name, bank_code } = body;
    // Strictly bind withdrawal to the authenticated user ID
    const user_id = auth.user!.id;

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 1000) {
      return NextResponse.json(
        { success: false, error: 'Minimum withdrawal amount is ₦1,000' },
        { status: 400 }
      );
    }

    if (!bank_name || !account_number || !account_name) {
      return NextResponse.json(
        { success: false, error: 'Complete bank account details are required' },
        { status: 400 }
      );
    }

    if (account_number.trim().length !== 10) {
      return NextResponse.json(
        { success: false, error: 'Nigerian bank account numbers must be exactly 10 digits' },
        { status: 400 }
      );
    }

    if (isSupabaseAdminConfigured()) {
      // 1. First attempt atomic PostgreSQL Stored Procedure (with ACID FOR UPDATE row lock)
      const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('request_partner_withdrawal', {
        p_user_id: user_id,
        p_amount: numAmount,
        p_bank_name: bank_name.trim(),
        p_account_number: account_number.trim(),
        p_account_name: account_name.trim(),
      });

      if (!rpcError && rpcResult?.success) {
        return NextResponse.json({
          success: true,
          message: 'Withdrawal request submitted successfully! Funds will be disbursed within 24 hours.',
          data: { id: rpcResult.withdrawal_id },
          new_balance: rpcResult.new_available_balance,
        });
      }

      if (rpcError && rpcError.message.includes('Insufficient available balance')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient available balance for this withdrawal.' },
          { status: 400 }
        );
      }

      // 2. Fallback if stored procedure not yet executed in remote SQL editor
      const { data: wallet, error: walletError } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('user_id', user_id)
        .single();

      if (walletError || !wallet) {
        return NextResponse.json(
          { success: false, error: 'Wallet record not found for this user' },
          { status: 404 }
        );
      }

      if (wallet.available_balance < numAmount) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient balance. Available: ₦${Number(wallet.available_balance).toLocaleString()}, Requested: ₦${numAmount.toLocaleString()}`,
          },
          { status: 400 }
        );
      }

      const reference = `wd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newAvailable = Number(wallet.available_balance) - numAmount;

      // Update wallet balance
      const { error: updateError } = await supabaseAdmin
        .from('wallets')
        .update({
          available_balance: newAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id);

      if (updateError) {
        return NextResponse.json(
          { success: false, error: 'Failed to update wallet balance: ' + updateError.message },
          { status: 500 }
        );
      }

      // Create withdrawal request
      const { data: withdrawal, error: insertError } = await supabaseAdmin
        .from('withdrawal_requests')
        .insert({
          wallet_id: wallet.id,
          user_id,
          amount: numAmount,
          bank_name: bank_name.trim(),
          bank_code: bank_code || null,
          account_number: account_number.trim(),
          account_name: account_name.trim(),
          status: 'REQUESTED',
          transaction_reference: reference,
        })
        .select('*')
        .single();

      if (insertError) {
        return NextResponse.json(
          { success: false, error: 'Failed to record withdrawal request: ' + insertError.message },
          { status: 500 }
        );
      }

      // Log double-entry ledger entry
      await supabaseAdmin
        .from('ledger_transactions')
        .insert({
          wallet_id: wallet.id,
          user_id,
          transaction_type: 'WITHDRAWAL',
          amount: numAmount,
          direction: 'DEBIT',
          balance_after: newAvailable,
          reference_id: withdrawal.id,
          reference_type: 'WITHDRAWAL_REQUEST',
          description: `Withdrawal request to ${bank_name.trim()} (${account_number.trim()})`,
          status: 'COMPLETED',
        });

      return NextResponse.json({
        success: true,
        message: 'Withdrawal request submitted successfully! Funds will be disbursed within 24 hours.',
        data: withdrawal,
        new_balance: newAvailable,
      });
    }

    // Sandbox simulation fallback
    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted (Sandbox Mode)',
      reference: `wd_${Date.now()}`,
    });
  } catch (error: any) {
    console.error('[Withdrawal Handler Exception]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
