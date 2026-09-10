import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server-auth';
import { INITIAL_CAMPAIGNS, INITIAL_ASSIGNMENTS, INITIAL_PROOFS } from '@/lib/store/mock-data';

export const runtime = 'nodejs';

/**
 * Advertiser Campaign Detail & Attribution API
 * Endpoint: GET /api/advertiser/campaigns/[id]
 * Security: Requires ADVERTISER owning this campaign or ADMIN
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser(request, ['ADVERTISER']);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const { id: campaignId } = await params;
    if (!campaignId) {
      return NextResponse.json(
        { status: false, message: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const userId = auth.user!.id;
    const isAdmin = auth.role === 'ADMIN';

    if (isSupabaseAdminConfigured()) {
      // 1. Fetch Campaign
      const { data: campaign, error: campErr } = await supabaseAdmin
        .from('campaigns')
        .select(`
          id,
          advertiser_id,
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
          payment_reference,
          created_at,
          updated_at
        `)
        .eq('id', campaignId)
        .single();

      if (campErr || !campaign) {
        return NextResponse.json(
          { status: false, message: 'Campaign not found' },
          { status: 404 }
        );
      }

      // IDOR Protection: Verify caller is owner or platform admin
      if (!isAdmin && campaign.advertiser_id !== userId) {
        return NextResponse.json(
          { status: false, message: 'Unauthorized: You do not own this campaign.' },
          { status: 403 }
        );
      }

      // 2. Fetch Assignments for this campaign
      const { data: assignments, error: asgnErr } = await supabaseAdmin
        .from('campaign_assignments')
        .select(`
          id,
          tracking_code,
          payout_amount,
          status,
          accepted_at,
          published_at,
          completed_at,
          created_at,
          community:community_id (
            id,
            name,
            platform,
            member_count,
            category
          )
        `)
        .eq('campaign_id', campaignId);

      if (asgnErr) {
        console.error('[Campaign Detail Assignments Error]:', asgnErr);
      }

      // 3. Fetch tracking links for these assignments
      const assignmentIds = (assignments || []).map((a) => a.id);
      let trackingStatsMap: Record<string, { total_clicks: number; unique_clicks: number }> = {};
      let totalClicks = 0;
      let totalUniqueClicks = 0;

      if (assignmentIds.length > 0) {
        const { data: trackingLinks } = await supabaseAdmin
          .from('tracking_links')
          .select('assignment_id, total_clicks, unique_clicks')
          .in('assignment_id', assignmentIds);

        (trackingLinks || []).forEach((tl) => {
          trackingStatsMap[tl.assignment_id] = {
            total_clicks: tl.total_clicks || 0,
            unique_clicks: tl.unique_clicks || 0,
          };
          totalClicks += tl.total_clicks || 0;
          totalUniqueClicks += tl.unique_clicks || 0;
        });
      }

      const enrichedAssignments = (assignments || []).map((asgn) => {
        const stats = trackingStatsMap[asgn.id] || { total_clicks: 0, unique_clicks: 0 };
        return {
          ...asgn,
          total_clicks: stats.total_clicks,
          unique_clicks: stats.unique_clicks,
        };
      });

      // 4. Fetch Proof Records submitted for these assignments
      let proofs: any[] = [];
      if (assignmentIds.length > 0) {
        const { data: proofData } = await supabaseAdmin
          .from('proof_records')
          .select(`
            id,
            assignment_id,
            community_id,
            proof_image_url,
            placement_timestamp,
            notes,
            status,
            submitted_at,
            community:community_id (
              name
            )
          `)
          .in('assignment_id', assignmentIds)
          .order('submitted_at', { ascending: false });

        proofs = proofData || [];
      }

      const totalAudienceReach = enrichedAssignments.reduce(
        (acc, curr: any) => acc + (curr.community?.member_count || 0),
        0
      );

      const calculatedCtr =
        totalAudienceReach > 0
          ? ((totalClicks / totalAudienceReach) * 100).toFixed(2)
          : '0.00';

      return NextResponse.json({
        status: true,
        data: {
          campaign: {
            ...campaign,
            total_clicks: totalClicks,
            unique_clicks: totalUniqueClicks,
            ctr: calculatedCtr,
            assigned_count: enrichedAssignments.length,
          },
          assignments: enrichedAssignments,
          proofs,
          audience_reach: totalAudienceReach,
        },
      });
    }

    // Sandbox / Simulation fallback
    const fallbackCampaign = INITIAL_CAMPAIGNS.find((c) => c.id === campaignId) || INITIAL_CAMPAIGNS[0];
    const fallbackAssignments = INITIAL_ASSIGNMENTS.filter((a) => a.campaign_id === fallbackCampaign.id);
    const fallbackProofs = INITIAL_PROOFS.filter((p) => p.assignment?.campaign_id === fallbackCampaign.id);

    return NextResponse.json({
      status: true,
      data: {
        campaign: fallbackCampaign,
        assignments: fallbackAssignments,
        proofs: fallbackProofs,
        audience_reach: 4900,
      },
    });
  } catch (error: any) {
    console.error('[Campaign Detail Exception]:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch campaign details' },
      { status: 500 }
    );
  }
}
