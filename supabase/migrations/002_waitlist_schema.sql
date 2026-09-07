-- =========================================================================
-- ADISION — WAITLIST SCHEMA (100% STANDALONE & SAFE)
-- Can be run completely independently on any fresh or existing Supabase project
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Nigeria',
    role TEXT NOT NULL CHECK (role IN ('ADVERTISER', 'COMMUNITY_PARTNER')),
    company_or_community_name TEXT,
    estimated_reach_or_budget TEXT,
    notes TEXT,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by TEXT,
    position SERIAL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'INVITED', 'ONBOARDED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure column 'country' exists if table was previously created without it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'waitlist' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE public.waitlist ADD COLUMN country TEXT NOT NULL DEFAULT 'Nigeria';
    END IF;
END $$;

-- Case-insensitive unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email_lower ON public.waitlist (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_waitlist_role ON public.waitlist (role);
CREATE INDEX IF NOT EXISTS idx_waitlist_country ON public.waitlist (country);
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON public.waitlist (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON public.waitlist (referral_code);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- 1. Anonymous visitors can insert into waitlist
DROP POLICY IF EXISTS "Public anonymous insert to waitlist" ON public.waitlist;
CREATE POLICY "Public anonymous insert to waitlist"
ON public.waitlist
FOR INSERT
WITH CHECK (true);

-- 2. Read policy (allows reading for platform dashboard and service role)
DROP POLICY IF EXISTS "Allow select for waitlist" ON public.waitlist;
CREATE POLICY "Allow select for waitlist"
ON public.waitlist
FOR SELECT
USING (true);

-- 3. Update policy (allows status updates by backend)
DROP POLICY IF EXISTS "Allow update for waitlist" ON public.waitlist;
CREATE POLICY "Allow update for waitlist"
ON public.waitlist
FOR UPDATE
USING (true);
