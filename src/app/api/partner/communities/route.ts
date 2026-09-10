import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server-auth';

export const runtime = 'nodejs';

// Helper to safely map user text niche to community_category enum
function mapNicheToCategory(niche: string): string {
  if (!niche) return 'GENERAL';
  const lower = niche.toLowerCase();
  if (lower.includes('student') || lower.includes('campus') || lower.includes('uni') || lower.includes('school')) {
    return 'STUDENTS_CAMPUS';
  }
  if (lower.includes('tech') || lower.includes('code') || lower.includes('design') || lower.includes('dev') || lower.includes('software')) {
    return 'TECHNOLOGY';
  }
  if (lower.includes('crypto') || lower.includes('forex') || lower.includes('web3') || lower.includes('trade') || lower.includes('bitcoin')) {
    return 'CRYPTO_WEB3';
  }
  if (lower.includes('biz') || lower.includes('business') || lower.includes('finance') || lower.includes('money') || lower.includes('invest')) {
    return 'BUSINESS_FINANCE';
  }
  if (lower.includes('job') || lower.includes('career') || lower.includes('work') || lower.includes('vacancy')) {
    return 'JOBS_CAREERS';
  }
  if (lower.includes('fashion') || lower.includes('vendor') || lower.includes('wear') || lower.includes('cloth') || lower.includes('beauty')) {
    return 'FASHION_LIFESTYLE';
  }
  if (lower.includes('sport') || lower.includes('football') || lower.includes('bet')) {
    return 'SPORTS';
  }
  if (lower.includes('fun') || lower.includes('meme') || lower.includes('comedy') || lower.includes('entertain') || lower.includes('music')) {
    return 'ENTERTAINMENT';
  }
  return 'GENERAL';
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ success: true, data: [] });
    }

    let query = supabaseAdmin
      .from('communities')
      .select('*')
      .order('created_at', { ascending: false });

    // Non-admins can ONLY view their own communities
    if (auth.user!.role !== 'ADMIN') {
      query = query.eq('owner_id', auth.user!.id);
    } else {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('user_id');
      if (userId) {
        query = query.eq('owner_id', userId);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Partner Communities GET Error]:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    console.error('[Partner Communities GET Catch]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const {
      name,
      platform = 'WHATSAPP_GROUP',
      niche = '',
      category,
      invite_link = '',
      member_count = 0,
      description = '',
      verification_image_url,
    } = body;

    // Securely tie community to the verified session owner ID
    const effectiveOwnerId = auth.user!.id;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter your community name' },
        { status: 400 }
      );
    }

    const resolvedCategory = category || mapNicheToCategory(niche);
    const resolvedLink = invite_link?.trim() || 'Pending link';
    const resolvedDescription = niche?.trim()
      ? `Niche: ${niche.trim()}${description ? ` • ${description.trim()}` : ''}`
      : description?.trim() || 'Active WhatsApp Community';

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          id: `comm_${Date.now()}`,
          owner_id: effectiveOwnerId,
          name: name.trim(),
          platform,
          category: resolvedCategory,
          invite_link: resolvedLink,
          member_count: Number(member_count) || 0,
          description: resolvedDescription,
          status: 'SUBMITTED',
          created_at: new Date().toISOString(),
        },
      });
    }

    const { data: community, error } = await supabaseAdmin
      .from('communities')
      .insert({
        owner_id: effectiveOwnerId,
        name: name.trim(),
        platform,
        category: resolvedCategory,
        invite_link: resolvedLink,
        member_count: Number(member_count) || 0,
        description: resolvedDescription,
        verification_image_url: verification_image_url || null,
        status: 'SUBMITTED',
      })
      .select('*')
      .single();

    if (error) {
      console.error('[Community Insert Error]:', error);
      return NextResponse.json(
        { success: false, error: 'Database error creating community: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Community submitted successfully! Our team will review it within hours.',
      data: community,
    });
  } catch (err: any) {
    console.error('[Community POST Catch]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
