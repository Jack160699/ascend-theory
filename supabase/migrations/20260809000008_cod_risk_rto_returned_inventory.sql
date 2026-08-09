-- =============================================================================
-- ASCEND THEORY PLATFORM — ADDITIVE MIGRATION (PHASE 7 COD RISK, RTO + RETURNED INVENTORY REPAIR)
-- Migration: 20260809000008_cod_risk_rto_returned_inventory.sql
-- Description: Alters existing Phase 2 tables (cod_risk_profiles, returned_inventory),
--              extends orders with cod_status & advance fields, creates cod_advance_payments,
--              cod_otp_challenges, and delivery_outcome_events tables with RLS and privilege lockdown.
--              Adds transactional SECURITY DEFINER RPCs for COD decisions, OTP challenges,
--              advance captures, delivery outcomes, and atomic returned inventory reservations with row locking.
-- =============================================================================

-- 1. Requirement #2: Search path hygiene repair for live Phase 6 helper function
ALTER FUNCTION public.is_valid_fulfillment_status_transition(TEXT, TEXT)
  SET search_path = pg_catalog;

-- 2. Extend orders table with durable COD lifecycle & advance payment tracking
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cod_status TEXT DEFAULT 'NOT_COD',
  ADD COLUMN IF NOT EXISTS advance_required BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS advance_amount_paise BIGINT NOT NULL DEFAULT 0 CHECK (advance_amount_paise >= 0),
  ADD COLUMN IF NOT EXISTS advance_payment_id UUID,
  ADD COLUMN IF NOT EXISTS advance_status TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS cod_confirmation_token_hash TEXT;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_cod_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_cod_status_check CHECK (
  cod_status IN (
    'NOT_COD',
    'COD_PENDING_CONFIRMATION',
    'COD_OTP_PENDING',
    'COD_CONFIRMED',
    'COD_ADVANCE_REQUIRED',
    'COD_ADVANCE_PENDING',
    'COD_APPROVED',
    'COD_REJECTED',
    'COD_HELD',
    'COD_PREPAID_ONLY',
    'COD_EXPIRED'
  )
);

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_advance_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_advance_status_check CHECK (
  advance_status IN ('none', 'not_required', 'pending', 'captured', 'failed', 'refunded')
);

-- 3. Dedicated COD Advance Payments Table
CREATE TABLE IF NOT EXISTS public.cod_advance_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_order_id TEXT NOT NULL,
  provider_payment_id TEXT,
  provider_event_id TEXT,
  expected_amount_paise BIGINT NOT NULL CHECK (expected_amount_paise > 0),
  captured_amount_paise BIGINT CHECK (captured_amount_paise >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  captured_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT idx_unique_cod_advance_order_provider UNIQUE (order_id, provider_order_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cod_advance_payments_payment_id 
  ON public.cod_advance_payments(provider_payment_id) 
  WHERE provider_payment_id IS NOT NULL;

-- 4. ALTER Existing Phase 2 Table: cod_risk_profiles
-- Live Phase 2 schema has: id (UUID), customer_id (UUID NOT NULL), risk_score (INT), is_cod_eligible (BOOLEAN), notes (TEXT), created_at (TIMESTAMPTZ)
ALTER TABLE public.cod_risk_profiles ALTER COLUMN customer_id DROP NOT NULL;

ALTER TABLE public.cod_risk_profiles
  ADD COLUMN IF NOT EXISTS phone_normalized TEXT,
  ADD COLUMN IF NOT EXISTS successful_cod_deliveries INT NOT NULL DEFAULT 0 CHECK (successful_cod_deliveries >= 0),
  ADD COLUMN IF NOT EXISTS successful_prepaid_deliveries INT NOT NULL DEFAULT 0 CHECK (successful_prepaid_deliveries >= 0),
  ADD COLUMN IF NOT EXISTS cod_orders INT NOT NULL DEFAULT 0 CHECK (cod_orders >= 0),
  ADD COLUMN IF NOT EXISTS cod_confirmed_orders INT NOT NULL DEFAULT 0 CHECK (cod_confirmed_orders >= 0),
  ADD COLUMN IF NOT EXISTS rto_count INT NOT NULL DEFAULT 0 CHECK (rto_count >= 0),
  ADD COLUMN IF NOT EXISTS refused_count INT NOT NULL DEFAULT 0 CHECK (refused_count >= 0),
  ADD COLUMN IF NOT EXISTS cancelled_after_confirmation_count INT NOT NULL DEFAULT 0 CHECK (cancelled_after_confirmation_count >= 0),
  ADD COLUMN IF NOT EXISTS last_rto_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_successful_delivery_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS risk_band TEXT NOT NULL DEFAULT 'NEW_CUSTOMER',
  ADD COLUMN IF NOT EXISTS prepaid_only BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS manual_hold BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_cod_risk_profiles_phone 
  ON public.cod_risk_profiles(phone_normalized) 
  WHERE phone_normalized IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cod_risk_profiles_customer 
  ON public.cod_risk_profiles(customer_id);

-- 5. ALTER Existing Phase 2 Table: returned_inventory
-- Live Phase 2 schema has: id (UUID), return_id (UUID NOT NULL), variant_id (UUID), condition (TEXT), disposition (TEXT), created_at (TIMESTAMPTZ)
ALTER TABLE public.returned_inventory ALTER COLUMN return_id DROP NOT NULL;

ALTER TABLE public.returned_inventory
  ADD COLUMN IF NOT EXISTS source_order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_order_item_id UUID REFERENCES public.order_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fulfillment_id UUID REFERENCES public.fulfillments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS design_version INT,
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS size TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS manufacturing_identity_hash TEXT,
  ADD COLUMN IF NOT EXISTS manufacturing_snapshot_json JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS reuse_status TEXT NOT NULL DEFAULT 'REUSABLE',
  ADD COLUMN IF NOT EXISTS reuse_eligible BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS disposed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reused_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS replacement_order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.returned_inventory DROP CONSTRAINT IF EXISTS returned_inventory_reuse_status_check;
ALTER TABLE public.returned_inventory ADD CONSTRAINT returned_inventory_reuse_status_check CHECK (
  reuse_status IN ('AWAITING_RECEIPT', 'RECEIVED', 'INSPECTION_REQUIRED', 'REUSABLE', 'RESERVED', 'REUSED', 'DAMAGED', 'DISPOSED')
);

CREATE INDEX IF NOT EXISTS idx_returned_inventory_mfg_hash 
  ON public.returned_inventory(manufacturing_identity_hash, reuse_status);

-- 6. COD OTP Challenges Table
CREATE TABLE IF NOT EXISTS public.cod_otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  phone_normalized TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts INT NOT NULL DEFAULT 3 CHECK (max_attempts > 0),
  verified_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resend_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cod_otp_challenges_order 
  ON public.cod_otp_challenges(order_id, phone_normalized);

-- 7. Idempotent Delivery Outcome Events Table
CREATE TABLE IF NOT EXISTS public.delivery_outcome_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fulfillment_id UUID NOT NULL REFERENCES public.fulfillments(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider_event_id TEXT,
  outcome_type TEXT NOT NULL CHECK (outcome_type IN ('DELIVERED', 'RTO', 'REFUSED', 'RETURNED')),
  outcome_status TEXT NOT NULL DEFAULT 'processed',
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  details_json JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT idx_unique_fulfillment_outcome UNIQUE (fulfillment_id, outcome_type)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_delivery_outcome_events_provider_event 
  ON public.delivery_outcome_events(provider_event_id) 
  WHERE provider_event_id IS NOT NULL;

-- 8. Privilege Lockdown & RLS Configuration
ALTER TABLE public.cod_advance_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cod_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cod_otp_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_outcome_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returned_inventory ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.cod_advance_payments FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.cod_risk_profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.cod_otp_challenges FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.delivery_outcome_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.returned_inventory FROM PUBLIC, anon, authenticated;

GRANT ALL ON public.cod_advance_payments TO service_role;
GRANT ALL ON public.cod_risk_profiles TO service_role;
GRANT ALL ON public.cod_otp_challenges TO service_role;
GRANT ALL ON public.delivery_outcome_events TO service_role;
GRANT ALL ON public.returned_inventory TO service_role;

-- 9. Canonical COD Status Transition Validator
CREATE OR REPLACE FUNCTION public.is_valid_cod_status_transition(
  p_current_status TEXT,
  p_target_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF p_current_status = p_target_status THEN
    RETURN TRUE;
  END IF;

  -- Terminal states through normal transitions
  IF p_current_status IN ('COD_APPROVED', 'COD_PREPAID_ONLY', 'COD_REJECTED') THEN
    RETURN FALSE;
  END IF;

  RETURN CASE p_current_status
    WHEN 'NOT_COD' THEN FALSE
    WHEN 'COD_PENDING_CONFIRMATION' THEN p_target_status IN ('COD_OTP_PENDING', 'COD_CONFIRMED', 'COD_ADVANCE_REQUIRED', 'COD_APPROVED', 'COD_HELD', 'COD_PREPAID_ONLY', 'COD_REJECTED')
    WHEN 'COD_OTP_PENDING' THEN p_target_status IN ('COD_CONFIRMED', 'COD_ADVANCE_REQUIRED', 'COD_APPROVED', 'COD_HELD', 'COD_PREPAID_ONLY', 'COD_REJECTED', 'COD_EXPIRED')
    WHEN 'COD_CONFIRMED' THEN p_target_status IN ('COD_ADVANCE_REQUIRED', 'COD_APPROVED', 'COD_HELD', 'COD_PREPAID_ONLY', 'COD_REJECTED')
    WHEN 'COD_ADVANCE_REQUIRED' THEN p_target_status IN ('COD_ADVANCE_PENDING', 'COD_APPROVED', 'COD_HELD', 'COD_PREPAID_ONLY', 'COD_REJECTED', 'COD_EXPIRED')
    WHEN 'COD_ADVANCE_PENDING' THEN p_target_status IN ('COD_APPROVED', 'COD_HELD', 'COD_PREPAID_ONLY', 'COD_REJECTED', 'COD_EXPIRED')
    WHEN 'COD_HELD' THEN p_target_status IN ('COD_CONFIRMED', 'COD_ADVANCE_REQUIRED', 'COD_APPROVED', 'COD_PREPAID_ONLY', 'COD_REJECTED')
    WHEN 'COD_EXPIRED' THEN p_target_status IN ('COD_OTP_PENDING', 'COD_ADVANCE_PENDING')
    ELSE FALSE
  END;
END;
$$;

-- 10. Atomic SECURITY DEFINER RPC: apply_cod_decision_with_audit
CREATE OR REPLACE FUNCTION public.apply_cod_decision_with_audit(
  p_order_id TEXT,
  p_target_status TEXT,
  p_decision_reason TEXT,
  p_advance_required BOOLEAN DEFAULT FALSE,
  p_advance_amount_paise BIGINT DEFAULT 0,
  p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_order RECORD;
  v_old_status TEXT;
  v_phone TEXT;
BEGIN
  -- Lock order row FOR UPDATE
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  IF v_order.payment_method <> 'cod' THEN
    RAISE EXCEPTION 'Order % is not a Cash on Delivery order', p_order_id;
  END IF;

  v_old_status := COALESCE(v_order.cod_status, 'COD_PENDING_CONFIRMATION');

  IF NOT public.is_valid_cod_status_transition(v_old_status, p_target_status) THEN
    RAISE EXCEPTION 'Invalid COD status transition from % to % for order %', v_old_status, p_target_status, p_order_id;
  END IF;

  UPDATE public.orders
  SET cod_status = p_target_status,
      advance_required = p_advance_required,
      advance_amount_paise = p_advance_amount_paise,
      advance_status = CASE WHEN p_advance_required THEN 'pending' ELSE 'not_required' END,
      updated_at = now()
  WHERE id = p_order_id;

  -- Increment risk profile order counters
  v_phone := (v_order.shipping_address->>'phone');
  IF v_phone IS NOT NULL AND v_phone <> '' THEN
    INSERT INTO public.cod_risk_profiles (phone_normalized, cod_orders, cod_confirmed_orders, updated_at)
    VALUES (
      v_phone,
      1,
      CASE WHEN p_target_status IN ('COD_CONFIRMED', 'COD_APPROVED') THEN 1 ELSE 0 END,
      now()
    )
    ON CONFLICT (phone_normalized) DO UPDATE
    SET cod_orders = public.cod_risk_profiles.cod_orders + 1,
        cod_confirmed_orders = public.cod_risk_profiles.cod_confirmed_orders + 
          CASE WHEN p_target_status IN ('COD_CONFIRMED', 'COD_APPROVED') AND v_old_status NOT IN ('COD_CONFIRMED', 'COD_APPROVED') THEN 1 ELSE 0 END,
        updated_at = now();
  END IF;

  -- Insert audit log row inside same transaction
  INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, details_json, created_at)
  VALUES (
    p_admin_id,
    'APPLY_COD_DECISION',
    'ORDER',
    p_order_id,
    jsonb_build_object(
      'previous_status', v_old_status,
      'new_status', p_target_status,
      'reason', p_decision_reason,
      'advance_required', p_advance_required,
      'advance_amount_paise', p_advance_amount_paise
    ),
    now()
  );

  RETURN jsonb_build_object('ok', true, 'order_id', p_order_id, 'cod_status', p_target_status);
END;
$$;

-- 11. Atomic SECURITY DEFINER RPC: override_cod_status_with_audit (Owner/Admin Only)
CREATE OR REPLACE FUNCTION public.override_cod_status_with_audit(
  p_order_id TEXT,
  p_target_status TEXT,
  p_override_reason TEXT,
  p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_order RECORD;
  v_old_status TEXT;
BEGIN
  IF p_admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin ID is required for operational COD override';
  END IF;

  IF p_override_reason IS NULL OR trim(p_override_reason) = '' THEN
    RAISE EXCEPTION 'Mandatory override reason is required';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  v_old_status := COALESCE(v_order.cod_status, 'NOT_COD');

  UPDATE public.orders
  SET cod_status = p_target_status,
      updated_at = now()
  WHERE id = p_order_id;

  INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, details_json, created_at)
  VALUES (
    p_admin_id,
    'OVERRIDE_COD_STATUS',
    'ORDER',
    p_order_id,
    jsonb_build_object(
      'previous_status', v_old_status,
      'override_status', p_target_status,
      'reason', p_override_reason
    ),
    now()
  );

  RETURN jsonb_build_object('ok', true, 'order_id', p_order_id, 'cod_status', p_target_status);
END;
$$;

-- 12. Atomic SECURITY DEFINER RPC: verify_cod_otp_challenge_with_audit
CREATE OR REPLACE FUNCTION public.verify_cod_otp_challenge_with_audit(
  p_order_id TEXT,
  p_submitted_otp_hash TEXT,
  p_token_hash TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_order RECORD;
  v_challenge RECORD;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'order_not_found');
  END IF;

  IF p_token_hash IS NOT NULL AND v_order.cod_confirmation_token_hash IS NOT NULL THEN
    IF v_order.cod_confirmation_token_hash <> p_token_hash THEN
      RETURN jsonb_build_object('ok', false, 'error', 'invalid_confirmation_token');
    END IF;
  END IF;

  SELECT * INTO v_challenge
  FROM public.cod_otp_challenges
  WHERE order_id = p_order_id
    AND consumed_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_active_otp_challenge');
  END IF;

  IF v_challenge.consumed_at IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'otp_already_consumed');
  END IF;

  IF v_challenge.expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'otp_expired');
  END IF;

  IF v_challenge.attempts >= v_challenge.max_attempts THEN
    RETURN jsonb_build_object('ok', false, 'error', 'otp_max_attempts_exceeded');
  END IF;

  IF v_challenge.otp_hash <> p_submitted_otp_hash THEN
    UPDATE public.cod_otp_challenges
    SET attempts = attempts + 1
    WHERE id = v_challenge.id;

    RETURN jsonb_build_object('ok', false, 'error', 'invalid_otp', 'remaining_attempts', (v_challenge.max_attempts - (v_challenge.attempts + 1)));
  END IF;

  -- Success: Consume OTP atomically
  UPDATE public.cod_otp_challenges
  SET consumed_at = now(),
      verified_at = now()
  WHERE id = v_challenge.id;

  RETURN jsonb_build_object('ok', true, 'order_id', p_order_id, 'verified', true);
END;
$$;

-- 13. Atomic SECURITY DEFINER RPC: capture_cod_advance_with_audit
CREATE OR REPLACE FUNCTION public.capture_cod_advance_with_audit(
  p_order_id TEXT,
  p_provider_order_id TEXT,
  p_provider_payment_id TEXT,
  p_captured_amount_paise BIGINT,
  p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_order RECORD;
  v_advance_row RECORD;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'order_not_found');
  END IF;

  IF NOT v_order.advance_required THEN
    RETURN jsonb_build_object('ok', false, 'error', 'advance_not_required_for_order');
  END IF;

  IF v_order.cod_status NOT IN ('COD_ADVANCE_REQUIRED', 'COD_ADVANCE_PENDING') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'order_not_in_advance_pending_state');
  END IF;

  IF v_order.advance_amount_paise <> p_captured_amount_paise THEN
    RETURN jsonb_build_object('ok', false, 'error', 'captured_amount_mismatch');
  END IF;

  INSERT INTO public.cod_advance_payments (
    order_id, provider, provider_order_id, provider_payment_id, expected_amount_paise, captured_amount_paise, status, captured_at
  ) VALUES (
    p_order_id, 'razorpay', p_provider_order_id, p_provider_payment_id, v_order.advance_amount_paise, p_captured_amount_paise, 'captured', now()
  )
  RETURNING id INTO v_advance_row;

  UPDATE public.orders
  SET cod_status = 'COD_APPROVED',
      advance_status = 'captured',
      advance_payment_id = v_advance_row.id,
      updated_at = now()
  WHERE id = p_order_id;

  INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, details_json, created_at)
  VALUES (
    p_admin_id,
    'CAPTURE_COD_ADVANCE',
    'ORDER',
    p_order_id,
    jsonb_build_object(
      'provider_order_id', p_provider_order_id,
      'provider_payment_id', p_provider_payment_id,
      'captured_amount_paise', p_captured_amount_paise
    ),
    now()
  );

  RETURN jsonb_build_object('ok', true, 'order_id', p_order_id, 'cod_status', 'COD_APPROVED');
END;
$$;

-- 14. Atomic SECURITY DEFINER RPC: record_delivery_outcome_with_audit
CREATE OR REPLACE FUNCTION public.record_delivery_outcome_with_audit(
  p_fulfillment_id UUID,
  p_outcome_type TEXT,
  p_provider_event_id TEXT DEFAULT NULL,
  p_details_json JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_ful RECORD;
  v_order RECORD;
  v_phone TEXT;
  v_existing_event RECORD;
BEGIN
  -- Check idempotency guard
  SELECT * INTO v_existing_event
  FROM public.delivery_outcome_events
  WHERE fulfillment_id = p_fulfillment_id AND outcome_type = p_outcome_type;

  IF FOUND THEN
    RETURN jsonb_build_object('ok', true, 'alreadyProcessed', true, 'fulfillment_id', p_fulfillment_id);
  END IF;

  SELECT * INTO v_ful FROM public.fulfillments WHERE id = p_fulfillment_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'fulfillment_not_found');
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = v_ful.order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'order_not_found');
  END IF;

  INSERT INTO public.delivery_outcome_events (
    fulfillment_id, order_id, provider_event_id, outcome_type, outcome_status, details_json, processed_at
  ) VALUES (
    p_fulfillment_id, v_ful.order_id, p_provider_event_id, p_outcome_type, 'processed', p_details_json, now()
  );

  v_phone := (v_order.shipping_address->>'phone');

  IF v_phone IS NOT NULL AND v_phone <> '' THEN
    IF v_order.payment_method = 'cod' THEN
      INSERT INTO public.cod_risk_profiles (
        phone_normalized, successful_cod_deliveries, rto_count, refused_count, last_successful_delivery_at, last_rto_at, updated_at
      ) VALUES (
        v_phone,
        CASE WHEN p_outcome_type = 'DELIVERED' THEN 1 ELSE 0 END,
        CASE WHEN p_outcome_type IN ('RTO', 'RETURNED') THEN 1 ELSE 0 END,
        CASE WHEN p_outcome_type = 'REFUSED' THEN 1 ELSE 0 END,
        CASE WHEN p_outcome_type = 'DELIVERED' THEN now() ELSE NULL END,
        CASE WHEN p_outcome_type IN ('RTO', 'RETURNED', 'REFUSED') THEN now() ELSE NULL END,
        now()
      )
      ON CONFLICT (phone_normalized) DO UPDATE
      SET successful_cod_deliveries = CASE WHEN p_outcome_type = 'DELIVERED' THEN public.cod_risk_profiles.successful_cod_deliveries + 1 ELSE public.cod_risk_profiles.successful_cod_deliveries END,
          rto_count = CASE WHEN p_outcome_type IN ('RTO', 'RETURNED') THEN public.cod_risk_profiles.rto_count + 1 ELSE public.cod_risk_profiles.rto_count END,
          refused_count = CASE WHEN p_outcome_type = 'REFUSED' THEN public.cod_risk_profiles.refused_count + 1 ELSE public.cod_risk_profiles.refused_count END,
          last_successful_delivery_at = CASE WHEN p_outcome_type = 'DELIVERED' THEN now() ELSE public.cod_risk_profiles.last_successful_delivery_at END,
          last_rto_at = CASE WHEN p_outcome_type IN ('RTO', 'RETURNED', 'REFUSED') THEN now() ELSE public.cod_risk_profiles.last_rto_at END,
          updated_at = now();
    ELSE
      -- Prepaid order delivery outcome -> updates successful_prepaid_deliveries, NOT successful_cod_deliveries
      INSERT INTO public.cod_risk_profiles (
        phone_normalized, successful_prepaid_deliveries, last_successful_delivery_at, updated_at
      ) VALUES (
        v_phone,
        CASE WHEN p_outcome_type = 'DELIVERED' THEN 1 ELSE 0 END,
        CASE WHEN p_outcome_type = 'DELIVERED' THEN now() ELSE NULL END,
        now()
      )
      ON CONFLICT (phone_normalized) DO UPDATE
      SET successful_prepaid_deliveries = CASE WHEN p_outcome_type = 'DELIVERED' THEN public.cod_risk_profiles.successful_prepaid_deliveries + 1 ELSE public.cod_risk_profiles.successful_prepaid_deliveries END,
          last_successful_delivery_at = CASE WHEN p_outcome_type = 'DELIVERED' THEN now() ELSE public.cod_risk_profiles.last_successful_delivery_at END,
          updated_at = now();
    END IF;
  END IF;

  RETURN jsonb_build_object('ok', true, 'alreadyProcessed', false, 'fulfillment_id', p_fulfillment_id);
END;
$$;

-- 15. Atomic SECURITY DEFINER RPC: reserve_matching_returned_inventory_with_audit
CREATE OR REPLACE FUNCTION public.reserve_matching_returned_inventory_with_audit(
  p_order_id TEXT,
  p_order_item_id UUID,
  p_manufacturing_hash TEXT,
  p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_order RECORD;
  v_inv RECORD;
BEGIN
  -- Lock replacement order FOR UPDATE
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'replacement_order_not_found');
  END IF;

  -- Verify replacement order payment gate
  IF v_order.payment_method = 'cod' THEN
    IF COALESCE(v_order.cod_status, 'NOT_COD') <> 'COD_APPROVED' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'replacement_cod_order_not_approved');
    END IF;
  ELSE
    IF COALESCE(v_order.payment_status, 'unpaid') <> 'captured' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'replacement_prepaid_order_unpaid');
    END IF;
  END IF;

  -- Select matching REUSABLE inventory item with FOR UPDATE SKIP LOCKED
  SELECT * INTO v_inv
  FROM public.returned_inventory
  WHERE reuse_status = 'REUSABLE'
    AND reuse_eligible = true
    AND manufacturing_identity_hash = p_manufacturing_hash
  ORDER BY received_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_matching_returned_inventory_available');
  END IF;

  UPDATE public.returned_inventory
  SET reuse_status = 'RESERVED',
      replacement_order_id = p_order_id,
      updated_at = now()
  WHERE id = v_inv.id;

  INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, details_json, created_at)
  VALUES (
    p_admin_id,
    'RESERVE_RETURNED_INVENTORY',
    'RETURNED_INVENTORY',
    v_inv.id::text,
    jsonb_build_object(
      'replacement_order_id', p_order_id,
      'order_item_id', p_order_item_id,
      'manufacturing_hash', p_manufacturing_hash
    ),
    now()
  );

  RETURN jsonb_build_object('ok', true, 'reserved_item_id', v_inv.id, 'replacement_order_id', p_order_id);
END;
$$;

-- Revoke RPC execution privileges from PUBLIC/anon/authenticated and grant to service_role ONLY
REVOKE EXECUTE ON FUNCTION public.is_valid_cod_status_transition(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_cod_decision_with_audit(TEXT, TEXT, TEXT, BOOLEAN, BIGINT, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.override_cod_status_with_audit(TEXT, TEXT, TEXT, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.verify_cod_otp_challenge_with_audit(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.capture_cod_advance_with_audit(TEXT, TEXT, TEXT, BIGINT, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_delivery_outcome_with_audit(UUID, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reserve_matching_returned_inventory_with_audit(TEXT, UUID, TEXT, UUID) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.is_valid_cod_status_transition(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_cod_decision_with_audit(TEXT, TEXT, TEXT, BOOLEAN, BIGINT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.override_cod_status_with_audit(TEXT, TEXT, TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_cod_otp_challenge_with_audit(TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.capture_cod_advance_with_audit(TEXT, TEXT, TEXT, BIGINT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_delivery_outcome_with_audit(UUID, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.reserve_matching_returned_inventory_with_audit(TEXT, UUID, TEXT, UUID) TO service_role;
