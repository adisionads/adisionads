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
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Supabase admin is not yet configured or tables not created.',
      });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let query = supabaseAdmin
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (role && (role === 'ADVERTISER' || role === 'COMMUNITY_PARTNER')) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Admin Waitlist Fetch Error]:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data || [],
    });
  } catch (err: any) {
    console.error('[Admin Waitlist Catch]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
