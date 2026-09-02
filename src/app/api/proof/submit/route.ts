import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/**
 * Proof of Placement Submission Handler
 * Endpoint: POST /api/proof/submit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      assignment_id,
      community_id,
      submitted_by,
      proof_image_url,
      placement_timestamp,
      notes,
    } = body;

    if (!assignment_id || !proof_image_url) {
      return NextResponse.json(
        { status: false, message: 'Assignment ID and Proof image are required.' },
        { status: 400 }
      );
    }

    if (isSupabaseAdminConfigured()) {
      // 1. Insert Proof Record
      const { data: proof, error: proofErr } = await supabaseAdmin
        .from('proof_records')
        .insert({
          assignment_id,
          community_id,
          submitted_by,
          proof_image_url,
          placement_timestamp: placement_timestamp || new Date().toISOString(),
          notes: notes || null,
          status: 'PENDING',
        })
        .select('id')
        .single();

      if (proofErr) {
        console.error('[Proof Submission DB Error]:', proofErr);
        return NextResponse.json(
          { status: false, message: proofErr.message },
          { status: 500 }
        );
      }

      // 2. Update Assignment status
      await supabaseAdmin
        .from('campaign_assignments')
        .update({
          status: 'PROOF_SUBMITTED',
          published_at: placement_timestamp || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', assignment_id);

      return NextResponse.json({
        status: true,
        message: 'Placement proof submitted for admin verification.',
        proof_id: proof?.id,
      });
    }

    // Sandbox / Simulation fallback
    return NextResponse.json({
      status: true,
      message: 'Placement proof submitted successfully (simulation mode).',
      proof_id: `prf_${Date.now()}`,
    });
  } catch (error: any) {
    console.error('[Proof Submission Exception]:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to submit placement proof' },
      { status: 500 }
    );
  }
}
