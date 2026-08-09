-- =============================================================================
-- ASCEND THEORY PLATFORM — ADDITIVE MIGRATION (PHASE 7 COD RISK, RTO + RETURNED INVENTORY)
-- Migration: 20260809000008_cod_risk_rto_returned_inventory.sql
-- Description: Extends orders table with durable cod_status & advance fields.
--              Creates cod_risk_profiles, cod_otp_challenges, delivery_outcome_events,
--              and returned_inventory tables with RLS and privilege lockdown.
--              Adds search_path hygiene for Phase 6 status helper additively.
--              Adds transactional SECURITY DEFINER RPCs for COD decisions, OTP challenges,
--              delivery outcomes, and atomic returned inventory reservations with row locking.
-- =============================================================================

-- 1. Requirement #1: Additive hygiene repair for live Phase 6 helper function
ALTER FUNCTION public.is_valid_fulfillment_status_transition(TEXT, TEXT)
  SET search_path = pg_catalog;

-- 2. Requirement #2: Extend orders table with durable COD lifecycle & advance payment tracking
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cod_status TEXT DEFAULT 'NOT_COD',
  ADD COLUMN IF NOT EXISTS advance_required BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS advance_amount_paise INT NOT NULL DEFAULT 0 CHECK (advance_amount_paise >= 0),
  ADD COLUMN IF NOT EXISTS advance_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS advance_status TEXT DEFAULT 'not_required';

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
  advance_status IN ('not_required', 'pending', 'captured', 'failed', 'refunded')
);

-- 3. Requirement #5: COD Risk Profiles Table
CREATE TABLE IF NOT EXISTS public.cod_risk_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT,
  phone_normalized TEXT UNIQUE NOT NULL,
  successful_cod_deliveries INT NOT NULL DEFAULT 0 CHECK (successful_cod_deliveries >= 0),
  successful_prepaid_deliveries INT NOT NULL DEFAULT 0 CHECK (successful_prepaid_deliveries >= 0),
  cod_orders INT NOT NULL DEFAULT 0 CHECK (cod_orders >= 0),
  cod_confirmed_orders INT NOT NULL DEFAULT 0 CHECK (cod_confirmed_orders >= 0),
  rto_count INT NOT NULL DEFAULT 0 CHECK (rto_count >= 0),
  refused_count INT NOT NULL DEFAULT 0 CHECK (refused_count >= 0),
  cancelled_after_confirmation_count INT NOT NULL DEFAULT 0 CHECK (cancelled_after_confirmation_count >= 0),
  last_rto_at TIMESTAMPTZ,
  last_successful_delivery_at TIMESTAMPTZ,
  risk_score INT NOT NULL DEFAULT 0,
  risk_band TEXT NOT NULL DEFAULT 'NEW_CUSTOMER' CHECK (risk_band IN ('NEW_CUSTOMER', 'TRUSTED_REPEAT', 'NORMAL', 'HIGH_RISK', 'PREPAID_ONLY')),
  prepaid_only BOOLEAN NOT NULL DEFAULT false,
  manual_hold BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Requirement #9: COD OTP Challenges Table
CREATE TABLE IF NOT EXISTS public.cod_otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  phone_normalized TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempt_count INT NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  max_attempts INT NOT NULL DEFAULT 3 CHECK (max_attempts > 0),
  verified_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Requirement #21: Idempotent Delivery Outcome Events Table
CREATE TABLE IF NOT EXISTS public.delivery_outcome_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fulfillment_id UUID NOT NULL REFERENCES public.fulfillments(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  outcome_type TEXT NOT NULL CHECK (outcome_type IN ('DELIVERED', 'RTO', 'REFUSED', 'RETURNED')),
  outcome_status TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  details_json JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT idx_unique_fulfillment_outcome UNIQUE (fulfillment_id, outcome_type)
);

-- 6. Requirement #22, #23: Returned Inventory Table
CREATE TABLE IF NOT EXISTS public.returned_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  source_order_item_id TEXT,
  fulfillment_id UUID REFERENCES public.fulfillments(id) ON DELETE SET NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  design_id TEXT NOT NULL,
  design_version INT NOT NULL DEFAULT 1 CHECK (design_version > 0),
  sku TEXT NOT NULL,
  size TEXT,
  color TEXT,
  condition TEXT NOT NULL DEFAULT 'NEW_UNWORN' CHECK (condition IN ('NEW_UNWORN', 'LIKE_NEW', 'MINOR_DEFECT', 'DAMAGED')),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  age_days INT NOT NULL DEFAULT 0 CHECK (age_days >= 0),
  reuse_status TEXT NOT NULL DEFAULT 'AWAITING_RECEIPT' CHECK (reuse_status IN ('AWAITING_RECEIPT', 'RECEIVED', 'INSPECTION_REQUIRED', 'REUSABLE', 'RESERVED', 'REUSED', 'DAMAGED', 'DISPOSED')),
  reuse_eligible BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  disposed_at TIMESTAMPTZ,
  reused_at TIMESTAMPTZ,
  replacement_order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_orders_cod_status ON public.orders(cod_status);
CREATE INDEX IF NOT EXISTS idx_cod_risk_profiles_phone ON public.cod_risk_profiles(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_cod_risk_profiles_customer ON public.cod_risk_profiles(customer_id);
CREATE INDEX IF NOT EXISTS idx_cod_otp_challenges_order ON public.cod_otp_challenges(order_id);
CREATE INDEX IF NOT EXISTS idx_cod_otp_challenges_phone ON public.cod_otp_challenges(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_delivery_outcome_events_fulfillment ON public.delivery_outcome_events(fulfillment_id);
CREATE INDEX IF NOT EXISTS idx_returned_inventory_product_variant ON public.returned_inventory(product_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_returned_inventory_design ON public.returned_inventory(design_id, design_version);
CREATE INDEX IF NOT EXISTS idx_returned_inventory_status ON public.returned_inventory(reuse_status);

-- 7. PRIVILEGE & RLS LOCKDOWN (Requirement #29)

REVOKE ALL ON public.cod_risk_profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.cod_otp_challenges FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.delivery_outcome_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.returned_inventory FROM PUBLIC, anon, authenticated;

GRANT ALL ON public.cod_risk_profiles TO service_role;
GRANT ALL ON public.cod_otp_challenges TO service_role;
GRANT ALL ON public.delivery_outcome_events TO service_role;
GRANT ALL ON public.returned_inventory TO service_role;

ALTER TABLE public.cod_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cod_otp_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_outcome_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returned_inventory ENABLE ROW LEVEL SECURITY;

-- Admin RLS Policies (owner, admin, support for READ; owner, admin for WRITE)
CREATE POLICY "Admin read cod_risk_profiles" ON public.cod_risk_profiles
  FOR SELECT TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'support']));

CREATE POLICY "Admin write cod_risk_profiles" ON public.cod_risk_profiles
  FOR ALL TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']))
  WITH CHECK (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']));

CREATE POLICY "Admin read delivery_outcome_events" ON public.delivery_outcome_events
  FOR SELECT TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'support']));

CREATE POLICY "Admin write delivery_outcome_events" ON public.delivery_outcome_events
  FOR ALL TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']))
  WITH CHECK (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']));

CREATE POLICY "Admin read returned_inventory" ON public.returned_inventory
  FOR SELECT TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'support']));

CREATE POLICY "Admin write returned_inventory" ON public.returned_inventory
  FOR ALL TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']))
  WITH CHECK (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']));

-- 8. STATUS TRANSITION GRAPH VALIDATION HELPER (Requirement #12)
CREATE OR REPLACE FUNCTION public.is_valid_cod_status_transition(
  p_current_status TEXT,
  p_next_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SET search_path = pg_catalog
AS $$
BEGIN
  IF p_current_status = p_next_status THEN
    RETURN true;
  END IF;

  IF p_current_status = 'COD_APPROVED' AND p_next_status != 'COD_APPROVED' THEN
    RETURN false;
  END IF;

  CASE p_current_status
    WHEN 'NOT_COD' THEN
      RETURN false;
    WHEN 'COD_PENDING_CONFIRMATION' THEN
      RETURN p_next_status IN ('COD_OTP_PENDING', 'COD_CONFIRMED', 'COD_ADVANCE_REQUIRED', 'COD_APPROVED', 'COD_HELD', 'COD_REJECTED', 'COD_PREPAID_ONLY');
    WHEN 'COD_OTP_PENDING' THEN
      RETURN p_next_status IN ('COD_CONFIRMED', 'COD_EXPIRED', 'COD_REJECTED', 'COD_HELD');
    WHEN 'COD_CONFIRMED' THEN
      RETURN p_next_status IN ('COD_ADVANCE_REQUIRED', 'COD_ADVANCE_PENDING', 'COD_APPROVED', 'COD_HELD', 'COD_REJECTED');
    WHEN 'COD_ADVANCE_REQUIRED' THEN
      RETURN p_next_status IN ('COD_ADVANCE_PENDING', 'COD_APPROVED', 'COD_REJECTED', 'COD_HELD');
    WHEN 'COD_ADVANCE_PENDING' THEN
      RETURN p_next_status IN ('COD_APPROVED', 'COD_REJECTED', 'COD_HELD');
    WHEN 'COD_HELD' THEN
      RETURN p_next_status IN ('COD_APPROVED', 'COD_REJECTED', 'COD_PREPAID_ONLY', 'COD_ADVANCE_REQUIRED');
    WHEN 'COD_REJECTED' THEN
      RETURN p_next_status IN ('COD_HELD', 'COD_APPROVED');
    WHEN 'COD_PREPAID_ONLY' THEN
      RETURN p_next_status IN ('COD_APPROVED', 'COD_HELD');
    WHEN 'COD_EXPIRED' THEN
      RETURN p_next_status IN ('COD_OTP_PENDING', 'COD_REJECTED');
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- 9. TRANSACTIONAL SECURITY DEFINER RPCs (Requirement #11 & #25)

-- 9a. Atomic Returned Inventory Reservation RPC with Row Locking (Requirement #25)
CREATE OR REPLACE FUNCTION public.reserve_returned_inventory_with_audit(
  p_inventory_id UUID,
  p_replacement_order_id TEXT,
  p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
  v_eligible BOOLEAN;
BEGIN
  SELECT reuse_status, reuse_eligible INTO v_status, v_eligible
    FROM public.returned_inventory
   WHERE id = p_inventory_id
     FOR UPDATE SKIP LOCKED;

  IF v_status IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'inventory_unit_locked_or_not_found');
  END IF;

  IF v_status != 'REUSABLE' OR NOT COALESCE(v_eligible, false) THEN
    RETURN jsonb_build_object('ok', false, 'error', format('inventory_not_reusable: current status is %s', v_status));
  END IF;

  UPDATE public.returned_inventory
     SET reuse_status = 'RESERVED',
         replacement_order_id = p_replacement_order_id,
         updated_at = now()
   WHERE id = p_inventory_id;

  IF p_admin_id IS NOT NULL THEN
    INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, details_json)
    VALUES (
      p_admin_id,
      'returned_inventory_reserved',
      'returned_inventory',
      p_inventory_id::TEXT,
      jsonb_build_object('replacement_order_id', p_replacement_order_id)
    );
  END IF;

  RETURN jsonb_build_object('ok', true, 'inventory_id', p_inventory_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_returned_inventory_with_audit(UUID, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_returned_inventory_with_audit(UUID, TEXT, UUID) TO service_role;

-- 9b. Atomic Delivery Outcome Event RPC (Requirement #20, #21)
CREATE OR REPLACE FUNCTION public.record_delivery_outcome_with_audit(
  p_fulfillment_id UUID,
  p_order_id TEXT,
  p_outcome_type TEXT,
  p_outcome_status TEXT,
  p_phone_normalized TEXT,
  p_details_json JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_already_processed UUID;
BEGIN
  SELECT id INTO v_already_processed
    FROM public.delivery_outcome_events
   WHERE fulfillment_id = p_fulfillment_id AND outcome_type = p_outcome_type
   LIMIT 1;

  IF v_already_processed IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'already_processed', true);
  END IF;

  INSERT INTO public.delivery_outcome_events (fulfillment_id, order_id, outcome_type, outcome_status, details_json)
  VALUES (p_fulfillment_id, p_order_id, p_outcome_type, p_outcome_status, p_details_json);

  -- Transactionally update COD risk profile if phone_normalized is present
  IF p_phone_normalized IS NOT NULL AND p_phone_normalized != '' THEN
    INSERT INTO public.cod_risk_profiles (phone_normalized, successful_cod_deliveries, last_successful_delivery_at, updated_at)
    VALUES (
      p_phone_normalized,
      CASE WHEN p_outcome_type = 'DELIVERED' THEN 1 ELSE 0 END,
      CASE WHEN p_outcome_type = 'DELIVERED' THEN now() ELSE NULL END,
      now()
    )
    ON CONFLICT (phone_normalized) DO UPDATE
    SET successful_cod_deliveries = CASE WHEN p_outcome_type = 'DELIVERED' THEN public.cod_risk_profiles.successful_cod_deliveries + 1 ELSE public.cod_risk_profiles.successful_cod_deliveries END,
        rto_count = CASE WHEN p_outcome_type IN ('RTO', 'RETURNED') THEN public.cod_risk_profiles.rto_count + 1 ELSE public.cod_risk_profiles.rto_count END,
        refused_count = CASE WHEN p_outcome_type = 'REFUSED' THEN public.cod_risk_profiles.refused_count + 1 ELSE public.cod_risk_profiles.refused_count END,
        last_successful_delivery_at = CASE WHEN p_outcome_type = 'DELIVERED' THEN now() ELSE public.cod_risk_profiles.last_successful_delivery_at END,
        last_rto_at = CASE WHEN p_outcome_type IN ('RTO', 'RETURNED', 'REFUSED') THEN now() ELSE public.cod_risk_profiles.last_rto_at END,
        updated_at = now();
  END IF;

  RETURN jsonb_build_object('ok', true, 'already_processed', false);
EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object('ok', true, 'already_processed', true);
WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

REVOKE ALL ON FUNCTION public.record_delivery_outcome_with_audit(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_delivery_outcome_with_audit(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;
