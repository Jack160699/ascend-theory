-- =============================================================================
-- ASCEND THEORY PLATFORM — ADDITIVE MIGRATION (PHASE 3 PAYMENTS HARDENING)
-- Migration: 20260809000003_secure_payments_and_idempotency.sql
-- Description: Adds unique indexes for payment provider order IDs & event IDs.
--              Creates atomic PostgreSQL SECURITY DEFINER function to handle
--              authoritative payment capture & order status transition safely.
-- =============================================================================

-- 1. Unique indexes for idempotency and duplicate event prevention
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_order_id_unique 
  ON public.payments (provider_order_id) 
  WHERE provider_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_events_provider_event_id_unique 
  ON public.payment_events (provider_event_id) 
  WHERE provider_event_id IS NOT NULL;

-- 2. SECURITY DEFINER Atomic Payment Capture Function
CREATE OR REPLACE FUNCTION public.process_successful_payment(
  p_order_id UUID,
  p_provider_payment_id TEXT,
  p_provider_order_id TEXT,
  p_amount_paise BIGINT,
  p_currency TEXT,
  p_provider_event_id TEXT DEFAULT NULL,
  p_event_type TEXT DEFAULT 'payment_captured',
  p_payload JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_payment_id UUID;
  v_already_paid BOOLEAN := false;
BEGIN
  -- Fetch target order with lock
  SELECT id, status, payment_status, subtotal_paise, currency
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'order_not_found');
  END IF;

  -- Check if order is already paid
  IF v_order.status = 'paid' OR v_order.payment_status = 'captured' THEN
    v_already_paid := true;
  END IF;

  -- Verify currency match
  IF UPPER(v_order.currency) != UPPER(p_currency) THEN
    INSERT INTO public.payment_events (order_id, event_type, provider_event_id, details_json)
    VALUES (p_order_id, 'currency_mismatch', p_provider_event_id, jsonb_build_object(
      'expected_currency', v_order.currency,
      'received_currency', p_currency
    ));
    RETURN jsonb_build_object('ok', false, 'error', 'currency_mismatch');
  END IF;

  -- Verify amount match (with subtotal_paise comparison)
  IF v_order.subtotal_paise IS NOT NULL AND v_order.subtotal_paise != p_amount_paise THEN
    INSERT INTO public.payment_events (order_id, event_type, provider_event_id, details_json)
    VALUES (p_order_id, 'amount_mismatch', p_provider_event_id, jsonb_build_object(
      'expected_amount_paise', v_order.subtotal_paise,
      'received_amount_paise', p_amount_paise
    ));
    RETURN jsonb_build_object('ok', false, 'error', 'amount_mismatch');
  END IF;

  -- Record or update payment in payments table
  INSERT INTO public.payments (
    order_id,
    provider,
    provider_order_id,
    provider_payment_id,
    amount_paise,
    currency,
    status,
    captured_at
  )
  VALUES (
    p_order_id,
    'razorpay',
    p_provider_order_id,
    p_provider_payment_id,
    p_amount_paise,
    p_currency,
    'captured',
    now()
  )
  ON CONFLICT (provider_order_id) WHERE provider_order_id IS NOT NULL
  DO UPDATE SET
    provider_payment_id = EXCLUDED.provider_payment_id,
    status = 'captured',
    captured_at = COALESCE(public.payments.captured_at, now());

  SELECT id INTO v_payment_id
  FROM public.payments
  WHERE provider_order_id = p_provider_order_id;

  -- Transition order status authoritatively
  UPDATE public.orders
  SET
    status = 'paid',
    payment_status = 'captured',
    updated_at = now()
  WHERE id = p_order_id;

  -- Record audit event
  IF p_provider_event_id IS NOT NULL THEN
    INSERT INTO public.payment_events (
      order_id,
      payment_id,
      event_type,
      provider_event_id,
      details_json
    )
    VALUES (
      p_order_id,
      v_payment_id,
      p_event_type,
      p_provider_event_id,
      p_payload
    )
    ON CONFLICT (provider_event_id) WHERE provider_event_id IS NOT NULL
    DO NOTHING;
  ELSE
    INSERT INTO public.payment_events (
      order_id,
      payment_id,
      event_type,
      details_json
    )
    VALUES (
      p_order_id,
      v_payment_id,
      p_event_type,
      p_payload
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'order_id', p_order_id,
    'already_paid', v_already_paid,
    'payment_status', 'captured'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_successful_payment(UUID, TEXT, TEXT, BIGINT, TEXT, TEXT, TEXT, JSONB) TO authenticated, service_role;
