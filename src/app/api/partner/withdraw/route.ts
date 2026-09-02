import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const MINIMUM_WITHDRAWAL_NGN = 2000;

/**
 * Partner Wallet Withdrawal Request Handler
 * Endpoint: POST /api/partner/withdraw
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, amount, bank_name, account_number, account_name } = body;

    // 1. Validation
    if (!user_id || !amount || !bank_name || !account_number || !account_name) {
      return NextResponse.json(
        { status: false, message: 'All bank details and withdrawal amount are required.' },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    if (numericAmount < MINIMUM_WITHDRAWAL_NGN) {
      return NextResponse.json(
        { status: false, message: `Minimum withdrawal amount is ₦${MINIMUM_WITHDRAWAL_NGN.toLocaleString()}.` },
        { status: 400 }
      );
    }

    // 2. Atomic Database Execution via Stored Procedure
    if (isSupabaseAdminConfigured()) {
      const { data, error } = await supabaseAdmin.rpc('request_partner_withdrawal', {
        p_user_id: user_id,
        p_amount: numericAmount,
        p_bank_name: bank_name,
        p_account_number: account_number,
        p_account_name: account_name,
      });

      if (error) {
        console.error('[Withdrawal DB Error]:', error);
        return NextResponse.json(
          { status: false, message: error.message || 'Withdrawal request failed due to insufficient funds.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        status: true,
        message: 'Withdrawal request submitted successfully. Payout will process within 24 hours.',
        data,
      });
    }

    // 3. Fallback for Local / Sandbox Simulation
    return NextResponse.json({
      status: true,
      message: 'Withdrawal request recorded (simulation mode).',
      data: {
        withdrawal_id: `wth_${Date.now()}`,
        amount: numericAmount,
        bank_name,
        account_number,
        status: 'REQUESTED',
      },
    });
  } catch (error: any) {
    console.error('[Withdrawal Handler Exception]:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Internal error processing withdrawal request' },
      { status: 500 }
    );
  }
}
