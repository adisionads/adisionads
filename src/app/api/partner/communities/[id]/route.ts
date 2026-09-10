import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server-auth';

export const runtime = 'nodejs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const { id } = await params;
    const body = await request.json();
    const { name, invite_link, member_count, description, category } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Community ID is required' }, { status: 400 });
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name.trim();
    if (invite_link !== undefined) updates.invite_link = invite_link.trim();
    if (member_count !== undefined) updates.member_count = Number(member_count) || 0;
    if (description !== undefined) updates.description = description.trim();
    if (category !== undefined) updates.category = category;

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Community updated successfully (Sandbox Mode)',
        data: { id, ...updates },
      });
    }

    // IDOR Protection: Non-admins can strictly only update communities they own
    let query = supabaseAdmin
      .from('communities')
      .update(updates)
      .eq('id', id);

    if (auth.user!.role !== 'ADMIN') {
      query = query.eq('owner_id', auth.user!.id);
    }

    const { data: updated, error } = await query.select('*').maybeSingle();

    if (error) {
      console.error('[Community Update Error]:', error);
      return NextResponse.json(
        { success: false, error: 'Database update failed: ' + error.message },
        { status: 500 }
      );
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Community not found or you do not have permission to modify it' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Community details updated successfully!',
      data: updated,
    });
  } catch (err: any) {
    console.error('[Community PATCH Catch]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Community ID is required' }, { status: 400 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ success: true, message: 'Community deleted (Sandbox Mode)' });
    }

    // IDOR Protection: Non-admins can strictly only delete communities they own
    let query = supabaseAdmin
      .from('communities')
      .delete()
      .eq('id', id);

    if (auth.user!.role !== 'ADMIN') {
      query = query.eq('owner_id', auth.user!.id);
    }

    const { error } = await query;

    if (error) {
      console.error('[Community Delete Error]:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Community deleted successfully' });
  } catch (err: any) {
    console.error('[Community DELETE Catch]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
