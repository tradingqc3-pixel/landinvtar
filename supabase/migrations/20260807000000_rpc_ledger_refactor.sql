-- Refactoring RPCs to rely on the Ledger Trigger for balance updates
-- This prevents double-deduction and ensures atomicity

-- 1. Refactor invest_in_project
CREATE OR REPLACE FUNCTION public.invest_in_project(
  p_project_id uuid,
  p_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_project land_projects%ROWTYPE;
  v_investment_id uuid;
  v_new_balance numeric;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- ENFORCE KYC
  PERFORM public.check_kyc_verified(v_user_id);

  -- Get project details
  SELECT * INTO v_project
  FROM land_projects
  WHERE id = p_project_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found or inactive';
  END IF;

  IF p_amount < v_project.min_investment THEN
    RAISE EXCEPTION 'Amount % is below minimum investment of %', p_amount, v_project.min_investment;
  END IF;

  -- Create investment record (Status Pending initially until transaction completes)
  INSERT INTO investments (user_id, project_id, amount, roi_rate, status)
  VALUES (v_user_id, p_project_id, p_amount, v_project.expected_roi, 'Active')
  RETURNING id INTO v_investment_id;

  -- Create wallet debit transaction
  -- THE TRIGGER public.process_wallet_transaction_v2 WILL HANDLE BALANCE DEDUCTION HERE
  INSERT INTO wallet_transactions (user_id, type, description, amount, status, reference_id)
  VALUES (v_user_id, 'debit', 'Invested in ' || v_project.name, p_amount, 'Completed', v_investment_id);

  -- Update project funding stats
  UPDATE land_projects
  SET raised_funding = raised_funding + p_amount,
      investors_count = investors_count + 1,
      funding_progress = LEAST(100, ROUND((raised_funding + p_amount) / total_funding * 100, 1))
  WHERE id = p_project_id;

  -- Create success notification
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    v_user_id,
    'Investment Confirmed!',
    'Your investment of ₹' || to_char(p_amount, 'FM999,999,999') || ' in ' || v_project.name || ' has been confirmed.',
    'success'
  );

  SELECT balance INTO v_new_balance FROM public.wallets WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'investment_id', v_investment_id,
    'new_balance', v_new_balance,
    'project_name', v_project.name
  );
END;
$$;

-- 2. Refactor add_wallet_money
CREATE OR REPLACE FUNCTION public.add_wallet_money(
  p_amount numeric,
  p_method text DEFAULT 'UPI'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_new_balance numeric;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than 0';
  END IF;

  -- THE TRIGGER public.process_wallet_transaction_v2 WILL HANDLE BALANCE ADDITION HERE
  INSERT INTO wallet_transactions (user_id, type, description, amount, status)
  VALUES (v_user_id, 'credit', 'Added via ' || p_method, p_amount, 'Completed');

  SELECT balance INTO v_new_balance FROM public.wallets WHERE user_id = v_user_id;

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

-- 3. Refactor withdraw_wallet_money
CREATE OR REPLACE FUNCTION public.withdraw_wallet_money(
  p_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_new_balance numeric;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- ENFORCE KYC
  PERFORM public.check_kyc_verified(v_user_id);

  IF p_amount < 100 THEN
    RAISE EXCEPTION 'Minimum withdrawal amount is ₹100';
  END IF;

  -- THE TRIGGER public.process_wallet_transaction_v2 WILL HANDLE BALANCE DEDUCTION HERE (Locking funds)
  INSERT INTO wallet_transactions (user_id, type, description, amount, status)
  VALUES (v_user_id, 'debit', 'Withdrawal to bank account', p_amount, 'Pending');

  SELECT balance INTO v_new_balance FROM public.wallets WHERE user_id = v_user_id;

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;
