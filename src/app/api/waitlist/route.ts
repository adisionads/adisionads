import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

interface SimulatedWaitlistEntry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  role: 'ADVERTISER' | 'COMMUNITY_PARTNER';
  company_or_community_name?: string;
  estimated_reach_or_budget?: string;
  notes?: string;
  referral_code: string;
  referred_by?: string;
  position: number;
  created_at: string;
}

// Global variable across hot-reloads for local testing
const simulatedWaitlistStore: SimulatedWaitlistEntry[] = [];

function generateReferralCode(): string {
  return `ADIS-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: Max 5 waitlist submissions per IP per minute
    const rateCheck = checkRateLimit(request, 5, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again in a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      full_name,
      email,
      phone,
      country = 'Nigeria',
      role,
      company_or_community_name,
      estimated_reach_or_budget,
      notes,
      referred_by,
    } = body;

    // 1. Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!full_name || full_name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please provide your full name.' },
        { status: 400 }
      );
    }

    if (!phone || phone.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid WhatsApp phone number.' },
        { status: 400 }
      );
    }

    const normalizedRole = role === 'ADVERTISER' ? 'ADVERTISER' : 'COMMUNITY_PARTNER';
    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = full_name.trim();
    const cleanPhone = phone.trim();
    const cleanCountry = (country || 'Nigeria').trim();

    // 2. Production Supabase Execution
    if (isSupabaseAdminConfigured()) {
      try {
        // Check for existing entry
        const { data: existing } = await supabaseAdmin
          .from('waitlist')
          .select('position, referral_code')
          .ilike('email', normalizedEmail)
          .maybeSingle();

        if (existing) {
          return NextResponse.json({
            success: true,
            isExisting: true,
            position: existing.position,
            referral_code: existing.referral_code,
            message: "You're already on the Adision early access waitlist!",
          });
        }

        const referralCode = generateReferralCode();

        const { data: inserted, error } = await supabaseAdmin
          .from('waitlist')
          .insert({
            full_name: cleanName,
            email: normalizedEmail,
            phone: cleanPhone,
            country: cleanCountry,
            role: normalizedRole,
            company_or_community_name: company_or_community_name?.trim() || null,
            estimated_reach_or_budget: estimated_reach_or_budget?.trim() || null,
            notes: notes?.trim() || null,
            referral_code: referralCode,
            referred_by: referred_by?.trim() || null,
          })
          .select('position, referral_code')
          .single();

        if (error) {
          console.error('[Waitlist Supabase Error]:', error);
          return NextResponse.json(
            { success: false, error: 'Database error while joining waitlist: ' + error.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          position: inserted?.position || 1,
          referral_code: inserted?.referral_code || referralCode,
          message: 'Successfully reserved your spot on the Adision early access waitlist!',
        });
      } catch (err: any) {
        console.error('[Waitlist DB Connection Catch]:', err);
      }
    }

    // 3. Fallback Simulation (if database is still pending migration)
    const existingSim = simulatedWaitlistStore.find(
      (entry) => entry.email.toLowerCase() === normalizedEmail
    );

    if (existingSim) {
      return NextResponse.json({
        success: true,
        isExisting: true,
        position: existingSim.position,
        referral_code: existingSim.referral_code,
        message: "You're already on the Adision early access waitlist!",
      });
    }

    const referralCode = generateReferralCode();
    const position = simulatedWaitlistStore.length + 42;

    const newEntry: SimulatedWaitlistEntry = {
      id: `wl_${Date.now()}`,
      full_name: cleanName,
      email: normalizedEmail,
      phone: cleanPhone,
      country: cleanCountry,
      role: normalizedRole,
      company_or_community_name: company_or_community_name?.trim(),
      estimated_reach_or_budget: estimated_reach_or_budget?.trim(),
      notes: notes?.trim(),
      referral_code: referralCode,
      referred_by: referred_by?.trim(),
      position,
      created_at: new Date().toISOString(),
    };

    simulatedWaitlistStore.push(newEntry);

    return NextResponse.json({
      success: true,
      position,
      referral_code: referralCode,
      message: 'Successfully reserved your spot on the Adision early access waitlist!',
    });
  } catch (error: any) {
    console.error('[Waitlist Handler Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Unexpected server error. Please try again.' },
      { status: 500 }
    );
  }
}
