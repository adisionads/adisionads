-- =========================================================================
-- ADISION — COMPLETE PRODUCTION POSTGRESQL SCHEMA
-- Double-entry ledger, multi-role RBAC, Row Level Security, click analytics
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('ADVERTISER', 'COMMUNITY_PARTNER', 'ADMIN');
CREATE TYPE community_platform AS ENUM ('WHATSAPP_GROUP', 'WHATSAPP_CHANNEL', 'TELEGRAM', 'DISCORD');
CREATE TYPE community_category AS ENUM (
    'STUDENTS_CAMPUS', 'BUSINESS_FINANCE', 'TECHNOLOGY', 'CRYPTO_WEB3', 
    'JOBS_CAREERS', 'ENTERTAINMENT', 'FASHION_LIFESTYLE', 'SPORTS', 
    'GENERAL', 'LOCAL_COMMUNITIES'
);
CREATE TYPE community_status AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED');
CREATE TYPE campaign_status AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE assignment_status AS ENUM ('ASSIGNED', 'ACCEPTED', 'DECLINED', 'PUBLISHED', 'PROOF_SUBMITTED', 'VERIFIED', 'COMPLETED', 'DISPUTED');
CREATE TYPE proof_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED');
CREATE TYPE ledger_transaction_type AS ENUM ('DEPOSIT', 'ESCROW_HOLD', 'COMMISSION_DEDUCTION', 'CAMPAIGN_PAYOUT', 'WITHDRAWAL', 'REFUND');
CREATE TYPE transaction_direction AS ENUM ('CREDIT', 'DEBIT');
CREATE TYPE withdrawal_status AS ENUM ('REQUESTED', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'COMMUNITY_PARTNER',
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMMUNITIES (SUPPLY)
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform community_platform NOT NULL DEFAULT 'WHATSAPP_GROUP',
    category community_category NOT NULL,
    invite_link TEXT NOT NULL,
    member_count INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    location TEXT DEFAULT 'Nigeria',
    verification_image_url TEXT,
    status community_status NOT NULL DEFAULT 'SUBMITTED',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CAMPAIGNS (DEMAND)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category community_category NOT NULL,
    ad_copy TEXT NOT NULL,
    media_url TEXT,
    destination_url TEXT NOT NULL,
    cta_text TEXT NOT NULL DEFAULT 'Learn More',
    package_name TEXT NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 7,
    budget_amount NUMERIC(14, 2) NOT NULL,
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 30.00,
    distributable_pool NUMERIC(14, 2) NOT NULL,
    status campaign_status NOT NULL DEFAULT 'DRAFT',
    payment_status payment_status NOT NULL DEFAULT 'PENDING',
    payment_reference TEXT UNIQUE,
    virtual_account_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CAMPAIGN ASSIGNMENTS (MATCHMAKING & DISTRIBUTION)
CREATE TABLE IF NOT EXISTS public.campaign_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id),
    tracking_code TEXT UNIQUE NOT NULL,
    payout_amount NUMERIC(14, 2) NOT NULL,
    status assignment_status NOT NULL DEFAULT 'ASSIGNED',
    accepted_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TRACKING LINKS & CLICK TELEMETRY
CREATE TABLE IF NOT EXISTS public.tracking_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.campaign_assignments(id) ON DELETE CASCADE,
    tracking_code TEXT UNIQUE NOT NULL,
    target_url TEXT NOT NULL,
    total_clicks INTEGER NOT NULL DEFAULT 0,
    unique_clicks INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.click_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_code TEXT NOT NULL REFERENCES public.tracking_links(tracking_code) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES public.campaign_assignments(id) ON DELETE CASCADE,
    hashed_ip TEXT NOT NULL,
    user_agent TEXT,
    referer TEXT,
    is_unique BOOLEAN DEFAULT TRUE,
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROOF RECORDS
CREATE TABLE IF NOT EXISTS public.proof_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.campaign_assignments(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES public.profiles(id),
    proof_image_url TEXT NOT NULL,
    placement_timestamp TIMESTAMPTZ NOT NULL,
    notes TEXT,
    status proof_status NOT NULL DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES public.profiles(id),
    review_feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- 8. WALLETS & DOUBLE-ENTRY LEDGER (MONEY & ESCROW)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    available_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (available_balance >= 0),
    pending_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (pending_balance >= 0),
    lifetime_earned NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    lifetime_spent NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'NGN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ledger_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    transaction_type ledger_transaction_type NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    direction transaction_direction NOT NULL,
    balance_after NUMERIC(14, 2) NOT NULL,
    reference_id UUID,
    reference_type TEXT,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. WITHDRAWALS
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 1000),
    bank_name TEXT NOT NULL,
    bank_code TEXT,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    status withdrawal_status NOT NULL DEFAULT 'REQUESTED',
    processed_by UUID REFERENCES public.profiles(id),
    transaction_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 10. COMMUNITY PERFORMANCE SCORES
CREATE TABLE IF NOT EXISTS public.performance_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID UNIQUE NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    reliability_score NUMERIC(5, 2) NOT NULL DEFAULT 100.00, -- 40% weight (completion rate)
    activity_score NUMERIC(5, 2) NOT NULL DEFAULT 80.00,     -- 30% weight (admin verified activity)
    performance_score NUMERIC(5, 2) NOT NULL DEFAULT 70.00,  -- 30% weight (CTR/clicks generated)
    composite_score NUMERIC(5, 2) NOT NULL DEFAULT 85.00,
    total_assignments INTEGER NOT NULL DEFAULT 0,
    completed_assignments INTEGER NOT NULL DEFAULT 0,
    total_clicks_generated INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_communities_owner ON public.communities(owner_id);
CREATE INDEX IF NOT EXISTS idx_communities_status ON public.communities(status);
CREATE INDEX IF NOT EXISTS idx_communities_category ON public.communities(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser ON public.campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_assignments_campaign ON public.campaign_assignments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_assignments_community ON public.campaign_assignments(community_id);
CREATE INDEX IF NOT EXISTS idx_assignments_tracking ON public.campaign_assignments(tracking_code);
CREATE INDEX IF NOT EXISTS idx_click_events_code ON public.click_events(tracking_code);
CREATE INDEX IF NOT EXISTS idx_ledger_wallet ON public.ledger_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON public.ledger_transactions(user_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_scores ENABLE ROW LEVEL SECURITY;

-- Helper function to check if caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view their own profile, Admins can view all
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Communities: Owners view their own, Admins view all, Verified viewable for assignments
CREATE POLICY "Owners view own communities" ON public.communities FOR SELECT USING (auth.uid() = owner_id OR public.is_admin(auth.uid()));
CREATE POLICY "Owners insert communities" ON public.communities FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own communities" ON public.communities FOR UPDATE USING (auth.uid() = owner_id OR public.is_admin(auth.uid()));

-- Campaigns: Advertisers view own, Admins view all
CREATE POLICY "Advertisers view own campaigns" ON public.campaigns FOR SELECT USING (auth.uid() = advertiser_id OR public.is_admin(auth.uid()));
CREATE POLICY "Advertisers insert campaigns" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = advertiser_id);
CREATE POLICY "Advertisers update own campaigns" ON public.campaigns FOR UPDATE USING (auth.uid() = advertiser_id OR public.is_admin(auth.uid()));

-- Wallets: Users view own wallet, Admins view all
CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Ledger: Users view own transactions
CREATE POLICY "Users view own ledger" ON public.ledger_transactions FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- ATOMIC STORED PROCEDURE: APPROVE PROOF & RELEASE WALLET CREDIT
CREATE OR REPLACE FUNCTION public.approve_proof_and_credit_partner(
    p_proof_id UUID,
    p_admin_id UUID,
    p_feedback TEXT DEFAULT 'Proof verified and approved'
)
RETURNS JSONB AS $$
DECLARE
    v_assignment RECORD;
    v_community RECORD;
    v_wallet RECORD;
    v_new_balance NUMERIC(14, 2);
    v_payout NUMERIC(14, 2);
BEGIN
    -- 1. Check admin permission
    IF NOT public.is_admin(p_admin_id) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can approve proofs.';
    END IF;

    -- 2. Lock and fetch proof record
    SELECT * INTO v_assignment 
    FROM public.campaign_assignments ca
    JOIN public.proof_records pr ON pr.assignment_id = ca.id
    WHERE pr.id = p_proof_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proof or Assignment not found.';
    END IF;

    -- 3. Fetch community and owner
    SELECT * INTO v_community 
    FROM public.communities 
    WHERE id = v_assignment.community_id;

    -- 4. Lock partner wallet
    SELECT * INTO v_wallet 
    FROM public.wallets 
    WHERE user_id = v_community.owner_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        -- Create wallet if missing
        INSERT INTO public.wallets (user_id, available_balance, pending_balance)
        VALUES (v_community.owner_id, 0.00, 0.00)
        RETURNING * INTO v_wallet;
    END IF;

    v_payout := v_assignment.payout_amount;
    v_new_balance := v_wallet.available_balance + v_payout;

    -- 5. Update Wallet balance atomically
    UPDATE public.wallets
    SET available_balance = v_new_balance,
        lifetime_earned = lifetime_earned + v_payout,
        updated_at = NOW()
    WHERE id = v_wallet.id;

    -- 6. Insert immutable ledger entry
    INSERT INTO public.ledger_transactions (
        wallet_id, user_id, transaction_type, amount, direction, balance_after, reference_id, reference_type, description
    ) VALUES (
        v_wallet.id,
        v_community.owner_id,
        'CAMPAIGN_PAYOUT',
        v_payout,
        'CREDIT',
        v_new_balance,
        v_assignment.campaign_id,
        'CAMPAIGN_ASSIGNMENT',
        'Earnings credited for campaign assignment placement verification'
    );

    -- 7. Update proof status
    UPDATE public.proof_records
    SET status = 'APPROVED',
        reviewed_by = p_admin_id,
        review_feedback = p_feedback,
        reviewed_at = NOW()
    WHERE id = p_proof_id;

    -- 8. Update assignment status
    UPDATE public.campaign_assignments
    SET status = 'VERIFIED',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = v_assignment.assignment_id;

    RETURN jsonb_build_object(
        'success', true,
        'payout_amount', v_payout,
        'new_balance', v_new_balance,
        'partner_id', v_community.owner_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ATOMIC STORED PROCEDURE: PROCESS CAMPAIGN PAYMENT & RECORD ESCROW
CREATE OR REPLACE FUNCTION public.process_campaign_payment(
    p_payment_reference TEXT,
    p_amount NUMERIC(14, 2)
)
RETURNS JSONB AS $$
DECLARE
    v_campaign RECORD;
    v_wallet RECORD;
BEGIN
    -- 1. Lock campaign row for atomic update
    SELECT * INTO v_campaign
    FROM public.campaigns
    WHERE payment_reference = p_payment_reference
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Campaign with reference not found');
    END IF;

    -- 2. Idempotency Check: If already paid, return early safely
    IF v_campaign.payment_status = 'PAID' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Payment already processed (idempotent duplicate)', 'campaign_id', v_campaign.id);
    END IF;

    -- 3. Update Campaign Payment Status
    UPDATE public.campaigns
    SET payment_status = 'PAID',
        status = 'ACTIVE',
        updated_at = NOW()
    WHERE id = v_campaign.id;

    -- 4. Fetch or create advertiser wallet
    SELECT * INTO v_wallet
    FROM public.wallets
    WHERE user_id = v_campaign.advertiser_id
    FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO public.wallets (user_id, available_balance, pending_balance, lifetime_spent)
        VALUES (v_campaign.advertiser_id, 0.00, 0.00, p_amount)
        RETURNING * INTO v_wallet;
    ELSE
        UPDATE public.wallets
        SET lifetime_spent = lifetime_spent + p_amount,
            updated_at = NOW()
        WHERE id = v_wallet.id;
    END IF;

    -- 5. Record immutable ledger transaction
    INSERT INTO public.ledger_transactions (
        wallet_id, user_id, transaction_type, amount, direction, balance_after, reference_id, reference_type, description
    ) VALUES (
        v_wallet.id,
        v_campaign.advertiser_id,
        'ESCROW_HOLD',
        p_amount,
        'DEBIT',
        v_wallet.available_balance,
        v_campaign.id,
        'CAMPAIGN_ESCROW',
        'Escrow deposit held for campaign reach distribution'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Campaign activated and escrow transaction logged',
        'campaign_id', v_campaign.id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ATOMIC STORED PROCEDURE: INCREMENT TRACKING LINK CLICKS
CREATE OR REPLACE FUNCTION public.increment_tracking_link_clicks(
    t_code TEXT,
    is_unique_click BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.tracking_links
    SET total_clicks = total_clicks + 1,
        unique_clicks = CASE WHEN is_unique_click THEN unique_clicks + 1 ELSE unique_clicks END
    WHERE LOWER(tracking_code) = LOWER(t_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ATOMIC STORED PROCEDURE: REQUEST PARTNER WITHDRAWAL
CREATE OR REPLACE FUNCTION public.request_partner_withdrawal(
    p_user_id UUID,
    p_amount NUMERIC(14, 2),
    p_bank_name TEXT,
    p_account_number TEXT,
    p_account_name TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_wallet RECORD;
    v_new_available NUMERIC(14, 2);
    v_withdrawal_id UUID;
BEGIN
    -- 1. Lock wallet row
    SELECT * INTO v_wallet
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found for this user.';
    END IF;

    -- 2. Validate sufficient available balance
    IF v_wallet.available_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient available balance. Requested: %, Available: %', p_amount, v_wallet.available_balance;
    END IF;

    v_new_available := v_wallet.available_balance - p_amount;

    -- 3. Deduct available balance and move to pending balance
    UPDATE public.wallets
    SET available_balance = v_new_available,
        pending_balance = v_wallet.pending_balance + p_amount,
        updated_at = NOW()
    WHERE id = v_wallet.id;

    -- 4. Create withdrawal request entry
    INSERT INTO public.withdrawal_requests (
        wallet_id, user_id, amount, bank_name, account_number, account_name, status
    ) VALUES (
        v_wallet.id, p_user_id, p_amount, p_bank_name, p_account_number, p_account_name, 'REQUESTED'
    ) RETURNING id INTO v_withdrawal_id;

    -- 5. Create immutable debit ledger record
    INSERT INTO public.ledger_transactions (
        wallet_id, user_id, transaction_type, amount, direction, balance_after, reference_id, reference_type, description
    ) VALUES (
        v_wallet.id,
        p_user_id,
        'WITHDRAWAL',
        p_amount,
        'DEBIT',
        v_new_available,
        v_withdrawal_id,
        'WITHDRAWAL_REQUEST',
        format('Bank transfer withdrawal requested to %s (%s)', p_bank_name, p_account_number)
    );

    RETURN jsonb_build_object(
        'success', true,
        'withdrawal_id', v_withdrawal_id,
        'new_available_balance', v_new_available
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


