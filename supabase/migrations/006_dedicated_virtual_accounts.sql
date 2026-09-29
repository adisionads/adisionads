-- =========================================================================
-- ADISION — MIGRATION 006: DEDICATED PERSONAL VIRTUAL BANK ACCOUNTS
-- Permanent virtual accounts per user for 24/7 wallet funding with custom names
-- =========================================================================

-- 1. Create user_virtual_accounts table
CREATE TABLE IF NOT EXISTS public.user_virtual_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    bank_code TEXT,
    account_number TEXT UNIQUE NOT NULL,
    account_name TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'POCKETFI',
    reference TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant webhook lookup by account number
CREATE INDEX IF NOT EXISTS idx_user_virtual_accounts_acc_num 
ON public.user_virtual_accounts(account_number);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_user_virtual_accounts_user_id 
ON public.user_virtual_accounts(user_id);

-- 2. Row Level Security (RLS)
ALTER TABLE public.user_virtual_accounts ENABLE ROW LEVEL SECURITY;

-- Users can read their own virtual account
DROP POLICY IF EXISTS "Users can view their own virtual account" ON public.user_virtual_accounts;
CREATE POLICY "Users can view their own virtual account"
    ON public.user_virtual_accounts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins / Service Role have full access
DROP POLICY IF EXISTS "Service role has full access to virtual accounts" ON public.user_virtual_accounts;
CREATE POLICY "Service role has full access to virtual accounts"
    ON public.user_virtual_accounts
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- 3. Stored Procedure: Atomic Deposit Settlement for Dedicated Accounts
CREATE OR REPLACE FUNCTION public.credit_dedicated_virtual_account_deposit(
    p_account_number TEXT,
    p_amount NUMERIC,
    p_payment_reference TEXT,
    p_provider TEXT DEFAULT 'POCKETFI'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_account RECORD;
    v_wallet RECORD;
    v_new_balance NUMERIC;
    v_tx_id UUID;
    v_already_processed BOOLEAN;
BEGIN
    -- 1. Find the dedicated virtual account
    SELECT * INTO v_account
    FROM public.user_virtual_accounts
    WHERE account_number = p_account_number
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Dedicated virtual account not found for account: ' || p_account_number
        );
    END IF;

    -- 2. Check for duplicate/already processed transaction (Idempotency)
    SELECT EXISTS (
        SELECT 1 FROM public.ledger_transactions
        WHERE reference_id::text = p_payment_reference
           OR description ILIKE '%' || p_payment_reference || '%'
    ) INTO v_already_processed;

    IF v_already_processed THEN
        RETURN jsonb_build_object(
            'success', TRUE,
            'message', 'Deposit already processed (Idempotent)',
            'account_number', p_account_number,
            'user_id', v_account.user_id
        );
    END IF;

    -- 3. Fetch or initialize the user's wallet with row locking
    SELECT * INTO v_wallet
    FROM public.wallets
    WHERE user_id = v_account.user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO public.wallets (user_id, available_balance, pending_balance, currency)
        VALUES (v_account.user_id, p_amount, 0, 'NGN')
        RETURNING * INTO v_wallet;
        v_new_balance := p_amount;
    ELSE
        v_new_balance := v_wallet.available_balance + p_amount;
        UPDATE public.wallets
        SET available_balance = v_new_balance,
            updated_at = NOW()
        WHERE id = v_wallet.id;
    END IF;

    -- 4. Record immutable ledger transaction
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
    ) VALUES (
        v_wallet.id,
        v_account.user_id,
        'DEPOSIT',
        p_amount,
        'CREDIT',
        v_new_balance,
        p_provider || '_DEDICATED_DEPOSIT',
        'Direct deposit to ' || v_account.account_name || ' (' || v_account.bank_name || ' ' || p_account_number || ') | Ref: ' || p_payment_reference,
        'COMPLETED'
    ) RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Wallet credited successfully',
        'user_id', v_account.user_id,
        'wallet_id', v_wallet.id,
        'transaction_id', v_tx_id,
        'amount', p_amount,
        'balance_after', v_new_balance
    );
END;
$$;
