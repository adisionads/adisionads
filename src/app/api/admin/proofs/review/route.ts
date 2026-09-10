import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server-auth';

export const runtime = 'nodejs';

/**
 * Admin Proof Moderation Review API
 * Endpoint: POST /api/admin/proofs/review
 * Security: Requires ADMIN role
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const { proof_id, action, feedback } = body;

    if (!proof_id || !action) {
      return NextResponse.json(
        { status: false, message: 'Proof ID and action (APPROVE or REJECT) are required' },
        { status: 400 }
      );
    }

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return NextResponse.json(
        { status: false, message: 'Invalid action. Must be APPROVE or REJECT' },
        { status: 400 }
      );
    }

    const adminId = auth.user!.id;
    const reviewFeedback = feedback || (action === 'APPROVE' ? 'Screenshot verified and approved' : 'Placement verification rejected');

    if (isSupabaseAdminConfigured()) {
      if (action === 'APPROVE') {
        // Execute atomic double-entry wallet credit stored procedure
        const { data, error } = await supabaseAdmin.rpc('approve_proof_and_credit_partner', {
          p_proof_id: proof_id,
          p_admin_id: adminId,
          p_feedback: reviewFeedback,
        });

        if (error) {
          console.error('[Approve Proof RPC Error]:', error);
          return NextResponse.json(
            { status: false, message: error.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          status: true,
          message: 'Proof approved and partner wallet credited successfully!',
          data,
        });
      } else {
        // REJECT ACTION
        // 1. Fetch proof to get assignment_id
        const { data: proof, error: proofFetchErr } = await supabaseAdmin
          .from('proof_records')
          .select('id, assignment_id')
          .eq('id', proof_id)
          .single();

        if (proofFetchErr || !proof) {
          return NextResponse.json(
            { status: false, message: 'Proof record not found' },
            { status: 404 }
          );
        }

        // 2. Update proof record to REJECTED
        const { error: proofUpdateErr } = await supabaseAdmin
          .from('proof_records')
          .update({
            status: 'REJECTED',
            review_feedback: reviewFeedback,
            reviewed_by: adminId,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', proof_id);

        if (proofUpdateErr) {
          console.error('[Reject Proof DB Error]:', proofUpdateErr);
          return NextResponse.json(
            { status: false, message: proofUpdateErr.message },
            { status: 500 }
          );
        }

        // 3. Reset assignment status to REVISION_REQUESTED or ACCEPTED
        await supabaseAdmin
          .from('campaign_assignments')
          .update({
            status: 'ACCEPTED', // Allow partner to re-upload proof
            updated_at: new Date().toISOString(),
          })
          .eq('id', proof.assignment_id);

        return NextResponse.json({
          status: true,
          message: 'Proof rejected. Feedback sent to partner for revision.',
        });
      }
    }

    // Sandbox / Simulation fallback
    return NextResponse.json({
      status: true,
      message: action === 'APPROVE'
        ? 'Proof approved (simulation mode). Wallet credited.'
        : 'Proof rejected (simulation mode).',
    });
  } catch (error: any) {
    console.error('[Proof Review Exception]:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to review proof' },
      { status: 500 }
    );
  }
}
