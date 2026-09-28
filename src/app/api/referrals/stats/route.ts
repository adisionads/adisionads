import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server-auth';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/**
 * Get Referral Statistics & Referral Link for Authenticated User
 * Endpoint: GET /api/referrals/stats
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const userId = auth.user!.id;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adision.xyz';

    if (!isSupabaseAdminConfigured()) {
      // Simulation / Local fallback
      const simCode = 'ADIS' + userId.slice(0, 4).toUpperCase();
      return NextResponse.json({
        status: true,
        data: {
          referral_code: simCode,
          referral_link: `${appUrl}/signup?ref=${simCode}`,
          total_invited: 3,
          total_qualified: 1,
          total_earnings: 500,
          pending_earnings: 1000,
          conversions: [
            {
              id: 'ref_1',
              referee_name: 'Adewale O.',
              track: 'PARTNER',
              status: 'REWARDED',
              reward_amount: 500,
              created_at: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: 'ref_2',
              referee_name: 'Campus Deals Admin',
              track: 'PARTNER',
              status: 'PENDING',
              reward_amount: 500,
              created_at: new Date(Date.now() - 3600000).toISOString(),
            },
          ],
        },
      });
    }

    // 1. Fetch user's referral code from profiles
    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, referral_code, role')
      .eq('id', userId)
      .single();

    let referralCode = profile?.referral_code;

    // If profile does not have a referral code yet, generate and save one
    if (!referralCode) {
      referralCode = 'ADIS' + Math.random().toString(36).substring(2, 6).toUpperCase();
      await supabaseAdmin
        .from('profiles')
        .update({ referral_code: referralCode, updated_at: new Date().toISOString() })
        .eq('id', userId);
    }

    // 2. Fetch all referral conversions for this user
    const { data: conversions, error: convErr } = await supabaseAdmin
      .from('referral_conversions')
      .select(`
        id,
        referred_user_id,
        referral_track,
        status,
        reward_amount,
        created_at,
        rewarded_at,
        referred_user:profiles!referral_conversions_referred_user_id_fkey(full_name, phone)
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (convErr) {
      console.warn('[Referrals Stats] Query error:', convErr);
    }

    const list = conversions || [];
    const totalInvited = list.length;
    const totalRewarded = list.filter((c: any) => c.status === 'REWARDED').length;
    const totalEarnings = list
      .filter((c: any) => c.status === 'REWARDED')
      .reduce((sum: number, c: any) => sum + Number(c.reward_amount || 0), 0);
    const pendingEarnings = list
      .filter((c: any) => c.status === 'PENDING' || c.status === 'QUALIFIED')
      .reduce((sum: number, c: any) => sum + Number(c.reward_amount || 0), 0);

    // Format sanitized conversion list (obfuscate names/phones for privacy)
    const formattedConversions = list.map((c: any) => {
      const referee = c.referred_user || {};
      const rawName = referee.full_name || 'Member';
      const nameParts = rawName.trim().split(' ');
      const obfuscatedName = nameParts.length > 1
        ? `${nameParts[0]} ${nameParts[1].slice(0, 1)}.`
        : nameParts[0];

      return {
        id: c.id,
        referee_name: obfuscatedName,
        track: c.referral_track,
        status: c.status,
        reward_amount: Number(c.reward_amount || 500),
        created_at: c.created_at,
        rewarded_at: c.rewarded_at,
      };
    });

    return NextResponse.json({
      status: true,
      data: {
        referral_code: referralCode,
        referral_link: `${appUrl}/signup?ref=${referralCode}`,
        total_invited: totalInvited,
        total_qualified: totalRewarded,
        total_earnings: totalEarnings,
        pending_earnings: pendingEarnings,
        conversions: formattedConversions,
      },
    });
  } catch (error: any) {
    console.error('[Referrals Stats Exception]:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to fetch referral statistics' },
      { status: 500 }
    );
  }
}
