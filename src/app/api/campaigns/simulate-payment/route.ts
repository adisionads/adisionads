import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server-auth';

export const runtime = 'nodejs';

/**
 * Safe Sandbox Payment Simulator
 * Allows founder and authorized admins to test campaign activation safely.
 * Strictly blocked for unauthenticated public requests in production to prevent payment fraud.
 */
export async function POST(request: NextRequest) {
  try {
    // In production, strictly require administrator privileges to simulate payments
    if (process.env.NODE_ENV === 'production') {
      const auth = await requireAdmin(request);
      if (!auth.authorized) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Payment simulation is disabled in production.' },
          { status: 403 }
        );
      }
    }

    const { reference, amount } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    if (isSupabaseAdminConfigured()) {
      const { data, error } = await supabaseAdmin.rpc('process_campaign_payment', {
        p_payment_reference: reference,
        p_amount: Number(amount || 0),
      });

      if (error) {
        console.error('[Simulate Payment DB Error]:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Payment simulated and campaign activated safely!',
        data,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment simulated in sandbox mode.',
      reference,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Simulation error' },
      { status: 500 }
    );
  }
}
