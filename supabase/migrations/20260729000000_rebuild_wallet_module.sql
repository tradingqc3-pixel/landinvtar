-- ============================================================
-- WALLET MODULE REBUILD
-- ============================================================

-- 1. Wallets Table
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

-- 2. Auto-creation trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach to profiles creation
DROP TRIGGER IF EXISTS tr_on_profile_created_wallet ON public.profiles;
CREATE TRIGGER tr_on_profile_created_wallet
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- 3. Initialize wallets for existing users
INSERT INTO public.wallets (user_id, balance)
SELECT id, COALESCE(wallet_balance, 0) FROM public.profiles
ON CONFLICT (user_id) DO UPDATE SET balance = EXCLUDED.balance;

-- 4. Update Wallet Transactions to link to Wallet ID
ALTER TABLE public.wallet_transactions ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES public.wallets(id);

-- 5. Trigger to update balance and aggregates on transaction completion
CREATE OR REPLACE FUNCTION public.process_wallet_transaction()
RETURNS TRIGGER AS $$
DECLARE
    v_wallet_id UUID;
BEGIN
    -- Get wallet ID
    SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = NEW.user_id;

    IF v_wallet_id IS NULL THEN
        -- Auto-create if somehow missing
        INSERT INTO public.wallets (user_id) VALUES (NEW.user_id) RETURNING id INTO v_wallet_id;
    END IF;

    -- Update record with wallet_id
    NEW.wallet_id := v_wallet_id;

    -- Only process Completed transactions for balance updates
    IF NEW.status = 'Completed' THEN
        IF NEW.type = 'credit' THEN
            UPDATE public.wallets
            SET balance = balance + NEW.amount,
                total_deposit = CASE WHEN NEW.description ILIKE '%deposit%' OR NEW.description ILIKE '%razorpay%' THEN total_deposit + NEW.amount ELSE total_deposit END,
                total_earnings = CASE WHEN NEW.description ILIKE '%earn%' OR NEW.description ILIKE '%return%' THEN total_earnings + NEW.amount ELSE total_earnings END,
                updated_at = now()
            WHERE id = v_wallet_id;
        ELSIF NEW.type = 'debit' THEN
            UPDATE public.wallets
            SET balance = balance - NEW.amount,
                total_withdraw = CASE WHEN NEW.description ILIKE '%withdraw%' THEN total_withdraw + NEW.amount ELSE total_withdraw END,
                total_investment = CASE WHEN NEW.description ILIKE '%invest%' THEN total_investment + NEW.amount ELSE total_investment END,
                updated_at = now()
            WHERE id = v_wallet_id;
        END IF;

        -- Sync back to profiles for legacy support if needed
        UPDATE public.profiles SET wallet_balance = (SELECT balance FROM public.wallets WHERE id = v_wallet_id) WHERE id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_process_wallet_tx ON public.wallet_transactions;
CREATE TRIGGER tr_process_wallet_tx
BEFORE INSERT ON public.wallet_transactions
FOR EACH ROW EXECUTE FUNCTION public.process_wallet_transaction();

-- 6. Updated Atomic Confirmation Function
CREATE OR REPLACE FUNCTION public.confirm_razorpay_payment(
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_razorpay_signature text,
  p_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_order_id uuid;
  v_new_balance numeric;
BEGIN
  SELECT user_id, id INTO v_user_id, v_order_id
  FROM payment_orders
  WHERE razorpay_order_id = p_razorpay_order_id AND status = 'created';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active order not found or already processed';
  END IF;

  UPDATE payment_orders
  SET razorpay_payment_id = p_razorpay_payment_id,
      razorpay_signature = p_razorpay_signature,
      status = 'paid',
      updated_at = now()
  WHERE id = v_order_id;

  -- Create transaction (trigger will handle wallet update)
  INSERT INTO wallet_transactions (user_id, type, description, amount, status, reference_id)
  VALUES (v_user_id, 'credit', 'Added via Razorpay', p_amount, 'Completed', v_order_id);

  SELECT balance INTO v_new_balance FROM wallets WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance
  );
END;
$$;

-- 7. RLS Policies
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to view all
CREATE POLICY "Admins can view all wallets" ON public.wallets FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)));
