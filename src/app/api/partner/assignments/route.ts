import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server-auth';
import { INITIAL_ASSIGNMENTS } from '@/lib/store/mock-data';

export const runtime = 'nodejs';

/**
 * Partner Assignments Feed API
 * Endpoint: GET /api/partner/assignments
 * Security: Requires authenticated COMMUNITY_PARTNER or ADMIN
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request, ['COMMUNITY_PARTNER']);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const userId = auth.user!.id;

    if (isSupabaseAdminConfigured()) {
      // 1. Fetch communities owned by this user
      const { data: userCommunities, error: commErr } = await supabaseAdmin
        .from('communities')
        .select('id')
        .eq('owner_id', userId);

      if (commErr) {
        console.error('[Partner Assignments Communities Error]:', commErr);
        return NextResponse.json({ status: false, message: commErr.message }, { status: 500 });
      }

      const communityIds = (userCommunities || []).map((c) => c.id);

      if (communityIds.length === 0) {
        return NextResponse.json({ status: true, data: [] });
      }

      // 2. Fetch assignments for these communities
      const { data: assignments, error: asgnErr } = await supabaseAdmin
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
        .in('community_id', communityIds)
        .order('created_at', { ascending: false });

      if (asgnErr) {
        console.error('[Partner Assignments DB Error]:', asgnErr);
        return NextResponse.json({ status: false, message: asgnErr.message }, { status: 500 });
      }

      // 3. Fetch any proof records submitted for these assignments
      const assignmentIds = (assignments || []).map((a) => a.id);
      let proofsByAssignment: Record<string, any> = {};

      if (assignmentIds.length > 0) {
        const { data: proofs } = await supabaseAdmin
          .from('proof_records')
          .select('id, assignment_id, proof_image_url, status, review_feedback, submitted_at')
          .in('assignment_id', assignmentIds);

        (proofs || []).forEach((p) => {
          proofsByAssignment[p.assignment_id] = p;
        });
      }

      const enrichedAssignments = (assignments || []).map((asgn) => ({
        ...asgn,
        proof: proofsByAssignment[asgn.id] || null,
      }));

      return NextResponse.json({
        status: true,
        data: enrichedAssignments,
      });
    }

    // Sandbox / Simulation fallback
    return NextResponse.json({
      status: true,
      data: INITIAL_ASSIGNMENTS,
    });
  } catch (error: any) {
    console.error('[Partner Assignments Exception]:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}
