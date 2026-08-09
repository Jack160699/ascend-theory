-- =============================================================================
-- ASCEND THEORY PLATFORM — ADDITIVE MIGRATION (PHASE 6 QIKINK FULFILMENT INTEGRATION)
-- Migration: 20260809000007_qikink_fulfilment.sql
-- Description: Extends fulfillments, fulfillment_events, and shipments tables.
--              Adds immutable snapshot storage, idempotency tracking, status normalization,
--              reconciliation fields, and SECURITY DEFINER atomic RPCs for fulfillment logic.
-- =============================================================================

-- 1. Extend fulfillments table with operational & provider tracking columns
ALTER TABLE public.fulfillments
  ADD COLUMN IF NOT EXISTS provider_order_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_reference TEXT,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS request_hash TEXT,
  ADD COLUMN IF NOT EXISTS provider_status TEXT,
  ADD COLUMN IF NOT EXISTS attempt_count INT NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failure_code TEXT,
  ADD COLUMN IF NOT EXISTS failure_message TEXT,
  ADD COLUMN IF NOT EXISTS awb TEXT,
  ADD COLUMN IF NOT EXISTS courier TEXT,
  ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS snapshot_json JSONB DEFAULT '{}'::jsonb;

-- Partial unique index on provider_order_id to prevent provider order rebound (Req #33)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_fulfillments_provider_order_id
  ON public.fulfillments (provider_order_id)
  WHERE (provider_order_id IS NOT NULL);

-- Unique index on idempotency_key for deterministic idempotency (Req #10 & #34)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_fulfillments_idempotency_key
  ON public.fulfillments (idempotency_key)
  WHERE (idempotency_key IS NOT NULL);

-- Partial unique index to enforce single active fulfillment per order & provider
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_fulfillments_order_provider_active
  ON public.fulfillments (order_id, provider_id)
  WHERE (status NOT IN ('failed', 'cancelled'));

-- 2. Extend fulfillment_events table
ALTER TABLE public.fulfillment_events
  ADD COLUMN IF NOT EXISTS details_json JSONB DEFAULT '{}'::jsonb;

-- 3. Extend shipments table
ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES public.pod_providers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tracking_url TEXT,
  ADD COLUMN IF NOT EXISTS courier_code TEXT,
  ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}'::jsonb;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_fulfillments_order_id ON public.fulfillments(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_provider_id ON public.fulfillments(provider_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_status ON public.fulfillments(status);
CREATE INDEX IF NOT EXISTS idx_fulfillments_provider_order_id ON public.fulfillments(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_events_fulfillment_id ON public.fulfillment_events(fulfillment_id);
CREATE INDEX IF NOT EXISTS idx_shipments_fulfillment_id ON public.shipments(fulfillment_id);

-- 4. PRIVILEGE & RLS LOCKDOWN FOR FULFILMENT TABLES

REVOKE ALL ON public.fulfillments FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.fulfillment_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.shipments FROM PUBLIC, anon, authenticated;

GRANT ALL ON public.fulfillments TO service_role;
GRANT ALL ON public.fulfillment_events TO service_role;
GRANT ALL ON public.shipments TO service_role;

ALTER TABLE public.fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Admin RLS Policies for authenticated staff
CREATE POLICY "Admin read fulfillments" ON public.fulfillments
  FOR SELECT TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor', 'support']));

CREATE POLICY "Admin write fulfillments" ON public.fulfillments
  FOR ALL TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']))
  WITH CHECK (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']));

CREATE POLICY "Admin read fulfillment_events" ON public.fulfillment_events
  FOR SELECT TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor', 'support']));

CREATE POLICY "Admin write fulfillment_events" ON public.fulfillment_events
  FOR ALL TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']))
  WITH CHECK (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']));

CREATE POLICY "Admin read shipments" ON public.shipments
  FOR SELECT TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor', 'support']));

CREATE POLICY "Admin write shipments" ON public.shipments
  FOR ALL TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']))
  WITH CHECK (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']));

-- 5. SECURITY DEFINER TRANSACTIONAL RPCs

-- 5a. Atomic Claim-Before-Submit Fulfillment Creation RPC (Req #11, #32, #34)
CREATE OR REPLACE FUNCTION public.create_or_claim_fulfillment_with_audit(
  p_order_id TEXT,
  p_provider_id UUID,
  p_idempotency_key TEXT,
  p_provider_reference TEXT,
  p_snapshot_json JSONB,
  p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fulfillment_id UUID;
  v_existing_id UUID;
  v_existing_status TEXT;
  v_existing_prov_order_id TEXT;
BEGIN
  -- Check existing fulfillment for this idempotency key or order/provider combination
  SELECT id, status, provider_order_id INTO v_existing_id, v_existing_status, v_existing_prov_order_id
  FROM public.fulfillments
  WHERE idempotency_key = p_idempotency_key
     OR (order_id = p_order_id AND provider_id = p_provider_id AND status NOT IN ('failed', 'cancelled'))
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    IF v_existing_status IN ('submitting', 'SUBMITTING') THEN
      RETURN jsonb_build_object('ok', false, 'error', 'already_claimed', 'fulfillment_id', v_existing_id);
    ELSIF v_existing_status IN ('submitted', 'processing', 'SUBMITTED', 'PROCESSING', 'in_transit', 'delivered') OR v_existing_prov_order_id IS NOT NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'already_submitted', 'fulfillment_id', v_existing_id, 'provider_order_id', v_existing_prov_order_id);
    END IF;
  END IF;

  v_fulfillment_id := COALESCE(v_existing_id, gen_random_uuid());

  IF v_existing_id IS NULL THEN
    INSERT INTO public.fulfillments (
      id, order_id, provider_id, status, provider_reference,
      idempotency_key, attempt_count, snapshot_json, created_at, updated_at
    )
    VALUES (
      v_fulfillment_id,
      p_order_id,
      p_provider_id,
      'SUBMITTING',
      p_provider_reference,
      p_idempotency_key,
      1,
      p_snapshot_json,
      now(),
      now()
    );
  ELSE
    UPDATE public.fulfillments
    SET status = 'SUBMITTING',
        attempt_count = attempt_count + 1,
        updated_at = now()
    WHERE id = v_fulfillment_id;
  END IF;

  INSERT INTO public.fulfillment_events (fulfillment_id, event_type, description, details_json)
  VALUES (
    v_fulfillment_id,
    'SUBMISSION_CLAIMED',
    'Claimed fulfillment submission lock',
    jsonb_build_object('admin_id', p_admin_id, 'idempotency_key', p_idempotency_key)
  );

  INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, details_json)
  VALUES (
    p_admin_id,
    'fulfillment_claimed',
    'fulfillment',
    v_fulfillment_id::TEXT,
    jsonb_build_object('order_id', p_order_id, 'provider_id', p_provider_id)
  );

  RETURN jsonb_build_object('ok', true, 'fulfillment_id', v_fulfillment_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

REVOKE ALL ON FUNCTION public.create_or_claim_fulfillment_with_audit(TEXT, UUID, TEXT, TEXT, JSONB, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_or_claim_fulfillment_with_audit(TEXT, UUID, TEXT, TEXT, JSONB, UUID) TO service_role;

-- 5b. Atomic Provider Order Binding RPC (Req #33)
CREATE OR REPLACE FUNCTION public.bind_provider_order_with_audit(
  p_fulfillment_id UUID,
  p_provider_order_id TEXT,
  p_provider_status TEXT,
  p_normalized_status TEXT,
  p_metadata_json JSONB,
  p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_prov_order_id TEXT;
BEGIN
  SELECT provider_order_id INTO v_existing_prov_order_id
  FROM public.fulfillments WHERE id = p_fulfillment_id;

  IF v_existing_prov_order_id IS NOT NULL AND v_existing_prov_order_id != p_provider_order_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'provider_order_rebound');
  END IF;

  UPDATE public.fulfillments
  SET provider_order_id = p_provider_order_id,
      provider_status = p_provider_status,
      status = p_normalized_status,
      submitted_at = COALESCE(submitted_at, now()),
      last_synced_at = now(),
      metadata_json = COALESCE(metadata_json, '{}'::jsonb) || p_metadata_json,
      updated_at = now()
  WHERE id = p_fulfillment_id;

  INSERT INTO public.fulfillment_events (fulfillment_id, event_type, description, details_json)
  VALUES (
    p_fulfillment_id,
    'PROVIDER_ORDER_BOUND',
    format('Bound provider order ID %s with status %s', p_provider_order_id, p_normalized_status),
    p_metadata_json
  );

  INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, details_json)
  VALUES (
    p_admin_id,
    'provider_order_bound',
    'fulfillment',
    p_fulfillment_id::TEXT,
    jsonb_build_object('provider_order_id', p_provider_order_id, 'status', p_normalized_status)
  );

  RETURN jsonb_build_object('ok', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

REVOKE ALL ON FUNCTION public.bind_provider_order_with_audit(UUID, TEXT, TEXT, TEXT, JSONB, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bind_provider_order_with_audit(UUID, TEXT, TEXT, TEXT, JSONB, UUID) TO service_role;

-- 5c. Atomic Fulfillment Event & Status Update RPC
CREATE OR REPLACE FUNCTION public.update_fulfillment_status_with_audit(
  p_fulfillment_id UUID,
  p_status TEXT,
  p_provider_status TEXT,
  p_failure_code TEXT,
  p_failure_message TEXT,
  p_awb TEXT,
  p_courier TEXT,
  p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.fulfillments WHERE id = p_fulfillment_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Fulfillment not found');
  END IF;

  UPDATE public.fulfillments
  SET status = p_status,
      provider_status = COALESCE(p_provider_status, provider_status),
      failure_code = COALESCE(p_failure_code, failure_code),
      failure_message = COALESCE(p_failure_message, failure_message),
      awb = COALESCE(p_awb, awb),
      courier = COALESCE(p_courier, courier),
      failed_at = CASE WHEN p_status IN ('FAILED', 'failed') THEN COALESCE(failed_at, now()) ELSE failed_at END,
      last_synced_at = now(),
      updated_at = now()
  WHERE id = p_fulfillment_id;

  INSERT INTO public.fulfillment_events (fulfillment_id, event_type, description, details_json)
  VALUES (
    p_fulfillment_id,
    format('STATUS_%s', UPPER(p_status)),
    format('Fulfillment status set to %s', p_status),
    jsonb_build_object('provider_status', p_provider_status, 'failure_code', p_failure_code, 'awb', p_awb)
  );

  -- Upsert shipment entry if AWB is provided
  IF p_awb IS NOT NULL AND p_awb != '' THEN
    INSERT INTO public.shipments (fulfillment_id, waybill_number, dispatched_at, created_at)
    VALUES (p_fulfillment_id, p_awb, now(), now())
    ON CONFLICT (waybill_number) DO UPDATE SET
      fulfillment_id = EXCLUDED.fulfillment_id,
      dispatched_at = COALESCE(public.shipments.dispatched_at, EXCLUDED.dispatched_at);
  END IF;

  RETURN jsonb_build_object('ok', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

REVOKE ALL ON FUNCTION public.update_fulfillment_status_with_audit(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_fulfillment_status_with_audit(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO service_role;
