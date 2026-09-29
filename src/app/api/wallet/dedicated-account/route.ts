import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server-auth';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { getOrCreateDedicatedVirtualAccount } from '@/lib/virtual-accounts/service';

export const runtime = 'nodejs';

/**
 * Get or Provision Dedicated Virtual Bank Account
 * Endpoint: GET /api/wallet/dedicated-account
 * Security: Requires authenticated user session
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    // Rate limit: 20 requests per minute per IP
    const rateCheck = checkRateLimit(request, 20, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { status: false, message: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const userId = auth.user!.id;
    const result = await getOrCreateDedicatedVirtualAccount(userId);

    if (!result.success || !result.account) {
      return NextResponse.json(
        { status: false, message: result.message || 'Failed to retrieve dedicated bank account.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: true,
      data: result.account,
    });
  } catch (error: any) {
    console.error('[Dedicated Virtual Account Route Error]:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
