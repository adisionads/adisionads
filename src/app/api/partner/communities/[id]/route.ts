import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { data: updated, error } = await supabaseAdmin
      .from('communities')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[Community Update Error]:', error);
      return NextResponse.json(
        { success: false, error: 'Database update failed: ' + error.message },
        { status: 500 }
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
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Community ID is required' }, { status: 400 });
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ success: true, message: 'Community deleted (Sandbox Mode)' });
    }

    const { error } = await supabaseAdmin
      .from('communities')
      .delete()
      .eq('id', id);

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
