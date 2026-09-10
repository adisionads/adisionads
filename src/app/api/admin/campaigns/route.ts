import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server-auth';
import { INITIAL_CAMPAIGNS, INITIAL_COMMUNITIES, INITIAL_ASSIGNMENTS } from '@/lib/store/mock-data';

export const runtime = 'nodejs';

/**
 * Admin Campaign Matchmaking & Distribution API
 * Endpoint: GET /api/admin/campaigns
 * Security: Requires ADMIN role
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    if (isSupabaseAdminConfigured()) {
      // 1. Fetch campaigns (both ACTIVE and SUBMITTED/PAID)
      const { data: campaigns, error: campError } = await supabaseAdmin
        .from('campaigns')
        .select(`
          id,
          title,
          category,
          ad_copy,
          media_url,
          destination_url,
          cta_text,
          package_name,
          duration_days,
          budget_amount,
          status,
          payment_status,
          created_at,
          advertiser:advertiser_id (
            id,
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (campError) {
        console.error('[Admin Campaigns DB Error]:', campError);
        return NextResponse.json({ status: false, message: campError.message }, { status: 500 });
      }

      // 2. Fetch verified community supply
      const { data: communities, error: commError } = await supabaseAdmin
        .from('communities')
        .select(`
          id,
          name,
          platform,
          category,
          invite_link,
          member_count,
          description,
          location,
          status,
          owner:owner_id (
            id,
            full_name,
            phone,
            email
          )
        `)
        .eq('status', 'VERIFIED')
        .order('member_count', { ascending: false });

      if (commError) {
        console.error('[Admin Communities DB Error]:', commError);
        return NextResponse.json({ status: false, message: commError.message }, { status: 500 });
      }

      // 3. Fetch active assignments with joined tracking links
      const { data: assignments, error: asgnError } = await supabaseAdmin
        .from('campaign_assignments')
        .select(`
          id,
          campaign_id,
          community_id,
          tracking_code,
          payout_amount,
          status,
          accepted_at,
          published_at,
          completed_at,
          created_at,
          campaign:campaign_id (
            id,
            title,
            category,
            ad_copy,
            media_url,
            destination_url,
            cta_text
          ),
          community:community_id (
            id,
            name,
            member_count,
            category,
            platform,
            invite_link
          )
        `)
        .order('created_at', { ascending: false });

      if (asgnError) {
        console.error('[Admin Assignments DB Error]:', asgnError);
        return NextResponse.json({ status: false, message: asgnError.message }, { status: 500 });
      }

      // 4. Fetch tracking link stats for all assignments
      const { data: trackingLinks } = await supabaseAdmin
        .from('tracking_links')
        .select('assignment_id, tracking_code, total_clicks, unique_clicks');

      const trackingMap = new Map<string, { total_clicks: number; unique_clicks: number }>();
      (trackingLinks || []).forEach((tl) => {
        if (tl.assignment_id) {
          trackingMap.set(tl.assignment_id, {
            total_clicks: tl.total_clicks || 0,
            unique_clicks: tl.unique_clicks || 0,
          });
        }
      });

      const enrichedAssignments = (assignments || []).map((asgn) => {
        const stats = trackingMap.get(asgn.id) || { total_clicks: 0, unique_clicks: 0 };
        return {
          ...asgn,
          total_clicks: stats.total_clicks,
          unique_clicks: stats.unique_clicks,
        };
      });

      return NextResponse.json({
        status: true,
        data: {
          campaigns: campaigns || [],
          communities: communities || [],
          assignments: enrichedAssignments,
        },
      });
    }

    // Sandbox / Mock fallback
    return NextResponse.json({
      status: true,
      data: {
        campaigns: INITIAL_CAMPAIGNS,
        communities: INITIAL_COMMUNITIES.filter((c) => c.status === 'VERIFIED'),
        assignments: INITIAL_ASSIGNMENTS,
      },
    });
  } catch (error: any) {
    console.error('[Admin Campaigns Exception]:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch admin campaign data' },
      { status: 500 }
    );
  }
}
