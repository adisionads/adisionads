import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server-auth';

export const runtime = 'nodejs';

/**
 * Accept Campaign Assignment API
 * Endpoint: POST /api/partner/assignments/[id]/accept
 * Security: Requires COMMUNITY_PARTNER owning the target community or ADMIN
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser(request, ['COMMUNITY_PARTNER']);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const { id: assignmentId } = await params;
    if (!assignmentId) {
      return NextResponse.json(
        { status: false, message: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    const userId = auth.user!.id;
    const isAdmin = auth.user?.role === 'ADMIN';

    if (isSupabaseAdminConfigured()) {
      // 1. Fetch assignment and joined community to verify ownership
      const { data: assignment, error: fetchErr } = await supabaseAdmin
        .from('campaign_assignments')
        .select(`
          id,
          status,
          community:community_id (
            id,
            owner_id
          )
        `)
        .eq('id', assignmentId)
        .single();

      if (fetchErr || !assignment) {
        return NextResponse.json(
          { status: false, message: 'Assignment not found' },
          { status: 404 }
        );
      }

      // 2. IDOR check
      const communityOwnerId = (assignment.community as any)?.owner_id;
      if (!isAdmin && communityOwnerId !== userId) {
        return NextResponse.json(
          { status: false, message: 'Unauthorized: You do not own this community.' },
          { status: 403 }
        );
      }

      // 3. Update status to ACCEPTED
      const { error: updateErr } = await supabaseAdmin
        .from('campaign_assignments')
        .update({
          status: 'ACCEPTED',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', assignmentId);

      if (updateErr) {
        console.error('[Accept Assignment DB Error]:', updateErr);
        return NextResponse.json(
          { status: false, message: updateErr.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: true,
        message: 'Assignment accepted successfully! You can now broadcast the ad.',
      });
    }

    // Sandbox / Simulation fallback
    return NextResponse.json({
      status: true,
      message: 'Assignment accepted (simulation mode).',
    });
  } catch (error: any) {
    console.error('[Accept Assignment Exception]:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to accept assignment' },
      { status: 500 }
    );
  }
}
