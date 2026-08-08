-- =============================================================================
-- ASCEND THEORY PLATFORM — ADDITIVE MIGRATION (PHASE 4 WEARABLES & CATALOGUE)
-- Migration: 20260809000004_wearables_catalogue_management.sql
-- Description: Extends products, product_variants, and collections tables.
--              Fixes public variant & draft product exposure vulnerability.
--              Enforces strict server-side RBAC for catalogue mutations.
-- =============================================================================

-- 1. Extend products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'wearables',
  ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'unisex',
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS primary_image_url TEXT,
  ADD COLUMN IF NOT EXISTS gallery_json JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS size_chart_json JSONB;

-- 2. Extend product_variants table
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS color_display TEXT,
  ADD COLUMN IF NOT EXISTS compare_at_price_paise BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS provider_cost_paise BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS availability_status TEXT NOT NULL DEFAULT 'available'
    CHECK (availability_status IN ('available', 'unavailable', 'sample_only', 'returned_inventory_only')),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS weight_grams INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 3. Extend collections table
ALTER TABLE public.collections
  ADD COLUMN IF NOT EXISTS story TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS media_json JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Indexes for performance & query optimization
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_collection_id ON public.products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON public.product_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_collections_status ON public.collections(status);

-- 4. SECURITY FIX: Update Public & Admin RLS Policies

-- Drop weak/over-permissive policies
DROP POLICY IF EXISTS "Public read active products" ON public.products;
DROP POLICY IF EXISTS "Public read product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Public read collections" ON public.collections;
DROP POLICY IF EXISTS "Admin full products access" ON public.products;
DROP POLICY IF EXISTS "Admin full variants access" ON public.product_variants;

-- Public Policy: Read active products ONLY
CREATE POLICY "Public read published active products" ON public.products
  FOR SELECT
  USING (status = 'active');

-- Public Policy: Read active variants belonging ONLY to active published products
CREATE POLICY "Public read active variants of active products" ON public.product_variants
  FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id AND p.status = 'active'
    )
  );

-- Public Policy: Read published collections ONLY
CREATE POLICY "Public read published collections" ON public.collections
  FOR SELECT
  USING (status = 'published');

-- Admin Policies: Products
CREATE POLICY "Admin read products" ON public.products
  FOR SELECT
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor', 'support']));

CREATE POLICY "Admin write products" ON public.products
  FOR ALL
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor']))
  WITH CHECK (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor']));

-- Admin Policies: Product Variants
CREATE POLICY "Admin read product variants" ON public.product_variants
  FOR SELECT
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor', 'support']));

CREATE POLICY "Admin write product variants" ON public.product_variants
  FOR ALL
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor']))
  WITH CHECK (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor']));

-- Admin Policies: Collections
CREATE POLICY "Admin read collections" ON public.collections
  FOR SELECT
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor', 'support']));

CREATE POLICY "Admin write collections" ON public.collections
  FOR ALL
  USING (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor']))
  WITH CHECK (public.is_caller_active_admin_with_roles(ARRAY['owner', 'admin', 'editor']));
