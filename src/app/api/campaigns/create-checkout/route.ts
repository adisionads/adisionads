import { NextRequest, NextResponse } from 'next/server';
import { pocketFi } from '@/lib/pocketfi/client';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/**
 * Campaign Virtual Account & Checkout Generator (PocketFi)
 * Endpoint: POST /api/campaigns/create-checkout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      advertiser_id,
      title,
      category,
      ad_copy,
      media_url,
      destination_url,
      cta_text,
      package_name,
      budget_amount,
      advertiser_email,
      advertiser_name,
      phone_number,
      duration_days,
      billing_model,
      target_quantity,
      unit_price,
    } = body;

    // Basic Validation
    if (!title || !destination_url || !budget_amount || !advertiser_email) {
      return NextResponse.json(
        { status: false, message: 'Missing required campaign parameters (title, destination_url, budget, email)' },
        { status: 400 }
      );
    }

    // 1. Generate Unique Payment Reference
    const reference = `ads_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 2. Request Dedicated Virtual Bank Account from PocketFi
    const virtualAccount = await pocketFi.createVirtualAccount({
      amount: Number(budget_amount),
      email: advertiser_email,
      name: advertiser_name || 'Adision Advertiser',
      phone: phone_number,
      reference,
      bank: 'kuda',
    });

    // 3. Also generate PocketFi checkout payment link (card, transfer, USSD)
    const checkoutSession = await pocketFi.createCheckoutSession({
      amount: Number(budget_amount),
      email: advertiser_email,
      name: advertiser_name || 'Adision Advertiser',
      phone: phone_number,
      reference,
      redirectUrl: 'https://adisionads.vercel.app/advertiser',
    });

    const distributablePool = Number(budget_amount) * 0.7; // 70% to community partners, 30% platform margin

    function isValidUUID(str?: string): boolean {
      if (!str) return false;
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    }

    // 4. Persist Campaign to Supabase if configured
    let campaignId = `camp_${Date.now()}`;
    if (isSupabaseAdminConfigured()) {
      let effectiveAdvertiserId = advertiser_id;

      if (!isValidUUID(effectiveAdvertiserId)) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .ilike('email', advertiser_email.trim().toLowerCase())
          .maybeSingle();

        if (profile?.id) {
          effectiveAdvertiserId = profile.id;
        } else {
          // Fallback to first available profile if testing
          const { data: anyProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .limit(1)
            .maybeSingle();
          if (anyProfile?.id) {
            effectiveAdvertiserId = anyProfile.id;
          }
        }
      }

      if (effectiveAdvertiserId && isValidUUID(effectiveAdvertiserId)) {
        const { data, error } = await supabaseAdmin
          .from('campaigns')
          .insert({
            advertiser_id: effectiveAdvertiserId,
            title,
            category: category || 'GENERAL',
            ad_copy: ad_copy || '',
            media_url: media_url || null,
            destination_url,
            cta_text: cta_text || 'Learn More',
            package_name: package_name || 'Starter',
            duration_days: Number(duration_days) || 14,
            budget_amount: Number(budget_amount),
            commission_rate: 30.0,
            distributable_pool: distributablePool,
            status: 'DRAFT',
            payment_status: 'PENDING',
            payment_reference: reference,
            virtual_account_details: virtualAccount,
          })
          .select('id')
          .single();

        if (error) {
          console.error('[Create Checkout DB Insert Error]:', error);
          return NextResponse.json(
            { status: false, message: 'Database error saving campaign: ' + error.message },
            { status: 500 }
          );
        } else if (data?.id) {
          campaignId = data.id;
        }
      }
    }

    return NextResponse.json({
      status: true,
      data: {
        campaign_id: campaignId,
        reference,
        amount: Number(budget_amount),
        virtual_account: virtualAccount,
        payment_link: checkoutSession.paymentLink,
        payment_id: checkoutSession.paymentId,
      },
    });
  } catch (error: any) {
    console.error('[Create Checkout Exception]:', error);
    return NextResponse.json(
      { status: false, message: error.message || 'Failed to initiate campaign checkout' },
      { status: 500 }
    );
  }
}
