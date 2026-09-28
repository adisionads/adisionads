-- ==============================================================================
-- ADISION REFERRAL & VIRAL GROWTH ENGINE SCHEMA MIGRATION
-- Migration: 005_referral_system.sql
-- Description: Adds referral code generation, tracking attribution, and conversion escrow.
-- ==============================================================================

-- 1. Extend profiles with referral tracking columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by_code TEXT,
ADD COLUMN IF NOT EXISTS referred_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Function to generate random 8-character unique alphanumeric referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
        LOOP
            -- Generate 8-character uppercase alphanumeric code (e.g. ADIS92X4)
            new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
            SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO code_exists;
            EXIT WHEN NOT code_exists;
        END LOOP;
        NEW.referral_code := new_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger on profiles to automatically assign referral code upon signup
DROP TRIGGER IF EXISTS trg_generate_referral_code ON public.profiles;
CREATE TRIGGER trg_generate_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- 4. Backfill any existing profiles without referral codes
DO $$
DECLARE
    r RECORD;
    v_code TEXT;
BEGIN
    FOR r IN SELECT id FROM public.profiles WHERE referral_code IS NULL OR referral_code = '' LOOP
        v_code := UPPER(SUBSTRING(MD5(r.id::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
        UPDATE public.profiles SET referral_code = v_code WHERE id = r.id;
    END LOOP;
END $$;

-- 5. Dedicated Referral Conversions Table
CREATE TABLE IF NOT EXISTS public.referral_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referral_track TEXT NOT NULL CHECK (referral_track IN ('PARTNER', 'ADVERTISER')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'QUALIFIED', 'REWARDED', 'DISQUALIFIED')),
    reward_amount NUMERIC(14, 2) NOT NULL DEFAULT 500.00,
    qualifying_event_type TEXT CHECK (qualifying_event_type IN ('FIRST_PROOF_APPROVED', 'FIRST_CAMPAIGN_FUNDED')),
    qualifying_event_id TEXT, -- References campaign_id or proof_id
    reward_ledger_tx_id UUID REFERENCES public.ledger_transactions(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    qualified_at TIMESTAMPTZ,
    rewarded_at TIMESTAMPTZ,
    CONSTRAINT unique_referred_user UNIQUE (referred_user_id)
);

-- 6. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_referrer ON public.referral_conversions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_referred_user ON public.referral_conversions(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_status ON public.referral_conversions(status);

-- 7. Stored Procedure for Atomic Referral Reward Settlement
CREATE OR REPLACE FUNCTION public.settle_referral_reward(
    p_conversion_id UUID,
    p_qualifying_event_id TEXT,
    p_event_type TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_conversion RECORD;
    v_referrer_wallet RECORD;
    v_new_balance NUMERIC(14, 2);
    v_ledger_id UUID;
    v_referred_name TEXT;
BEGIN
    -- Lock conversion record
    SELECT * INTO v_conversion
    FROM public.referral_conversions
    WHERE id = p_conversion_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Referral conversion record not found');
    END IF;

    IF v_conversion.status = 'REWARDED' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Referral already rewarded');
    END IF;

    -- Fetch referee name for ledger description
    SELECT full_name INTO v_referred_name
    FROM public.profiles
    WHERE id = v_conversion.referred_user_id;

    -- Fetch or create referrer wallet
    SELECT * INTO v_referrer_wallet
    FROM public.wallets
    WHERE user_id = v_conversion.referrer_id
    FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO public.wallets (user_id, available_balance, pending_balance, currency)
        VALUES (v_conversion.referrer_id, v_conversion.reward_amount, 0.00, 'NGN')
        RETURNING * INTO v_referrer_wallet;
        v_new_balance := v_conversion.reward_amount;
    ELSE
        v_new_balance := v_referrer_wallet.available_balance + v_conversion.reward_amount;
        UPDATE public.wallets
        SET available_balance = v_new_balance,
            updated_at = NOW()
        WHERE id = v_referrer_wallet.id;
    END IF;

    -- Record credit transaction in double-entry ledger
    INSERT INTO public.ledger_transactions (
        wallet_id,
        user_id,
        transaction_type,
        amount,
        direction,
        balance_after,
        reference_type,
        description,
        status
    )
    VALUES (
        v_referrer_wallet.id,
        v_conversion.referrer_id,
        'REFERRAL_REWARD',
        v_conversion.reward_amount,
        'CREDIT',
        v_new_balance,
        'REFERRAL_PAYOUT',
        'Referral reward for verified ' || v_conversion.referral_track || ' (' || COALESCE(v_referred_name, 'Member') || ')',
        'COMPLETED'
    )
    RETURNING id INTO v_ledger_id;

    -- Mark conversion as REWARDED
    UPDATE public.referral_conversions
    SET status = 'REWARDED',
        qualifying_event_id = p_qualifying_event_id,
        qualifying_event_type = p_event_type,
        reward_ledger_tx_id = v_ledger_id,
        qualified_at = COALESCE(qualified_at, NOW()),
        rewarded_at = NOW()
    WHERE id = v_conversion.id;

    RETURN jsonb_build_object(
        'success', true,
        'reward_amount', v_conversion.reward_amount,
        'new_balance', v_new_balance,
        'ledger_id', v_ledger_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Enhance handle_new_user to capture referred_by_code from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role public.user_role;
    v_full_name TEXT;
    v_phone TEXT;
    v_ref_code TEXT;
    v_referrer RECORD;
    v_track TEXT;
    v_reward NUMERIC(14, 2);
BEGIN
    v_full_name := COALESCE(
        new.raw_user_meta_data->>'full_name',
        split_part(new.email, '@', 1)
    );
    v_phone := new.raw_user_meta_data->>'phone';
    v_ref_code := UPPER(NULLIF(TRIM(new.raw_user_meta_data->>'referred_by_code'), ''));

    BEGIN
        v_role := (new.raw_user_meta_data->>'role')::public.user_role;
    EXCEPTION WHEN OTHERS THEN
        v_role := 'COMMUNITY_PARTNER'::public.user_role;
    END;

    -- Lookup referrer if code provided
    IF v_ref_code IS NOT NULL THEN
        SELECT id, role INTO v_referrer
        FROM public.profiles
        WHERE referral_code = v_ref_code;
    END IF;

    -- Insert into public.profiles
    INSERT INTO public.profiles (
        id, email, full_name, phone, role, is_verified, referred_by_code, referred_by_id
    )
    VALUES (
        new.id,
        new.email,
        v_full_name,
        v_phone,
        v_role,
        FALSE,
        v_ref_code,
        v_referrer.id
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        referred_by_code = COALESCE(public.profiles.referred_by_code, EXCLUDED.referred_by_code),
        referred_by_id = COALESCE(public.profiles.referred_by_id, EXCLUDED.referred_by_id),
        updated_at = NOW();

    -- Create pending referral conversion record if valid referrer found
    IF v_referrer.id IS NOT NULL AND v_referrer.id <> new.id THEN
        v_track := CASE WHEN v_role = 'ADVERTISER' THEN 'ADVERTISER' ELSE 'PARTNER' END;
        v_reward := CASE WHEN v_role = 'ADVERTISER' THEN 1000.00 ELSE 500.00 END;

        INSERT INTO public.referral_conversions (
            referrer_id,
            referred_user_id,
            referral_track,
            status,
            reward_amount,
            qualifying_event_type
        )
        VALUES (
            v_referrer.id,
            new.id,
            v_track,
            'PENDING',
            v_reward,
            CASE WHEN v_track = 'ADVERTISER' THEN 'FIRST_CAMPAIGN_FUNDED' ELSE 'FIRST_PROOF_APPROVED' END
        )
        ON CONFLICT (referred_user_id) DO NOTHING;
    END IF;

    -- Provision wallet for the new user
    INSERT INTO public.wallets (user_id, available_balance, pending_balance, currency)
    VALUES (new.id, 0.00, 0.00, 'NGN')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

