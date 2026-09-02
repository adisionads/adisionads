import { NextRequest, NextResponse } from 'next/server';
import { paymentPoint } from '@/lib/paymentpoint/client';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/**
 * Campaign Virtual Account Checkout Generator
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

    // 2. Request Dedicated Virtual Bank Account from PaymentPoint
    const virtualAccount = await paymentPoint.createDedicatedVirtualAccount({
      amount: Number(budget_amount),
      email: advertiser_email,
      name: advertiser_name || 'Adision Advertiser',
      phoneNumber: phone_number,
      reference,
    });

    const distributablePool = Number(budget_amount) * 0.7; // 70% to community partners, 30% platform margin

    // 3. Persist Campaign to Supabase if configured
    let campaignId = `camp_${Date.now()}`;
    if (isSupabaseAdminConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('campaigns')
        .insert({
          advertiser_id: advertiser_id || 'usr_adv_001',
          title,
          category: category || 'GENERAL',
          ad_copy: ad_copy || '',
          media_url: media_url || null,
          destination_url,
          cta_text: cta_text || 'Learn More',
          package_name: package_name || 'Standard Reach',
          duration_days: 7,
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
      } else if (data?.id) {
        campaignId = data.id;
      }
    }

    return NextResponse.json({
      status: true,
      data: {
        campaign_id: campaignId,
        reference,
        amount: Number(budget_amount),
        virtual_account: virtualAccount,
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
