import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server-auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Join profiles to get the group owner's name and WhatsApp phone number
    const { data: communities, error } = await supabaseAdmin
      .from('communities')
      .select(`
        *,
        owner:profiles!owner_id (
          id,
          full_name,
          phone,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin Communities GET Error]:', error);
      // If join fails due to relationship cache, fallback to simple select
      const { data: simpleData, error: simpleErr } = await supabaseAdmin
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

      if (simpleErr) {
        return NextResponse.json({ success: false, error: simpleErr.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, data: simpleData || [] });
    }

    return NextResponse.json({ success: true, data: communities || [] });
  } catch (err: any) {
    console.error('[Admin Communities GET Catch]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const { id, status, rejection_reason } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Community ID and target status are required' },
        { status: 400 }
      );
    }

    if (!['VERIFIED', 'REJECTED', 'SUBMITTED', 'UNDER_REVIEW', 'SUSPENDED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status: ${status}` },
        { status: 400 }
      );
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({
        success: true,
        message: `Community status updated to ${status} (Sandbox Mode)`,
      });
    }

    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'REJECTED' && rejection_reason) {
      updates.rejection_reason = rejection_reason.trim();
    } else if (status === 'VERIFIED') {
      updates.rejection_reason = null;
    }

    const { data: updated, error } = await supabaseAdmin
      .from('communities')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[Admin Community Update Error]:', error);
      return NextResponse.json(
        { success: false, error: 'Database update failed: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Community successfully ${status === 'VERIFIED' ? 'approved' : status.toLowerCase()}!`,
      data: updated,
    });
  } catch (err: any) {
    console.error('[Admin Community PATCH Catch]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
