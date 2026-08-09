/**
 * Phase 5 — Design & POD Mapping Store (Supabase + Memory Fallback)
 * Manages designs, design placements, provider products/variants mappings, and product mockups.
 * Enforces fail-closed configuration security and 2-pass atomic RPC operations on Supabase.
 */

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import type {
  DesignAsset,
  DesignPlacement,
  PlacementLocation,
  PrintMethod,
  PODProvider,
  ProviderProduct,
  ProviderVariant,
  MappingStatus,
  PrintableAreaSpec,
  ProductMockup,
  MockupViewType,
  MockupStatus,
  ProductReadinessReport,
} from "./design-types";
import { validateDesignPlacement } from "./placement-validator";
import { validateArtworkUpload } from "./design-storage";
import { getAllProductsAdmin } from "./store";
import { evaluateProductReadiness } from "./readiness-engine";

// ─────────────────────────────────────────────────────────────────────────────
// IN-MEMORY STORES FOR LOCAL TESTING (when hasSupabaseConfig() === false)
// ─────────────────────────────────────────────────────────────────────────────
const memoryDesigns = new Map<string, DesignAsset>();
const memoryPlacements = new Map<string, DesignPlacement>();
const memoryPODProviders = new Map<string, PODProvider>();
const memoryProviderProducts = new Map<string, ProviderProduct>();
const memoryProviderVariants = new Map<string, ProviderVariant>();
const memoryMockups = new Map<string, ProductMockup>();

function seedPhase5MemoryStoreIfNeeded() {
  if (memoryPODProviders.size === 0) {
    memoryPODProviders.set("a0000000-0000-0000-0000-000000000001", {
      id: "a0000000-0000-0000-0000-000000000001",
      name: "Qikink",
      slug: "qikink",
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    memoryPODProviders.set("a0000000-0000-0000-0000-000000000002", {
      id: "a0000000-0000-0000-0000-000000000002",
      name: "Printrove",
      slug: "printrove",
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGNS & PLACEMENTS
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllDesignsAdmin(): Promise<DesignAsset[]> {
  if (hasSupabaseConfig()) {
    const serviceClient = createSupabaseServiceClient();
    if (!serviceClient) {
      throw new Error("Server configuration error: Supabase service client unavailable");
    }

    const { data: dData, error: dErr } = await serviceClient
      .from("designs")
      .select("*")
      .order("created_at", { ascending: false });

    if (dErr) {
      throw new Error(`Failed to fetch designs: ${dErr.message}`);
    }

    const { data: pData } = await serviceClient.from("design_placements").select("*");

    const placementsMap = new Map<string, DesignPlacement[]>();
    (pData || []).forEach((p: Record<string, unknown>) => {
      const pl: DesignPlacement = {
        id: String(p.id),
        designId: String(p.design_id),
        productId: p.product_id ? String(p.product_id) : undefined,
        productVariantId: p.product_variant_id ? String(p.product_variant_id) : undefined,
        position: String(p.position || "front"),
        placementLocation: (p.placement_location || p.position || "front") as PlacementLocation,
        xNormalized: Number(p.x_normalized ?? 0.5),
        yNormalized: Number(p.y_normalized ?? 0.5),
        scale: Number(p.scale ?? 1.0),
        rotationDeg: Number(p.rotation_deg ?? 0),
        widthMm: Number(p.width_mm ?? 200),
        heightMm: Number(p.height_mm ?? 250),
        printMethod: (p.print_method || "dtf") as PrintMethod,
        isActive: Boolean(p.is_active ?? true),
        createdAt: String(p.created_at),
        updatedAt: String(p.updated_at || p.created_at),
      };
      const list = placementsMap.get(String(p.design_id)) || [];
      list.push(pl);
      placementsMap.set(String(p.design_id), list);
    });

    return (dData || []).map((d: Record<string, unknown>) => ({
      id: String(d.id),
      title: String(d.title),
      slug: String(d.slug),
      description: d.description ? String(d.description) : undefined,
      status: (d.status || "draft") as DesignAsset["status"],
      assetUrl: String(d.asset_url || ""),
      storagePath: d.storage_path ? String(d.storage_path) : undefined,
      mimeType: d.mime_type ? String(d.mime_type) : undefined,
      originalFilename: d.original_filename ? String(d.original_filename) : undefined,
      fileSizeBytes: Number(d.file_size_bytes ?? 0),
      checksum: d.checksum ? String(d.checksum) : undefined,
      widthPx: Number(d.width_px ?? 0),
      heightPx: Number(d.height_px ?? 0),
      isTransparent: Boolean(d.is_transparent),
      designer: d.designer ? String(d.designer) : undefined,
      tags: (d.tags as string[]) || [],
      notes: d.notes ? String(d.notes) : undefined,
      version: Number(d.version ?? 1),
      createdAt: String(d.created_at),
      updatedAt: String(d.updated_at || d.created_at),
      placements: placementsMap.get(String(d.id)) || [],
    }));
  }

  seedPhase5MemoryStoreIfNeeded();
  const list = Array.from(memoryDesigns.values());
  return list.map((d) => ({
    ...d,
    placements: Array.from(memoryPlacements.values()).filter((p) => p.designId === d.id),
  }));
}

export async function saveDesignAdmin(
  input: {
    design: Partial<DesignAsset>;
    placements?: Partial<DesignPlacement>[];
  },
  adminId: string,
): Promise<{ ok: true; design: DesignAsset } | { ok: false; error: string; errors?: string[] }> {
  const { design, placements = [] } = input;
  const title = design.title?.trim();
  const slug = design.slug?.trim().toLowerCase();
  const status = design.status || "draft";

  if (!title || !slug) {
    return { ok: false, error: "Title and slug are required for design" };
  }

  // Validate artwork if activating
  if (status === "active") {
    if (!design.assetUrl || design.assetUrl.trim() === "") {
      return { ok: false, error: "Active design requires valid artwork asset URL" };
    }
  }

  // Validate artwork MIME and file size if provided
  if (design.mimeType && design.fileSizeBytes) {
    const artVal = validateArtworkUpload({
      mimeType: design.mimeType,
      fileSizeBytes: design.fileSizeBytes,
    });
    if (!artVal.isValid) {
      return { ok: false, error: artVal.error };
    }
  }

  // Validate all placements
  for (const pl of placements) {
    const valRes = validateDesignPlacement(pl);
    if (!valRes.isValid) {
      return { ok: false, error: valRes.error, errors: valRes.errors };
    }
  }

  // FAIL-CLOSED SUPABASE DB PATH
  if (hasSupabaseConfig()) {
    const serviceClient = createSupabaseServiceClient();
    if (!serviceClient) {
      return { ok: false, error: "Server configuration error: Supabase service client unavailable" };
    }

    const { data: rpcData, error: rpcErr } = await serviceClient.rpc("save_design_with_placements", {
      p_design: design,
      p_placements: placements,
      p_admin_id: adminId,
    });

    if (rpcErr) {
      return { ok: false, error: `Database RPC execution error: ${rpcErr.message}` };
    }

    if (!rpcData || typeof rpcData !== "object" || !(rpcData as { ok?: boolean }).ok) {
      const errMessage = (rpcData as { error?: string })?.error || "Atomic design save RPC returned error";
      return { ok: false, error: errMessage };
    }

    const allDesigns = await getAllDesignsAdmin();
    const updated = allDesigns.find((d) => d.slug === slug || d.id === design.id);
    return { ok: true, design: updated || (design as DesignAsset) };
  }

  // LOCAL MEMORY FALLBACK
  seedPhase5MemoryStoreIfNeeded();
  const designId = design.id || `dsg-${slug}`;

  // Validate slug uniqueness in memory
  for (const [dId, d] of memoryDesigns.entries()) {
    if (d.slug === slug && dId !== designId) {
      return { ok: false, error: `Design slug '${slug}' already exists` };
    }
  }

  const designRecord: DesignAsset = {
    id: designId,
    title,
    slug,
    description: design.description,
    status,
    assetUrl: design.assetUrl || "",
    storagePath: design.storagePath,
    mimeType: design.mimeType,
    originalFilename: design.originalFilename,
    fileSizeBytes: design.fileSizeBytes ?? 0,
    checksum: design.checksum,
    widthPx: design.widthPx ?? 0,
    heightPx: design.heightPx ?? 0,
    isTransparent: Boolean(design.isTransparent),
    designer: design.designer,
    tags: design.tags || [],
    notes: design.notes,
    version: design.version ?? 1,
    createdAt: design.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryDesigns.set(designId, designRecord);

  const savedPlacements: DesignPlacement[] = [];
  placements.forEach((pl, idx) => {
    const plId = pl.id || `pl-${designId}-${idx}`;
    const plRecord: DesignPlacement = {
      id: plId,
      designId,
      productId: pl.productId,
      productVariantId: pl.productVariantId,
      position: pl.placementLocation || pl.position || "front",
      placementLocation: pl.placementLocation || (pl.position as PlacementLocation) || "front",
      xNormalized: pl.xNormalized ?? 0.5,
      yNormalized: pl.yNormalized ?? 0.5,
      scale: pl.scale ?? 1.0,
      rotationDeg: pl.rotationDeg ?? 0,
      widthMm: pl.widthMm ?? 200,
      heightMm: pl.heightMm ?? 250,
      printMethod: pl.printMethod || "dtf",
      isActive: pl.isActive ?? true,
      createdAt: pl.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryPlacements.set(plId, plRecord);
    savedPlacements.push(plRecord);
  });

  designRecord.placements = savedPlacements;
  return { ok: true, design: designRecord };
}

export async function archiveDesignAdmin(
  designId: string,
  _adminId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (hasSupabaseConfig()) {
    const serviceClient = createSupabaseServiceClient();
    if (!serviceClient) {
      return { ok: false, error: "Server configuration error: Supabase service client unavailable" };
    }
    const { error } = await serviceClient
      .from("designs")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", designId);
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }

  seedPhase5MemoryStoreIfNeeded();
  const existing = memoryDesigns.get(designId);
  if (existing) {
    memoryDesigns.set(designId, { ...existing, status: "archived", updatedAt: new Date().toISOString() });
  }
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// POD PROVIDER MAPPINGS
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllPODProvidersAdmin(): Promise<PODProvider[]> {
  if (hasSupabaseConfig()) {
    const serviceClient = createSupabaseServiceClient();
    if (!serviceClient) throw new Error("Server configuration error: Supabase service client unavailable");
    const { data, error } = await serviceClient.from("pod_providers").select("*");
    if (error) throw new Error(`Failed to fetch POD providers: ${error.message}`);
    return (data || []).map((p: Record<string, unknown>) => ({
      id: String(p.id),
      name: String(p.name),
      slug: String(p.slug),
      isActive: Boolean(p.is_active),
      createdAt: String(p.created_at),
    }));
  }

  seedPhase5MemoryStoreIfNeeded();
  return Array.from(memoryPODProviders.values());
}

export async function getAllProviderMappingsAdmin(): Promise<{
  providerProducts: ProviderProduct[];
  providerVariants: ProviderVariant[];
}> {
  if (hasSupabaseConfig()) {
    const serviceClient = createSupabaseServiceClient();
    if (!serviceClient) throw new Error("Server configuration error: Supabase service client unavailable");

    const [ppRes, pvRes] = await Promise.all([
      serviceClient.from("provider_products").select("*"),
      serviceClient.from("provider_variants").select("*"),
    ]);

    if (ppRes.error) throw new Error(`Failed to fetch provider products: ${ppRes.error.message}`);
    if (pvRes.error) throw new Error(`Failed to fetch provider variants: ${pvRes.error.message}`);

    const providerVariants: ProviderVariant[] = (pvRes.data || []).map((v: Record<string, unknown>) => ({
      id: String(v.id),
      providerProductId: String(v.provider_product_id),
      productVariantId: v.product_variant_id ? String(v.product_variant_id) : undefined,
      externalVariantId: String(v.external_variant_id),
      externalSku: String(v.external_sku || v.sku),
      sku: String(v.sku || v.external_sku),
      providerColor: v.provider_color ? String(v.provider_color) : undefined,
      providerSize: v.provider_size ? String(v.provider_size) : undefined,
      mappingStatus: (v.mapping_status || "mapped") as MappingStatus,
      notes: v.notes ? String(v.notes) : undefined,
      verifiedAt: v.verified_at ? String(v.verified_at) : undefined,
      verifiedBy: v.verified_by ? String(v.verified_by) : undefined,
      createdAt: String(v.created_at),
      updatedAt: String(v.updated_at || v.created_at),
    }));

    const providerProducts: ProviderProduct[] = (ppRes.data || []).map((p: Record<string, unknown>) => ({
      id: String(p.id),
      providerId: String(p.provider_id),
      productId: p.product_id ? String(p.product_id) : undefined,
      externalProductId: String(p.external_product_id),
      name: String(p.name),
      title: p.title ? String(p.title) : String(p.name),
      printMethodsJson: (p.print_methods_json as PrintMethod[]) || [],
      printableAreasJson: (p.printable_areas_json as PrintableAreaSpec[]) || [],
      mappingStatus: (p.mapping_status || "unmapped") as MappingStatus,
      notes: p.notes ? String(p.notes) : undefined,
      verifiedAt: p.verified_at ? String(p.verified_at) : undefined,
      verifiedBy: p.verified_by ? String(p.verified_by) : undefined,
      createdAt: String(p.created_at),
      updatedAt: String(p.updated_at || p.created_at),
      variants: providerVariants.filter((v) => v.providerProductId === String(p.id)),
    }));

    return { providerProducts, providerVariants };
  }

  seedPhase5MemoryStoreIfNeeded();
  const pProds = Array.from(memoryProviderProducts.values()).map((p) => ({
    ...p,
    variants: Array.from(memoryProviderVariants.values()).filter((v) => v.providerProductId === p.id),
  }));
  return {
    providerProducts: pProds,
    providerVariants: Array.from(memoryProviderVariants.values()),
  };
}

export async function saveProviderMappingAdmin(
  input: {
    providerProduct: Partial<ProviderProduct>;
    providerVariants?: Partial<ProviderVariant>[];
  },
  _adminId: string,
): Promise<{ ok: true; providerProduct: ProviderProduct } | { ok: false; error: string }> {
  const { providerProduct, providerVariants = [] } = input;
  const extProdId = providerProduct.externalProductId?.trim();
  const providerId = providerProduct.providerId;

  if (!providerId || !extProdId) {
    return { ok: false, error: "Provider ID and external_product_id are required" };
  }

  // Cross-product mapping check: verify variants belong to the target product
  if (providerProduct.productId) {
    const allProducts = await getAllProductsAdmin();
    const targetProduct = allProducts.find((p) => p.id === providerProduct.productId);
    if (targetProduct) {
      const validVariantIds = new Set((targetProduct.variants || []).map((v) => v.id));
      for (const pv of providerVariants) {
        if (pv.productVariantId && !validVariantIds.has(pv.productVariantId)) {
          return { ok: false, error: "mapping_product_mismatch: variant does not belong to the target product" };
        }
      }
    }
  }

  // FAIL-CLOSED SUPABASE DB PATH
  if (hasSupabaseConfig()) {
    const serviceClient = createSupabaseServiceClient();
    if (!serviceClient) {
      return { ok: false, error: "Server configuration error: Supabase service client unavailable" };
    }

    const { data: rpcData, error: rpcErr } = await serviceClient.rpc("save_provider_mapping_with_audit", {
      p_provider_product: providerProduct,
      p_provider_variants: providerVariants,
      p_admin_id: _adminId,
    });

    if (rpcErr) {
      return { ok: false, error: `Database RPC execution error: ${rpcErr.message}` };
    }

    if (!rpcData || typeof rpcData !== "object" || !(rpcData as { ok?: boolean }).ok) {
      const errMessage = (rpcData as { error?: string })?.error || "Atomic provider mapping RPC returned error";
      return { ok: false, error: errMessage };
    }

    const mappings = await getAllProviderMappingsAdmin();
    const updated = mappings.providerProducts.find(
      (p) => p.externalProductId === extProdId && p.providerId === providerId,
    );
    return { ok: true, providerProduct: updated || (providerProduct as ProviderProduct) };
  }

  // LOCAL MEMORY FALLBACK
  seedPhase5MemoryStoreIfNeeded();
  const provProdId = providerProduct.id || `pprod-${providerId}-${extProdId}`;

  // Unique constraint check in memory
  for (const [pId, p] of memoryProviderProducts.entries()) {
    if (p.providerId === providerId && p.externalProductId === extProdId && pId !== provProdId) {
      return { ok: false, error: `Provider external product ID '${extProdId}' already mapped for this provider` };
    }
  }

  const provProdRecord: ProviderProduct = {
    id: provProdId,
    providerId,
    productId: providerProduct.productId,
    externalProductId: extProdId,
    name: providerProduct.name || providerProduct.title || extProdId,
    title: providerProduct.title,
    printMethodsJson: providerProduct.printMethodsJson || ["dtf"],
    printableAreasJson: providerProduct.printableAreasJson || [],
    mappingStatus: providerProduct.mappingStatus || "mapped",
    notes: providerProduct.notes,
    verifiedAt: providerProduct.mappingStatus === "verified" ? new Date().toISOString() : undefined,
    verifiedBy: providerProduct.mappingStatus === "verified" ? _adminId : undefined,
    createdAt: providerProduct.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryProviderProducts.set(provProdId, provProdRecord);

  const savedVariants: ProviderVariant[] = [];
  providerVariants.forEach((pv, idx) => {
    const extVarId = pv.externalVariantId?.trim() || `ext-var-${idx}`;
    const pVarId = pv.id || `pvar-${provProdId}-${extVarId}`;

    const pVarRecord: ProviderVariant = {
      id: pVarId,
      providerProductId: provProdId,
      productVariantId: pv.productVariantId,
      externalVariantId: extVarId,
      externalSku: pv.externalSku || extVarId,
      sku: pv.sku || pv.externalSku || extVarId,
      providerColor: pv.providerColor,
      providerSize: pv.providerSize,
      mappingStatus: pv.mappingStatus || "mapped",
      notes: pv.notes,
      verifiedAt: providerProduct.mappingStatus === "verified" ? new Date().toISOString() : undefined,
      verifiedBy: providerProduct.mappingStatus === "verified" ? _adminId : undefined,
      createdAt: pv.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryProviderVariants.set(pVarId, pVarRecord);
    savedVariants.push(pVarRecord);
  });

  provProdRecord.variants = savedVariants;
  return { ok: true, providerProduct: provProdRecord };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT MOCKUPS
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllMockupsAdmin(): Promise<ProductMockup[]> {
  if (hasSupabaseConfig()) {
    const serviceClient = createSupabaseServiceClient();
    if (!serviceClient) throw new Error("Server configuration error: Supabase service client unavailable");
    const { data, error } = await serviceClient.from("product_mockups").select("*").order("sort_order", { ascending: true });
    if (error) throw new Error(`Failed to fetch mockups: ${error.message}`);
    return (data || []).map((m: Record<string, unknown>) => ({
      id: String(m.id),
      productId: String(m.product_id),
      variantId: m.variant_id ? String(m.variant_id) : undefined,
      designId: m.design_id ? String(m.design_id) : undefined,
      placementId: m.placement_id ? String(m.placement_id) : undefined,
      imageUrl: String(m.image_url),
      viewType: (m.view_type || "front") as MockupViewType,
      isPrimary: Boolean(m.is_primary),
      sortOrder: Number(m.sort_order ?? 0),
      status: (m.status || "draft") as MockupStatus,
      createdAt: String(m.created_at),
      updatedAt: String(m.updated_at || m.created_at),
    }));
  }

  seedPhase5MemoryStoreIfNeeded();
  return Array.from(memoryMockups.values());
}

export async function saveMockupAdmin(
  input: Partial<ProductMockup>,
  _adminId: string,
): Promise<{ ok: true; mockup: ProductMockup } | { ok: false; error: string }> {
  const { productId, imageUrl } = input;
  if (!productId || !imageUrl || imageUrl.trim() === "") {
    return { ok: false, error: "Product ID and image URL are required for mockup" };
  }

  if (hasSupabaseConfig()) {
    const serviceClient = createSupabaseServiceClient();
    if (!serviceClient) return { ok: false, error: "Server configuration error: Supabase service client unavailable" };

    const mockupId = input.id || crypto.randomUUID();
    const { error } = await serviceClient.from("product_mockups").upsert({
      id: mockupId,
      product_id: productId,
      variant_id: input.variantId ?? null,
      design_id: input.designId ?? null,
      placement_id: input.placementId ?? null,
      image_url: imageUrl,
      view_type: input.viewType || "front",
      is_primary: Boolean(input.isPrimary),
      sort_order: input.sortOrder ?? 0,
      status: input.status || "draft",
      updated_at: new Date().toISOString(),
    });

    if (error) return { ok: false, error: error.message };

    const allMockups = await getAllMockupsAdmin();
    const saved = allMockups.find((m) => m.id === mockupId);
    return { ok: true, mockup: saved || (input as ProductMockup) };
  }

  seedPhase5MemoryStoreIfNeeded();
  const mockupId = input.id || `mock-${productId}-${memoryMockups.size + 1}`;
  const record: ProductMockup = {
    id: mockupId,
    productId,
    variantId: input.variantId,
    designId: input.designId,
    placementId: input.placementId,
    imageUrl,
    viewType: input.viewType || "front",
    isPrimary: Boolean(input.isPrimary),
    sortOrder: input.sortOrder ?? 0,
    status: input.status || "draft",
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryMockups.set(mockupId, record);
  return { ok: true, mockup: record };
}

export async function setMockupStatusAdmin(
  mockupId: string,
  status: "approved" | "rejected" | "draft",
  _adminId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (hasSupabaseConfig()) {
    const serviceClient = createSupabaseServiceClient();
    if (!serviceClient) return { ok: false, error: "Server configuration error: Supabase service client unavailable" };
    const { error } = await serviceClient
      .from("product_mockups")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", mockupId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  seedPhase5MemoryStoreIfNeeded();
  const existing = memoryMockups.get(mockupId);
  if (existing) {
    memoryMockups.set(mockupId, { ...existing, status, updatedAt: new Date().toISOString() });
  }
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// READINESS REPORT GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

export async function getProductReadinessReportsAdmin(): Promise<ProductReadinessReport[]> {
  const products = await getAllProductsAdmin();
  const designs = await getAllDesignsAdmin();
  const mappings = await getAllProviderMappingsAdmin();
  const mockups = await getAllMockupsAdmin();

  const designsMap = new Map<string, DesignAsset>(designs.map((d) => [d.id, d]));
  const placementsMap = new Map<string, DesignPlacement>();
  designs.forEach((d) => {
    (d.placements || []).forEach((p) => {
      if (p.productVariantId) placementsMap.set(p.productVariantId, p);
      if (p.productId) placementsMap.set(p.productId, p);
    });
  });

  const providerProductsMap = new Map<string, ProviderProduct>();
  mappings.providerProducts.forEach((pp) => {
    if (pp.productId) providerProductsMap.set(pp.productId, pp);
  });

  const providerVariantsMap = new Map<string, ProviderVariant>();
  mappings.providerVariants.forEach((pv) => {
    if (pv.productVariantId) providerVariantsMap.set(pv.productVariantId, pv);
  });

  return products.map((p) =>
    evaluateProductReadiness({
      product: p,
      designsMap,
      placementsMap,
      providerProductsMap,
      providerVariantsMap,
      mockups,
    })
  );
}
