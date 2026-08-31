-- ============================================================
-- WALLET LEDGER SYSTEM V2
-- Ensuring atomic balance updates and preventing double-spending
-- ============================================================

-- 1. Ensure wallets table is correctly structured
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    balance NUMERIC NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_deposit NUMERIC NOT NULL DEFAULT 0,
    total_withdraw NUMERIC NOT NULL DEFAULT 0,
    total_investment NUMERIC NOT NULL DEFAULT 0,
    total_earnings NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Refined Transaction Processing Trigger
CREATE OR REPLACE FUNCTION public.process_wallet_transaction_v2()
RETURNS TRIGGER AS $$
DECLARE
    v_wallet_id UUID;
    v_current_balance NUMERIC;
BEGIN
    -- 1. Get or Create Wallet
    SELECT id, balance INTO v_wallet_id, v_current_balance
    FROM public.wallets
    WHERE user_id = NEW.user_id
    FOR UPDATE; -- Lock the wallet row for atomicity

    IF v_wallet_id IS NULL THEN
        INSERT INTO public.wallets (user_id)
        VALUES (NEW.user_id)
        RETURNING id, balance INTO v_wallet_id, v_current_balance;
    END IF;

    -- Link transaction to wallet
    NEW.wallet_id := v_wallet_id;

    -- 2. Handle Debits (Deduct immediately to prevent double-spending)
    IF NEW.type = 'debit' THEN
        -- Check if enough balance exists
        IF v_current_balance < NEW.amount THEN
            RAISE EXCEPTION 'Insufficient wallet balance. Available: %, Requested: %', v_current_balance, NEW.amount;
        END IF;

        UPDATE public.wallets
        SET balance = balance - NEW.amount,
            total_withdraw = CASE WHEN NEW.description ILIKE '%withdraw%' THEN total_withdraw + NEW.amount ELSE total_withdraw END,
            total_investment = CASE WHEN NEW.description ILIKE '%invest%' THEN total_investment + NEW.amount ELSE total_investment END,
            updated_at = now()
        WHERE id = v_wallet_id;

        -- If it's a debit, we deduct immediately even if Pending (locks the funds)

    -- 3. Handle Credits (Only add on Completion)
    ELSIF NEW.type = 'credit' AND NEW.status = 'Completed' THEN
        UPDATE public.wallets
        SET balance = balance + NEW.amount,
            total_deposit = CASE WHEN NEW.description ILIKE '%deposit%' OR NEW.description ILIKE '%razorpay%' THEN total_deposit + NEW.amount ELSE total_deposit END,
            total_earnings = CASE WHEN NEW.description ILIKE '%earn%' OR NEW.description ILIKE '%return%' THEN total_earnings + NEW.amount ELSE total_earnings END,
            updated_at = now()
        WHERE id = v_wallet_id;
    END IF;

    -- 4. Sync back to legacy profiles table
    UPDATE public.profiles
    SET wallet_balance = (SELECT balance FROM public.wallets WHERE id = v_wallet_id),
        updated_at = now()
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
DROP TRIGGER IF EXISTS tr_process_wallet_tx ON public.wallet_transactions;
CREATE TRIGGER tr_process_wallet_tx
BEFORE INSERT ON public.wallet_transactions
FOR EACH ROW EXECUTE FUNCTION public.process_wallet_transaction_v2();

-- 5. Handle Transaction Status Updates (e.g. Rejecting a withdrawal)
CREATE OR REPLACE FUNCTION public.handle_transaction_update()
RETURNS TRIGGER AS $$
BEGIN
    -- If a transaction was Pending/Created and is now Failed/Rejected
    IF OLD.status != 'Failed' AND NEW.status = 'Failed' THEN
        -- If it was a debit, refund the balance
        IF NEW.type = 'debit' THEN
            UPDATE public.wallets
            SET balance = balance + NEW.amount,
                total_withdraw = CASE WHEN NEW.description ILIKE '%withdraw%' THEN total_withdraw - NEW.amount ELSE total_withdraw END,
                total_investment = CASE WHEN NEW.description ILIKE '%invest%' THEN total_investment - NEW.amount ELSE total_investment END,
                updated_at = now()
            WHERE id = NEW.wallet_id;

            -- Sync back to profiles
            UPDATE public.profiles SET wallet_balance = (SELECT balance FROM public.wallets WHERE id = NEW.wallet_id) WHERE id = NEW.user_id;
        END IF;

    -- If a credit transaction becomes Completed (and wasn't before)
    ELSIF OLD.status != 'Completed' AND NEW.status = 'Completed' THEN
        IF NEW.type = 'credit' THEN
            UPDATE public.wallets
            SET balance = balance + NEW.amount,
                total_deposit = CASE WHEN NEW.description ILIKE '%deposit%' OR NEW.description ILIKE '%razorpay%' THEN total_deposit + NEW.amount ELSE total_deposit END,
                total_earnings = CASE WHEN NEW.description ILIKE '%earn%' OR NEW.description ILIKE '%return%' THEN total_earnings + NEW.amount ELSE total_earnings END,
                updated_at = now()
            WHERE id = NEW.wallet_id;

            UPDATE public.profiles SET wallet_balance = (SELECT balance FROM public.wallets WHERE id = NEW.wallet_id) WHERE id = NEW.user_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_handle_tx_update ON public.wallet_transactions;
CREATE TRIGGER tr_handle_tx_update
AFTER UPDATE ON public.wallet_transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_transaction_update();
