-- =========================================================================
-- ADISION — SUPABASE AUTH TRIGGER & AUTOMATIC PROFILE / WALLET PROVISIONING
-- Run this in Supabase SQL Editor to automatically initialize a profile
-- and wallet whenever a user signs up with email & password.
-- =========================================================================

-- 1. FUNCTION: Handle New User Registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role public.user_role;
    v_full_name TEXT;
    v_phone TEXT;
BEGIN
    -- Extract metadata passed during client-side signUp
    v_full_name := COALESCE(
        new.raw_user_meta_data->>'full_name',
        split_part(new.email, '@', 1)
    );
    v_phone := new.raw_user_meta_data->>'phone';

    -- Parse role safely, default to COMMUNITY_PARTNER
    BEGIN
        v_role := (new.raw_user_meta_data->>'role')::public.user_role;
    EXCEPTION WHEN OTHERS THEN
        v_role := 'COMMUNITY_PARTNER'::public.user_role;
    END;

    -- Insert into public.profiles
    INSERT INTO public.profiles (id, email, full_name, phone, role, is_verified)
    VALUES (
        new.id,
        new.email,
        v_full_name,
        v_phone,
        v_role,
        FALSE
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        updated_at = NOW();

    -- Provision wallet for the new user
    INSERT INTO public.wallets (user_id, available_balance, pending_balance, currency)
    VALUES (new.id, 0.00, 0.00, 'NGN')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TRIGGER on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. HELPER FUNCTION: Elevate Any Account to ADMIN
-- Example usage in SQL Editor: SELECT public.make_user_admin('your-email@example.com');
CREATE OR REPLACE FUNCTION public.make_user_admin(target_email TEXT)
RETURNS TEXT AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id
    FROM public.profiles
    WHERE LOWER(email) = LOWER(target_email);

    IF NOT FOUND THEN
        RETURN format('User with email %s not found in profiles. Make sure they have signed up first.', target_email);
    END IF;

    UPDATE public.profiles
    SET role = 'ADMIN',
        is_verified = TRUE,
        updated_at = NOW()
    WHERE id = v_user_id;

    RETURN format('Successfully elevated %s (ID: %s) to ADMIN role.', target_email, v_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
