import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseAdminConfigured = () => {
  return (
    !!supabaseUrl &&
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    !!supabaseServiceRoleKey &&
    supabaseServiceRoleKey !== 'placeholder-service-role-key'
  );
};

/**
 * Server-only Supabase Admin Client
 * Bypasses RLS for secure backend operations (ledger transactions, webhook settlement, telemetry ingestion).
 * NEVER expose this or the service role key to the browser!
 */
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceRoleKey || 'placeholder-service-role-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
