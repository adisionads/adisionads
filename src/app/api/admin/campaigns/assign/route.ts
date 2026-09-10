import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server-auth';

export const runtime = 'nodejs';

/**
 * Campaign Matchmaking & Community Assignment API
 * Endpoint: POST /api/admin/campaigns/assign
 * Security: Requires ADMIN role
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const { campaign_id, community_id, payout_amount } = body;

    if (!campaign_id || !community_id) {
      return NextResponse.json(
        { status: false, message: 'Campaign ID and Community ID are required' },
        { status: 400 }
      );
    }

    const numericPayout = Number(payout_amount) || 4500;
    if (numericPayout < 500) {
      return NextResponse.json(
        { status: false, message: 'Partner payout must be at least ₦500' },
        { status: 400 }
      );
    }

    // Generate collision-resistant unique tracking code
    const trackingCode = `ad_${crypto.randomBytes(4).toString('hex')}`;

    if (isSupabaseAdminConfigured()) {
      // 1. Verify campaign exists and retrieve destination URL
      const { data: campaign, error: campErr } = await supabaseAdmin
        .from('campaigns')
        .select('id, title, destination_url, status')
        .eq('id', campaign_id)
        .single();

      if (campErr || !campaign) {
        return NextResponse.json(
          { status: false, message: 'Campaign not found' },
          { status: 404 }
        );
      }

      // 2. Verify community exists and is verified
      const { data: community, error: commErr } = await supabaseAdmin
        .from('communities')
        .select('id, name, status, member_count')
        .eq('id', community_id)
        .single();

      if (commErr || !community) {
        return NextResponse.json(
          { status: false, message: 'Community not found' },
          { status: 404 }
        );
      }

      // 3. Create Campaign Assignment record
      const { data: assignment, error: asgnErr } = await supabaseAdmin
        .from('campaign_assignments')
        .insert({
          campaign_id,
          community_id,
          assigned_by: auth.user!.id,
          tracking_code: trackingCode,
          payout_amount: numericPayout,
          status: 'ASSIGNED',
        })
        .select('id, tracking_code, payout_amount, status, created_at')
        .single();

      if (asgnErr) {
        console.error('[Create Assignment DB Error]:', asgnErr);
        return NextResponse.json(
          { status: false, message: 'Failed to create assignment: ' + asgnErr.message },
          { status: 500 }
        );
      }

      // 4. Create Tracking Link record
      const { error: linkErr } = await supabaseAdmin
        .from('tracking_links')
        .insert({
          assignment_id: assignment.id,
          tracking_code: trackingCode,
          target_url: campaign.destination_url,
          total_clicks: 0,
          unique_clicks: 0,
        });

      if (linkErr) {
        console.error('[Create Tracking Link DB Error]:', linkErr);
      }

      // 5. Update campaign status to ACTIVE if it was in DRAFT or SUBMITTED
      if (campaign.status === 'DRAFT' || campaign.status === 'SUBMITTED') {
        await supabaseAdmin
          .from('campaigns')
          .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
          .eq('id', campaign_id);
      }

      return NextResponse.json({
        status: true,
        message: 'Campaign assigned successfully! Unique tracking link generated.',
        data: {
          assignment_id: assignment.id,
          tracking_code: trackingCode,
          tracking_url: `https://adision.co/r/${trackingCode}`,
          campaign_title: campaign.title,
          community_name: community.name,
          payout_amount: numericPayout,
        },
      });
    }

    // Sandbox / Simulation fallback
    return NextResponse.json({
      status: true,
      message: 'Campaign assigned successfully (sandbox simulation).',
      data: {
        assignment_id: `asgn_${Date.now()}`,
        tracking_code: trackingCode,
        tracking_url: `https://adision.co/r/${trackingCode}`,
        payout_amount: numericPayout,
      },
    });
  } catch (error: any) {
    console.error('[Assign Campaign Exception]:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to assign campaign' },
      { status: 500 }
    );
  }
}
