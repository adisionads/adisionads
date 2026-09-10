import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server-auth';
import { INITIAL_PROOFS } from '@/lib/store/mock-data';

export const runtime = 'nodejs';

/**
 * Admin Proof Moderation Desk API
 * Endpoint: GET /api/admin/proofs
 * Security: Requires ADMIN role
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    if (isSupabaseAdminConfigured()) {
      const { data: proofs, error } = await supabaseAdmin
        .from('proof_records')
        .select(`
          id,
          assignment_id,
          community_id,
          proof_image_url,
          placement_timestamp,
          notes,
          status,
          review_feedback,
          submitted_at,
          reviewed_at,
          submitted_by_profile:submitted_by (
            id,
            full_name,
            phone,
            email
          ),
          community:community_id (
            id,
            name,
            platform,
            member_count,
            invite_link
          ),
          assignment:assignment_id (
            id,
            tracking_code,
            payout_amount,
            status,
            campaign:campaign_id (
              id,
              title,
              category,
              ad_copy,
              media_url,
              destination_url
            )
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('[Admin Proofs DB Error]:', error);
        return NextResponse.json({ status: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({
        status: true,
        data: proofs || [],
      });
    }

    // Sandbox / Mock fallback
    return NextResponse.json({
      status: true,
      data: INITIAL_PROOFS,
    });
  } catch (error: any) {
    console.error('[Admin Proofs Exception]:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to load proofs queue' },
      { status: 500 }
    );
  }
}
