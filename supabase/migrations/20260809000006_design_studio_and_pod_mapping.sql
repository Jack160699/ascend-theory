-- =============================================================================
-- ASCEND THEORY PLATFORM — ADDITIVE MIGRATION (PHASE 5 DESIGN STUDIO & POD MAPPING)
-- Migration: 20260809000006_design_studio_and_pod_mapping.sql
-- Description: Extends designs, design_placements, pod_providers, provider_products,
--              and provider_variants tables. Adds product_mockups table.
--              Implements strict RLS policies scoped TO authenticated for admin routes
--              and public RLS for approved mockups ONLY.
--              Creates SECURITY DEFINER atomic RPCs for design & provider mapping mutations.
-- =============================================================================

-- 1. Extend designs table
ALTER TABLE public.designs
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived')),
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS original_filename TEXT,
  ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT DEFAULT 0 CHECK (file_size_bytes >= 0),
  ADD COLUMN IF NOT EXISTS checksum TEXT,
  ADD COLUMN IF NOT EXISTS width_px INT DEFAULT 0 CHECK (width_px >= 0),
  ADD COLUMN IF NOT EXISTS height_px INT DEFAULT 0 CHECK (height_px >= 0),
  ADD COLUMN IF NOT EXISTS is_transparent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS designer TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1 CHECK (version >= 1),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2. Extend design_placements table
ALTER TABLE public.design_placements
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS placement_location TEXT NOT NULL DEFAULT 'front'
    CHECK (placement_location IN ('front', 'back', 'left_chest', 'right_chest', 'left_sleeve', 'right_sleeve', 'neck', 'custom')),
  ADD COLUMN IF NOT EXISTS x_normalized NUMERIC(6,4) NOT NULL DEFAULT 0.5000
    CHECK (x_normalized >= 0 AND x_normalized <= 1),
  ADD COLUMN IF NOT EXISTS y_normalized NUMERIC(6,4) NOT NULL DEFAULT 0.5000
    CHECK (y_normalized >= 0 AND y_normalized <= 1),
  ADD COLUMN IF NOT EXISTS scale NUMERIC(6,4) NOT NULL DEFAULT 1.0000
    CHECK (scale > 0),
  ADD COLUMN IF NOT EXISTS rotation_deg NUMERIC(6,2) NOT NULL DEFAULT 0.00
    CHECK (rotation_deg >= -360 AND rotation_deg <= 360),
  ADD COLUMN IF NOT EXISTS width_mm INT NOT NULL DEFAULT 200 CHECK (width_mm > 0),
  ADD COLUMN IF NOT EXISTS height_mm INT NOT NULL DEFAULT 250 CHECK (height_mm > 0),
  ADD COLUMN IF NOT EXISTS print_method TEXT NOT NULL DEFAULT 'dtf'
    CHECK (print_method IN ('dtf', 'dtg', 'screen_print', 'embroidery', 'sublimation', 'other')),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 3. Seed POD Providers (Qikink & Printrove)
INSERT INTO public.pod_providers (id, name, slug, is_active, created_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001'::UUID, 'Qikink', 'qikink', true, now()),
  ('a0000000-0000-0000-0000-000000000002'::UUID, 'Printrove', 'printrove', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;

-- 4. Extend provider_products table
ALTER TABLE public.provider_products
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS print_methods_json JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS printable_areas_json JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS mapping_status TEXT NOT NULL DEFAULT 'unmapped'
    CHECK (mapping_status IN ('unmapped', 'draft', 'mapped', 'verified', 'disabled')),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Unique constraint on provider_products (provider_id, external_product_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'provider_products_provider_external_id_key'
  ) THEN
    ALTER TABLE public.provider_products ADD CONSTRAINT provider_products_provider_external_id_key UNIQUE (provider_id, external_product_id);
  END IF;
END $$;

-- 5. Extend provider_variants table
ALTER TABLE public.provider_variants
  ADD COLUMN IF NOT EXISTS product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS external_sku TEXT,
  ADD COLUMN IF NOT EXISTS provider_color TEXT,
  ADD COLUMN IF NOT EXISTS provider_size TEXT,
  ADD COLUMN IF NOT EXISTS mapping_status TEXT NOT NULL DEFAULT 'unmapped'
    CHECK (mapping_status IN ('unmapped', 'draft', 'mapped', 'verified', 'disabled')),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Unique constraints on provider_variants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'provider_variants_provider_prod_ext_var_key'
  ) THEN
    ALTER TABLE public.provider_variants ADD CONSTRAINT provider_variants_provider_prod_ext_var_key UNIQUE (provider_product_id, external_variant_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'provider_variants_ascend_variant_provider_prod_key'
  ) THEN
    ALTER TABLE public.provider_variants ADD CONSTRAINT provider_variants_ascend_variant_provider_prod_key UNIQUE (product_variant_id, provider_product_id);
  END IF;
END $$;

-- 6. Create product_mockups table
CREATE TABLE IF NOT EXISTS public.product_mockups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
  placement_id UUID REFERENCES public.design_placements(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  view_type TEXT NOT NULL DEFAULT 'front'
    CHECK (view_type IN ('front', 'back', 'detail', 'lifestyle')),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_designs_status ON public.designs(status);
CREATE INDEX IF NOT EXISTS idx_design_placements_design_id ON public.design_placements(design_id);
CREATE INDEX IF NOT EXISTS idx_design_placements_product_variant_id ON public.design_placements(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_provider_products_product_id ON public.provider_products(product_id);
CREATE INDEX IF NOT EXISTS idx_provider_variants_product_variant_id ON public.provider_variants(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_product_mockups_product_id ON public.product_mockups(product_id);
CREATE INDEX IF NOT EXISTS idx_product_mockups_status ON public.product_mockups(status);

-- 7. PRIVILEGE & RLS SECURITY LOCKDOWN

-- Revoke direct table access on operational POD mapping & design tables from PUBLIC, anon, authenticated
REVOKE ALL ON public.designs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.design_placements FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.pod_providers FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.provider_products FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.provider_variants FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.product_mockups FROM PUBLIC, anon, authenticated;

-- Grant full table access to service_role ONLY
GRANT ALL ON public.designs TO service_role;
GRANT ALL ON public.design_placements TO service_role;
GRANT ALL ON public.pod_providers TO service_role;
GRANT ALL ON public.provider_products TO service_role;
GRANT ALL ON public.provider_variants TO service_role;
GRANT ALL ON public.product_mockups TO service_role;

-- Enable RLS on all Phase 5 tables
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_mockups ENABLE ROW LEVEL SECURITY;

-- 8. ADMIN RLS POLICIES — Scoped explicitly TO authenticated
-- Any policy invoking public.is_caller_active_admin_with_roles MUST be TO authenticated.

-- Designs
CREATE POLICY "Admin read designs" ON public.designs
  FOR SELECT TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor', 'support']));

CREATE POLICY "Admin write designs" ON public.designs
  FOR ALL TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']))
  WITH CHECK (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']));

-- Design Placements
CREATE POLICY "Admin read design placements" ON public.design_placements
  FOR SELECT TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor', 'support']));

CREATE POLICY "Admin write design placements" ON public.design_placements
  FOR ALL TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']))
  WITH CHECK (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']));

-- POD Providers
CREATE POLICY "Admin read pod providers" ON public.pod_providers
  FOR SELECT TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor', 'support']));

CREATE POLICY "Admin write pod providers" ON public.pod_providers
  FOR ALL TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']))
  WITH CHECK (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']));

-- Provider Products
CREATE POLICY "Admin read provider products" ON public.provider_products
  FOR SELECT TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor', 'support']));

CREATE POLICY "Admin write provider products" ON public.provider_products
  FOR ALL TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']))
  WITH CHECK (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']));

-- Provider Variants
CREATE POLICY "Admin read provider variants" ON public.provider_variants
  FOR SELECT TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor', 'support']));

CREATE POLICY "Admin write provider variants" ON public.provider_variants
  FOR ALL TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']))
  WITH CHECK (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']));

-- Product Mockups (Admin & Public)
CREATE POLICY "Public read approved mockups" ON public.product_mockups
  FOR SELECT TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Admin read product mockups" ON public.product_mockups
  FOR SELECT TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor', 'support']));

CREATE POLICY "Admin write product mockups" ON public.product_mockups
  FOR ALL TO authenticated
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']))
  WITH CHECK (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin']));

-- 9. SECURITY DEFINER ATOMIC RPCs FOR PHASE 5 MUTATIONS

-- 9a. Atomic Design + Placements Persistence RPC
CREATE OR REPLACE FUNCTION public.save_design_with_placements(
  p_design JSONB,
  p_placements JSONB,
  p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_design_id UUID;
  v_title TEXT;
  v_slug TEXT;
  v_status TEXT;
  v_asset_url TEXT;
  v_placement_elem JSONB;
  v_placement_id UUID;
  v_variant_id UUID;
  v_width_mm INT;
  v_height_mm INT;
  v_x_norm NUMERIC(6,4);
  v_y_norm NUMERIC(6,4);
BEGIN
  -- =====================================================================
  -- PASS 1: VALIDATE EVERYTHING, WRITE NOTHING
  -- =====================================================================
  v_design_id := COALESCE((p_design->>'id')::UUID, gen_random_uuid());
  v_title := TRIM(p_design->>'title');
  v_slug := LOWER(TRIM(p_design->>'slug'));
  v_status := COALESCE(p_design->>'status', 'draft');
  v_asset_url := TRIM(p_design->>'assetUrl');

  IF v_title IS NULL OR v_title = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Design title is required');
  END IF;
  IF v_slug IS NULL OR v_slug = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Design slug is required');
  END IF;
  IF v_status NOT IN ('draft', 'active', 'archived') THEN
    RETURN jsonb_build_object('ok', false, 'error', format('Invalid design status: ''%s''', v_status));
  END IF;
  IF v_status = 'active' AND (v_asset_url IS NULL OR v_asset_url = '') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Active design requires valid artwork asset URL');
  END IF;

  -- Slug uniqueness
  IF EXISTS (SELECT 1 FROM public.designs WHERE slug = v_slug AND id != v_design_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', format('Design slug ''%s'' already exists', v_slug));
  END IF;

  -- Validate placements
  IF p_placements IS NOT NULL AND jsonb_array_length(p_placements) > 0 THEN
    FOR v_placement_elem IN SELECT * FROM jsonb_array_elements(p_placements) LOOP
      v_variant_id := (v_placement_elem->>'productVariantId')::UUID;
      v_width_mm := COALESCE((v_placement_elem->>'widthMm')::INT, 0);
      v_height_mm := COALESCE((v_placement_elem->>'heightMm')::INT, 0);
      v_x_norm := COALESCE((v_placement_elem->>'xNormalized')::NUMERIC, 0.5);
      v_y_norm := COALESCE((v_placement_elem->>'yNormalized')::NUMERIC, 0.5);

      IF v_width_mm <= 0 OR v_height_mm <= 0 THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Placement physical dimensions (width_mm and height_mm) must be positive');
      END IF;
      IF v_x_norm < 0 OR v_x_norm > 1 OR v_y_norm < 0 OR v_y_norm > 1 THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Placement normalized coordinates (x_normalized, y_normalized) must be between 0 and 1');
      END IF;

      -- Check product_variant exists
      IF v_variant_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.product_variants WHERE id = v_variant_id) THEN
        RETURN jsonb_build_object('ok', false, 'error', format('Product variant ID %s does not exist', v_variant_id));
      END IF;
    END LOOP;
  END IF;

  -- =====================================================================
  -- PASS 2: MUTATE — RAISE EXCEPTION on failure rolls back all writes
  -- =====================================================================
  INSERT INTO public.designs (
    id, title, slug, description, status, asset_url, storage_path,
    mime_type, original_filename, file_size_bytes, checksum,
    width_px, height_px, is_transparent, designer, tags, notes, version, updated_at
  )
  VALUES (
    v_design_id,
    v_title,
    v_slug,
    p_design->>'description',
    v_status,
    COALESCE(v_asset_url, ''),
    p_design->>'storagePath',
    p_design->>'mimeType',
    p_design->>'originalFilename',
    COALESCE((p_design->>'fileSizeBytes')::BIGINT, 0),
    p_design->>'checksum',
    COALESCE((p_design->>'widthPx')::INT, 0),
    COALESCE((p_design->>'heightPx')::INT, 0),
    COALESCE((p_design->>'isTransparent')::BOOLEAN, false),
    p_design->>'designer',
    COALESCE(p_design->'tags', '[]'::jsonb)::TEXT[],
    p_design->>'notes',
    COALESCE((p_design->>'version')::INT, 1),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    asset_url = EXCLUDED.asset_url,
    storage_path = EXCLUDED.storage_path,
    mime_type = EXCLUDED.mime_type,
    original_filename = EXCLUDED.original_filename,
    file_size_bytes = EXCLUDED.file_size_bytes,
    checksum = EXCLUDED.checksum,
    width_px = EXCLUDED.width_px,
    height_px = EXCLUDED.height_px,
    is_transparent = EXCLUDED.is_transparent,
    designer = EXCLUDED.designer,
    tags = EXCLUDED.tags,
    notes = EXCLUDED.notes,
    version = EXCLUDED.version,
    updated_at = now();

  -- Upsert placements
  IF p_placements IS NOT NULL AND jsonb_array_length(p_placements) > 0 THEN
    FOR v_placement_elem IN SELECT * FROM jsonb_array_elements(p_placements) LOOP
      v_placement_id := COALESCE((v_placement_elem->>'id')::UUID, gen_random_uuid());
      v_variant_id := (v_placement_elem->>'productVariantId')::UUID;

      INSERT INTO public.design_placements (
        id, design_id, product_id, product_variant_id, position, placement_location,
        x_normalized, y_normalized, scale, rotation_deg, width_mm, height_mm,
        print_method, is_active, updated_at
      )
      VALUES (
        v_placement_id,
        v_design_id,
        (v_placement_elem->>'productId')::UUID,
        v_variant_id,
        COALESCE(v_placement_elem->>'placementLocation', 'front'),
        COALESCE(v_placement_elem->>'placementLocation', 'front'),
        COALESCE((v_placement_elem->>'xNormalized')::NUMERIC, 0.5),
        COALESCE((v_placement_elem->>'yNormalized')::NUMERIC, 0.5),
        COALESCE((v_placement_elem->>'scale')::NUMERIC, 1.0),
        COALESCE((v_placement_elem->>'rotationDeg')::NUMERIC, 0.0),
        COALESCE((v_placement_elem->>'widthMm')::INT, 200),
        COALESCE((v_placement_elem->>'heightMm')::INT, 250),
        COALESCE(v_placement_elem->>'printMethod', 'dtf'),
        COALESCE((v_placement_elem->>'isActive')::BOOLEAN, true),
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        product_id = EXCLUDED.product_id,
        product_variant_id = EXCLUDED.product_variant_id,
        position = EXCLUDED.position,
        placement_location = EXCLUDED.placement_location,
        x_normalized = EXCLUDED.x_normalized,
        y_normalized = EXCLUDED.y_normalized,
        scale = EXCLUDED.scale,
        rotation_deg = EXCLUDED.rotation_deg,
        width_mm = EXCLUDED.width_mm,
        height_mm = EXCLUDED.height_mm,
        print_method = EXCLUDED.print_method,
        is_active = EXCLUDED.is_active,
        updated_at = now();
    END LOOP;
  END IF;

  -- Audit log
  INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, details_json)
  VALUES (
    p_admin_id,
    'save_design_with_placements',
    'design',
    v_design_id::TEXT,
    jsonb_build_object('title', v_title, 'slug', v_slug, 'status', v_status)
  );

  RETURN jsonb_build_object('ok', true, 'design_id', v_design_id);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

-- Strict RPC Privilege Lockdown
REVOKE ALL ON FUNCTION public.save_design_with_placements(JSONB, JSONB, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_design_with_placements(JSONB, JSONB, UUID) TO service_role;

-- 9b. Atomic Provider Product + Variant Mapping RPC
CREATE OR REPLACE FUNCTION public.save_provider_mapping_with_audit(
  p_provider_product JSONB,
  p_provider_variants JSONB,
  p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prov_prod_id UUID;
  v_provider_id UUID;
  v_ext_prod_id TEXT;
  v_product_id UUID;
  v_status TEXT;
  v_variant_elem JSONB;
  v_prov_var_id UUID;
  v_ascend_var_id UUID;
  v_ext_var_id TEXT;
BEGIN
  -- PASS 1: Validate
  v_prov_prod_id := COALESCE((p_provider_product->>'id')::UUID, gen_random_uuid());
  v_provider_id := (p_provider_product->>'providerId')::UUID;
  v_ext_prod_id := TRIM(p_provider_product->>'externalProductId');
  v_product_id := (p_provider_product->>'productId')::UUID;
  v_status := COALESCE(p_provider_product->>'mappingStatus', 'draft');

  IF v_provider_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.pod_providers WHERE id = v_provider_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Valid POD provider_id is required');
  END IF;
  IF v_ext_prod_id IS NULL OR v_ext_prod_id = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Provider external_product_id is required');
  END IF;

  -- Validate variant mapping list
  IF p_provider_variants IS NOT NULL AND jsonb_array_length(p_provider_variants) > 0 THEN
    FOR v_variant_elem IN SELECT * FROM jsonb_array_elements(p_provider_variants) LOOP
      v_ascend_var_id := (v_variant_elem->>'productVariantId')::UUID;
      v_ext_var_id := TRIM(v_variant_elem->>'externalVariantId');

      IF v_ext_var_id IS NULL OR v_ext_var_id = '' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Provider external_variant_id is required for variant mapping');
      END IF;

      IF v_ascend_var_id IS NOT NULL THEN
        -- Verify Ascend variant exists
        IF NOT EXISTS (SELECT 1 FROM public.product_variants WHERE id = v_ascend_var_id) THEN
          RETURN jsonb_build_object('ok', false, 'error', format('Ascend product_variant_id %s does not exist', v_ascend_var_id));
        END IF;

        -- Verify cross-product mapping mismatch: variant must belong to the mapped product
        IF v_product_id IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM public.product_variants WHERE id = v_ascend_var_id AND product_id = v_product_id
        ) THEN
          RETURN jsonb_build_object('ok', false, 'error', 'mapping_product_mismatch: variant does not belong to the target product');
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- PASS 2: Mutate
  INSERT INTO public.provider_products (
    id, provider_id, product_id, external_product_id, name, title,
    print_methods_json, printable_areas_json, mapping_status, notes,
    verified_at, verified_by, updated_at
  )
  VALUES (
    v_prov_prod_id,
    v_provider_id,
    v_product_id,
    v_ext_prod_id,
    COALESCE(p_provider_product->>'title', p_provider_product->>'name', v_ext_prod_id),
    p_provider_product->>'title',
    COALESCE(p_provider_product->'printMethodsJson', '[]'::jsonb),
    COALESCE(p_provider_product->'printableAreasJson', '[]'::jsonb),
    v_status,
    p_provider_product->>'notes',
    CASE WHEN v_status = 'verified' THEN now() ELSE NULL END,
    CASE WHEN v_status = 'verified' THEN p_admin_id ELSE NULL END,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    provider_id = EXCLUDED.provider_id,
    product_id = EXCLUDED.product_id,
    external_product_id = EXCLUDED.external_product_id,
    name = EXCLUDED.name,
    title = EXCLUDED.title,
    print_methods_json = EXCLUDED.print_methods_json,
    printable_areas_json = EXCLUDED.printable_areas_json,
    mapping_status = EXCLUDED.mapping_status,
    notes = EXCLUDED.notes,
    verified_at = EXCLUDED.verified_at,
    verified_by = EXCLUDED.verified_by,
    updated_at = now();

  -- Upsert provider variants
  IF p_provider_variants IS NOT NULL AND jsonb_array_length(p_provider_variants) > 0 THEN
    FOR v_variant_elem IN SELECT * FROM jsonb_array_elements(p_provider_variants) LOOP
      v_prov_var_id := COALESCE((v_variant_elem->>'id')::UUID, gen_random_uuid());
      v_ascend_var_id := (v_variant_elem->>'productVariantId')::UUID;
      v_ext_var_id := TRIM(v_variant_elem->>'externalVariantId');

      INSERT INTO public.provider_variants (
        id, provider_product_id, product_variant_id, external_variant_id, external_sku,
        sku, provider_color, provider_size, mapping_status, notes, verified_at, verified_by, updated_at
      )
      VALUES (
        v_prov_var_id,
        v_prov_prod_id,
        v_ascend_var_id,
        v_ext_var_id,
        v_variant_elem->>'externalSku',
        COALESCE(v_variant_elem->>'externalSku', v_ext_var_id),
        v_variant_elem->>'providerColor',
        v_variant_elem->>'providerSize',
        COALESCE(v_variant_elem->>'mappingStatus', 'mapped'),
        v_variant_elem->>'notes',
        CASE WHEN v_status = 'verified' THEN now() ELSE NULL END,
        CASE WHEN v_status = 'verified' THEN p_admin_id ELSE NULL END,
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        provider_product_id = EXCLUDED.provider_product_id,
        product_variant_id = EXCLUDED.product_variant_id,
        external_variant_id = EXCLUDED.external_variant_id,
        external_sku = EXCLUDED.external_sku,
        sku = EXCLUDED.sku,
        provider_color = EXCLUDED.provider_color,
        provider_size = EXCLUDED.provider_size,
        mapping_status = EXCLUDED.mapping_status,
        notes = EXCLUDED.notes,
        verified_at = EXCLUDED.verified_at,
        verified_by = EXCLUDED.verified_by,
        updated_at = now();
    END LOOP;
  END IF;

  -- Audit log
  INSERT INTO public.audit_logs (admin_id, action, entity_type, entity_id, details_json)
  VALUES (
    p_admin_id,
    'save_provider_mapping_with_audit',
    'provider_product',
    v_prov_prod_id::TEXT,
    jsonb_build_object('external_product_id', v_ext_prod_id, 'mapping_status', v_status)
  );

  RETURN jsonb_build_object('ok', true, 'provider_product_id', v_prov_prod_id);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

-- Strict RPC Privilege Lockdown
REVOKE ALL ON FUNCTION public.save_provider_mapping_with_audit(JSONB, JSONB, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_provider_mapping_with_audit(JSONB, JSONB, UUID) TO service_role;
