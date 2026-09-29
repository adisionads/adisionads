import { pocketFi } from '@/lib/pocketfi/client';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { DedicatedVirtualAccount } from '@/types';

/**
 * Dedicated Virtual Account Service
 * Provides permanent, named Nigerian bank accounts for each user (24/7 wallet funding)
 */
export async function getOrCreateDedicatedVirtualAccount(userId: string): Promise<{
  success: boolean;
  account?: DedicatedVirtualAccount;
  message?: string;
}> {
  if (!isSupabaseAdminConfigured()) {
    // Development / Local fallback simulation
    const mockAccount: DedicatedVirtualAccount = {
      id: `dva_sim_${userId.slice(0, 8)}`,
      user_id: userId,
      bank_name: 'SafeHaven Microfinance Bank',
      bank_code: '090286',
      account_number: '60' + Math.floor(10000000 + Math.random() * 90000000),
      account_name: 'ADISION / MEMBER',
      provider: 'POCKETFI',
      reference: `dva_sim_${Date.now()}`,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { success: true, account: mockAccount };
  }

  try {
    // 1. Check if user already has an active dedicated virtual account
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('user_virtual_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (existing && !fetchErr) {
      return { success: true, account: existing as DedicatedVirtualAccount };
    }

    // 2. Fetch User Profile to get their name, email, phone
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, phone')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) {
      return { success: false, message: 'User profile not found.' };
    }

    // 3. Ensure user has a wallet
    let { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!wallet) {
      const { data: newW } = await supabaseAdmin
        .from('wallets')
        .insert({
          user_id: userId,
          available_balance: 0,
          pending_balance: 0,
          currency: 'NGN',
        })
        .select('id')
        .single();
      wallet = newW;
    }

    // 4. Request dedicated virtual account from PocketFi
    const reference = `dva_${userId.replace(/-/g, '').slice(0, 12)}_${Date.now()}`;
    const pfiAccount = await pocketFi.createDedicatedVirtualAccount({
      name: profile.full_name || 'Adision Member',
      email: profile.email,
      phone: profile.phone,
      reference,
    });

    if (!pfiAccount || !pfiAccount.account_number) {
      return { success: false, message: 'Failed to generate bank account from payment gateway.' };
    }

    // 5. Store in user_virtual_accounts table
    const { data: saved, error: saveErr } = await supabaseAdmin
      .from('user_virtual_accounts')
      .insert({
        user_id: userId,
        wallet_id: wallet?.id || null,
        bank_name: pfiAccount.bank_name,
        bank_code: pfiAccount.bank_code || '090286',
        account_number: pfiAccount.account_number,
        account_name: pfiAccount.account_name,
        provider: 'POCKETFI',
        reference,
        status: 'ACTIVE',
      })
      .select('*')
      .single();

    if (saveErr) {
      // If conflict (e.g. duplicate key), fetch the existing one
      const { data: conflictRow } = await supabaseAdmin
        .from('user_virtual_accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (conflictRow) {
        return { success: true, account: conflictRow as DedicatedVirtualAccount };
      }
      console.error('[Virtual Account Save Error]:', saveErr);
      return { success: false, message: 'Error storing dedicated bank account.' };
    }

    return { success: true, account: saved as DedicatedVirtualAccount };
  } catch (err: any) {
    console.error('[getOrCreateDedicatedVirtualAccount Error]:', err);
    return { success: false, message: err.message || 'Unexpected server error.' };
  }
}
