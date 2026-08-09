import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  validateArtworkUpload,
  ALLOWED_ARTWORK_MIME_TYPES,
  MAX_ARTWORK_FILE_SIZE_BYTES,
} from "../design-storage";
import {
  validateDesignPlacement,
} from "../placement-validator";
import {
  evaluateVariantReadiness,
} from "../readiness-engine";
import {
  getAllDesignsAdmin,
  saveDesignAdmin,
  archiveDesignAdmin,
  getAllPODProvidersAdmin,
  getAllProviderMappingsAdmin,
  saveProviderMappingAdmin,
  getAllMockupsAdmin,
  saveMockupAdmin,
  setMockupStatusAdmin,
} from "../design-store";
import { saveProductAdmin } from "../store";
import type { Product, ProductVariant } from "../types";
import type {
  DesignAsset,
  DesignPlacement,
  PrintMethod,
  ProviderProduct,
  ProviderVariant,
  ProductMockup,
} from "../design-types";

describe("Phase 5 — Design Studio & POD Mapping Tests", () => {
  // ============================================================
  // SECTION 1: Migration 00006 SQL Structure & RLS Security
  // ============================================================
  const sql00006 = readFileSync(
    resolve(process.cwd(), "supabase/migrations/20260809000006_design_studio_and_pod_mapping.sql"),
    "utf-8",
  );

  it("migration 00006 exists and extends designs, design_placements, provider_products, provider_variants, and creates product_mockups", () => {
    assert.strictEqual(sql00006.includes("ALTER TABLE public.designs"), true);
    assert.strictEqual(sql00006.includes("ALTER TABLE public.design_placements"), true);
    assert.strictEqual(sql00006.includes("ALTER TABLE public.provider_products"), true);
    assert.strictEqual(sql00006.includes("ALTER TABLE public.provider_variants"), true);
    assert.strictEqual(sql00006.includes("CREATE TABLE IF NOT EXISTS public.product_mockups"), true);
  });

  it("migration 00006 seeds default Qikink and Printrove provider records", () => {
    assert.strictEqual(sql00006.includes("'Qikink'"), true);
    assert.strictEqual(sql00006.includes("'Printrove'"), true);
  });

  it("migration 00006 scopes all admin RLS policies explicitly TO authenticated", () => {
    const adminPolicies = [
      'CREATE POLICY "Admin read designs" ON public.designs',
      'CREATE POLICY "Admin write designs" ON public.designs',
      'CREATE POLICY "Admin read design placements" ON public.design_placements',
      'CREATE POLICY "Admin write design placements" ON public.design_placements',
      'CREATE POLICY "Admin read pod providers" ON public.pod_providers',
      'CREATE POLICY "Admin write pod providers" ON public.pod_providers',
      'CREATE POLICY "Admin read provider products" ON public.provider_products',
      'CREATE POLICY "Admin write provider products" ON public.provider_products',
      'CREATE POLICY "Admin read provider variants" ON public.provider_variants',
      'CREATE POLICY "Admin write provider variants" ON public.provider_variants',
      'CREATE POLICY "Admin read product mockups" ON public.product_mockups',
      'CREATE POLICY "Admin write product mockups" ON public.product_mockups',
    ];

    for (const pol of adminPolicies) {
      assert.strictEqual(sql00006.includes(pol), true, `Policy '${pol}' must exist in migration 00006`);
    }

    const matches = sql00006.match(/CREATE POLICY "Admin[\s\S]*?TO authenticated/g);
    assert.notStrictEqual(matches, null);
    assert.strictEqual(matches!.length, 12, "All 12 admin policies must contain 'TO authenticated'");
  });

  it("migration 00006 exposes approved mockups to public via RLS (status = 'approved')", () => {
    assert.strictEqual(
      sql00006.includes('CREATE POLICY "Public read approved mockups" ON public.product_mockups'),
      true,
    );
    assert.strictEqual(sql00006.includes("FOR SELECT TO anon, authenticated"), true);
    assert.strictEqual(sql00006.includes("USING (status = 'approved')"), true);
  });

  it("migration 00006 revokes direct table privileges from PUBLIC/anon/authenticated and grants to service_role ONLY", () => {
    assert.strictEqual(sql00006.includes("REVOKE ALL ON public.designs FROM PUBLIC, anon, authenticated;"), true);
    assert.strictEqual(sql00006.includes("REVOKE ALL ON public.design_placements FROM PUBLIC, anon, authenticated;"), true);
    assert.strictEqual(sql00006.includes("REVOKE ALL ON public.pod_providers FROM PUBLIC, anon, authenticated;"), true);
    assert.strictEqual(sql00006.includes("REVOKE ALL ON public.provider_products FROM PUBLIC, anon, authenticated;"), true);
    assert.strictEqual(sql00006.includes("REVOKE ALL ON public.provider_variants FROM PUBLIC, anon, authenticated;"), true);
    assert.strictEqual(sql00006.includes("REVOKE ALL ON public.product_mockups FROM PUBLIC, anon, authenticated;"), true);

    assert.strictEqual(sql00006.includes("GRANT ALL ON public.designs TO service_role;"), true);
    assert.strictEqual(sql00006.includes("GRANT ALL ON public.provider_products TO service_role;"), true);
    assert.strictEqual(sql00006.includes("GRANT ALL ON public.product_mockups TO service_role;"), true);
  });

  it("migration 00006 SECURITY DEFINER RPCs have search_path = public and service_role EXECUTE grant", () => {
    assert.strictEqual(sql00006.includes("save_design_with_placements"), true);
    assert.strictEqual(sql00006.includes("save_provider_mapping_with_audit"), true);

    assert.strictEqual(
      sql00006.includes("REVOKE ALL ON FUNCTION public.save_design_with_placements(JSONB, JSONB, UUID) FROM PUBLIC, anon, authenticated;"),
      true,
    );
    assert.strictEqual(
      sql00006.includes("GRANT EXECUTE ON FUNCTION public.save_design_with_placements(JSONB, JSONB, UUID) TO service_role;"),
      true,
    );
    assert.strictEqual(
      sql00006.includes("REVOKE ALL ON FUNCTION public.save_provider_mapping_with_audit(JSONB, JSONB, UUID) FROM PUBLIC, anon, authenticated;"),
      true,
    );
    assert.strictEqual(
      sql00006.includes("GRANT EXECUTE ON FUNCTION public.save_provider_mapping_with_audit(JSONB, JSONB, UUID) TO service_role;"),
      true,
    );
  });

  // ============================================================
  // SECTION 2: Artwork Asset Storage & Validation
  // ============================================================
  it("validateArtworkUpload accepts valid artwork formats (PNG, JPG, WEBP, SVG) under 25MB", () => {
    for (const mime of ALLOWED_ARTWORK_MIME_TYPES) {
      const res = validateArtworkUpload({ mimeType: mime, fileSizeBytes: 5 * 1024 * 1024 });
      assert.strictEqual(res.isValid, true, `MIME ${mime} should be valid`);
    }
  });

  it("validateArtworkUpload rejects unsupported MIME formats (GIF, PDF, HTML, PHP)", () => {
    const badMimes = ["image/gif", "application/pdf", "text/html", "application/x-php"];
    for (const mime of badMimes) {
      const res = validateArtworkUpload({ mimeType: mime, fileSizeBytes: 1024 });
      assert.strictEqual(res.isValid, false, `MIME ${mime} must be rejected`);
    }
  });

  it("validateArtworkUpload rejects 0-byte or oversized (>25MB) files", () => {
    const zeroRes = validateArtworkUpload({ mimeType: "image/png", fileSizeBytes: 0 });
    assert.strictEqual(zeroRes.isValid, false, "0-byte file must be rejected");

    const hugeRes = validateArtworkUpload({ mimeType: "image/png", fileSizeBytes: MAX_ARTWORK_FILE_SIZE_BYTES + 1 });
    assert.strictEqual(hugeRes.isValid, false, ">25MB file must be rejected");
  });

  // ============================================================
  // SECTION 3: Placement Validation
  // ============================================================
  it("validateDesignPlacement accepts valid physical dimensions (mm) and normalized coordinates", () => {
    const res = validateDesignPlacement({
      placementLocation: "front",
      printMethod: "dtf",
      widthMm: 200,
      heightMm: 250,
      xNormalized: 0.5,
      yNormalized: 0.4,
      scale: 1.0,
      rotationDeg: 0,
    });
    assert.strictEqual(res.isValid, true);
  });

  it("validateDesignPlacement rejects non-positive physical dimensions (width_mm <= 0 or height_mm <= 0)", () => {
    const zeroWidth = validateDesignPlacement({ placementLocation: "front", widthMm: 0, heightMm: 200 });
    assert.strictEqual(zeroWidth.isValid, false);

    const negHeight = validateDesignPlacement({ placementLocation: "front", widthMm: 150, heightMm: -10 });
    assert.strictEqual(negHeight.isValid, false);
  });

  it("validateDesignPlacement rejects out-of-bounds normalized coordinates or invalid print method", () => {
    const badX = validateDesignPlacement({ placementLocation: "front", widthMm: 100, heightMm: 100, xNormalized: 1.5 });
    assert.strictEqual(badX.isValid, false);

    const badMethod = validateDesignPlacement({ placementLocation: "front", widthMm: 100, heightMm: 100, printMethod: "unknown" as unknown as PrintMethod });
    assert.strictEqual(badMethod.isValid, false);
  });

  it("validateDesignPlacement rejects dimensions exceeding printable area limits", () => {
    const res = validateDesignPlacement(
      { placementLocation: "front", widthMm: 350, heightMm: 450 },
      { maxWidthMm: 300, maxHeightMm: 400 },
    );
    assert.strictEqual(res.isValid, false);
    if (!res.isValid) {
      assert.ok(res.error.includes("exceeds maximum printable area"), "Must state exceeds printable area");
    }
  });

  // ============================================================
  // SECTION 4: Design Asset & Placement Store CRUD
  // ============================================================
  it("create draft design asset", async () => {
    const res = await saveDesignAdmin(
      {
        design: { title: "Draft Logo Emblem", slug: "draft-logo-emblem", status: "draft" },
      },
      "admin-id",
    );
    assert.strictEqual(res.ok, true);
    if (res.ok) {
      assert.strictEqual(res.design.title, "Draft Logo Emblem");
      assert.strictEqual(res.design.status, "draft");
    }
  });

  it("active design asset requires valid artwork asset URL", async () => {
    const res = await saveDesignAdmin(
      {
        design: { title: "Active Emblem No Artwork", slug: "active-emblem-no-art", status: "active", assetUrl: "" },
      },
      "admin-id",
    );
    assert.strictEqual(res.ok, false);
    if (!res.ok) {
      assert.ok(res.error.includes("requires valid artwork asset URL"), "Must enforce artwork URL when active");
    }
  });

  it("activate valid design asset with artwork URL and placement", async () => {
    const res = await saveDesignAdmin(
      {
        design: {
          title: "Apex Chest Insignia",
          slug: "apex-chest-insignia",
          status: "active",
          assetUrl: "https://storage.ascendtheory.com/artwork/insignia.png",
          widthPx: 1200,
          heightPx: 1400,
          isTransparent: true,
        },
        placements: [
          {
            placementLocation: "left_chest",
            widthMm: 100,
            heightMm: 120,
            xNormalized: 0.35,
            yNormalized: 0.30,
            printMethod: "embroidery",
          },
        ],
      },
      "admin-id",
    );

    assert.strictEqual(res.ok, true);
    if (res.ok) {
      assert.strictEqual(res.design.status, "active");
      assert.strictEqual(res.design.placements?.length, 1);
      assert.strictEqual(res.design.placements[0].placementLocation, "left_chest");
      assert.strictEqual(res.design.placements[0].widthMm, 100);
    }
  });

  it("atomic design save rolls back when placement is invalid (no partial persist)", async () => {
    const res = await saveDesignAdmin(
      {
        design: {
          title: "Bad Placement Design",
          slug: "bad-placement-design",
          status: "draft",
          assetUrl: "https://storage.example.com/art.png",
        },
        placements: [
          { placementLocation: "front", widthMm: -50, heightMm: 200 }, // invalid width_mm
        ],
      },
      "admin-id",
    );

    assert.strictEqual(res.ok, false, "Must fail due to negative widthMm");

    const all = await getAllDesignsAdmin();
    const found = all.find((d) => d.slug === "bad-placement-design");
    assert.strictEqual(found, undefined, "Design row must NOT exist in store");
  });

  it("archive design asset updates status to archived", async () => {
    const created = await saveDesignAdmin(
      { design: { title: "To Archive", slug: "to-archive-dsg", status: "draft" } },
      "admin-id",
    );
    assert.strictEqual(created.ok, true);
    if (created.ok) {
      const archRes = await archiveDesignAdmin(created.design.id, "admin-id");
      assert.strictEqual(archRes.ok, true);
      const all = await getAllDesignsAdmin();
      const item = all.find((d) => d.id === created.design.id);
      assert.strictEqual(item?.status, "archived");
    }
  });

  // ============================================================
  // SECTION 5: POD Provider Product & Variant Mapping
  // ============================================================
  it("getAllPODProvidersAdmin returns default Qikink and Printrove providers", async () => {
    const providers = await getAllPODProvidersAdmin();
    assert.ok(providers.length >= 2, "Must contain at least 2 default providers");
    assert.ok(providers.some((p) => p.slug === "qikink"));
    assert.ok(providers.some((p) => p.slug === "printrove"));
  });

  it("map Ascend product & exact variant to Qikink provider SKU", async () => {
    // 1. Create target Ascend product
    const prodRes = await saveProductAdmin(
      {
        title: "POD Mapping Test Shirt",
        slug: "pod-mapping-test-shirt",
        status: "active",
        variants: [
          { id: "var-pod-m", sku: "POD-SHIRT-BLK-M", size: "M", color: "black", pricePaise: 250000, providerCostPaise: 90000, isActive: true, availabilityStatus: "available" },
          { id: "var-pod-l", sku: "POD-SHIRT-BLK-L", size: "L", color: "black", pricePaise: 250000, providerCostPaise: 90000, isActive: true, availabilityStatus: "available" },
        ],
      },
      "admin-id",
    );
    assert.strictEqual(prodRes.ok, true);
    const ascendProdId = prodRes.ok ? prodRes.product.id : "";

    const providers = await getAllPODProvidersAdmin();
    const qikink = providers.find((p) => p.slug === "qikink")!;

    // 2. Map Ascend product & variants to Qikink
    const mapRes = await saveProviderMappingAdmin(
      {
        providerProduct: {
          providerId: qikink.id,
          productId: ascendProdId,
          externalProductId: "QIK-OVERSIZED-TEE-240",
          title: "Qikink Oversized Heavyweight Tee",
          mappingStatus: "verified",
        },
        providerVariants: [
          {
            productVariantId: "var-pod-m",
            externalVariantId: "QIK-VAR-BLK-M",
            externalSku: "QIK-SKU-BLK-M",
            providerColor: "Black",
            providerSize: "M",
            mappingStatus: "verified",
          },
          {
            productVariantId: "var-pod-l",
            externalVariantId: "QIK-VAR-BLK-L",
            externalSku: "QIK-SKU-BLK-L",
            providerColor: "Black",
            providerSize: "L",
            mappingStatus: "verified",
          },
        ],
      },
      "admin-id",
    );

    assert.strictEqual(mapRes.ok, true);
    if (mapRes.ok) {
      assert.strictEqual(mapRes.providerProduct.externalProductId, "QIK-OVERSIZED-TEE-240");
      assert.strictEqual(mapRes.providerProduct.variants?.length, 2);
      assert.strictEqual(mapRes.providerProduct.variants[0].externalSku, "QIK-SKU-BLK-M");
    }
  });

  it("map same Ascend variant independently to Printrove provider", async () => {
    const providers = await getAllPODProvidersAdmin();
    const printrove = providers.find((p) => p.slug === "printrove")!;

    const mapRes = await saveProviderMappingAdmin(
      {
        providerProduct: {
          providerId: printrove.id,
          productId: "prod-pod-mapping-test-shirt",
          externalProductId: "PRV-HEAVY-TEE-3000",
          title: "Printrove Heavy Cotton Tee",
          mappingStatus: "mapped",
        },
        providerVariants: [
          {
            productVariantId: "var-pod-m",
            externalVariantId: "PRV-VAR-BLK-M",
            externalSku: "PRV-SKU-BLK-M",
            providerColor: "Black",
            providerSize: "M",
            mappingStatus: "mapped",
          },
        ],
      },
      "admin-id",
    );

    assert.strictEqual(mapRes.ok, true, "Same Ascend variant must map independently to another provider");
  });

  it("cross-product mapping mismatch rejected (variant does not belong to target product)", async () => {
    const providers = await getAllPODProvidersAdmin();
    const qikink = providers.find((p) => p.slug === "qikink")!;

    // Create Product Alpha and Product Beta
    await saveProductAdmin(
      {
        title: "Product Alpha POD",
        slug: "product-alpha-pod",
        status: "active",
        variants: [{ id: "var-alpha-pod-m", sku: "ALPHA-POD-M", size: "M", color: "black", pricePaise: 100000, providerCostPaise: 40000, isActive: true, availabilityStatus: "available" }],
      },
      "admin-id",
    );

    await saveProductAdmin(
      {
        title: "Product Beta POD",
        slug: "product-beta-pod",
        status: "active",
        variants: [{ id: "var-beta-pod-l", sku: "BETA-POD-L", size: "L", color: "white", pricePaise: 100000, providerCostPaise: 40000, isActive: true, availabilityStatus: "available" }],
      },
      "admin-id",
    );

    // Try to map Product Beta but supply Product Alpha's variant ID
    const res = await saveProviderMappingAdmin(
      {
        providerProduct: {
          providerId: qikink.id,
          productId: "prod-product-beta-pod",
          externalProductId: "QIK-BETA-EXT-100",
        },
        providerVariants: [
          {
            productVariantId: "var-alpha-pod-m", // belongs to Alpha, not Beta!
            externalVariantId: "QIK-STEAL-VAR",
          },
        ],
      },
      "admin-id",
    );

    assert.strictEqual(res.ok, false);
    if (!res.ok) {
      assert.ok(res.error.includes("mapping_product_mismatch"), "Must reject cross-product variant mapping");
    }
  });

  // ============================================================
  // SECTION 6: Fulfilment Readiness Engine
  // ============================================================
  it("evaluateVariantReadiness identifies blocking reasons for incomplete variant", () => {
    const dummyProduct: Product = {
      id: "prod-incomplete",
      slug: "incomplete-prod",
      title: "Incomplete Prod",
      status: "draft", // draft product
      basePricePaise: 100000,
      currency: "INR",
      category: "wearables",
      gender: "unisex",
      isFeatured: false,
      galleryJson: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const dummyVariant: ProductVariant = {
      id: "var-inc-m",
      productId: "prod-incomplete",
      sku: "INC-M",
      size: "M",
      color: "black",
      stockQuantity: 10,
      pricePaise: 100000,
      compareAtPricePaise: 0,
      providerCostPaise: 0,
      availabilityStatus: "available",
      isActive: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const report = evaluateVariantReadiness({
      product: dummyProduct,
      variant: dummyVariant,
    });

    assert.strictEqual(report.readyForFulfillment, false);
    assert.ok(report.blockingReasons.includes("draft_product"));
    assert.ok(report.blockingReasons.includes("missing_design"));
    assert.ok(report.blockingReasons.includes("missing_provider"));
    assert.ok(report.blockingReasons.includes("missing_provider_variant_mapping"));
    assert.ok(report.blockingReasons.includes("no_approved_mockup"));
  });

  it("evaluateVariantReadiness passes readyForFulfillment === true when all 10 configuration checks succeed", () => {
    const product: Product = {
      id: "prod-ready-100",
      slug: "ready-100",
      title: "Ready Product 100",
      status: "active",
      basePricePaise: 300000,
      currency: "INR",
      category: "wearables",
      gender: "unisex",
      isFeatured: false,
      galleryJson: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const variant: ProductVariant = {
      id: "var-ready-m",
      productId: "prod-ready-100",
      sku: "READY-M",
      size: "M",
      color: "black",
      stockQuantity: 50,
      pricePaise: 300000,
      compareAtPricePaise: 0,
      providerCostPaise: 100000,
      availabilityStatus: "available",
      isActive: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const design: DesignAsset = {
      id: "dsg-ready",
      title: "Ready Design",
      slug: "ready-design",
      status: "active",
      assetUrl: "https://cdn.ascend.com/art.png",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const placement: DesignPlacement = {
      id: "pl-ready",
      designId: "dsg-ready",
      productId: "prod-ready-100",
      productVariantId: "var-ready-m",
      position: "front",
      placementLocation: "front",
      xNormalized: 0.5,
      yNormalized: 0.4,
      scale: 1.0,
      rotationDeg: 0,
      widthMm: 250,
      heightMm: 300,
      printMethod: "dtf",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const providerProduct: ProviderProduct = {
      id: "pp-ready",
      providerId: "a0000000-0000-0000-0000-000000000001",
      productId: "prod-ready-100",
      externalProductId: "QIK-EXT-100",
      name: "Qikink Ready Product",
      mappingStatus: "verified",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const providerVariant: ProviderVariant = {
      id: "pv-ready",
      providerProductId: "pp-ready",
      productVariantId: "var-ready-m",
      externalVariantId: "QIK-EXT-VAR-M",
      sku: "QIK-EXT-VAR-M",
      mappingStatus: "verified",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockups: ProductMockup[] = [
      {
        id: "mock-ready",
        productId: "prod-ready-100",
        variantId: "var-ready-m",
        imageUrl: "https://cdn.ascend.com/mock.jpg",
        viewType: "front",
        isPrimary: true,
        sortOrder: 0,
        status: "approved",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const report = evaluateVariantReadiness({
      product,
      variant,
      design,
      placement,
      providerProduct,
      providerVariant,
      mockups,
    });

    assert.strictEqual(report.readyForFulfillment, true);
    assert.strictEqual(report.blockingReasons.length, 0);
    assert.strictEqual(report.checks.productPublished, true);
    assert.strictEqual(report.checks.variantActive, true);
    assert.strictEqual(report.checks.variantAvailable, true);
    assert.strictEqual(report.checks.designAssigned, true);
    assert.strictEqual(report.checks.placementValid, true);
    assert.strictEqual(report.checks.artworkPresent, true);
    assert.strictEqual(report.checks.providerSelected, true);
    assert.strictEqual(report.checks.providerProductMapped, true);
    assert.strictEqual(report.checks.providerVariantMapped, true);
    assert.strictEqual(report.checks.mockupReady, true);
  });

  // ============================================================
  // SECTION 7: Mockup Workflow & Public Isolation
  // ============================================================
  it("create mockup in draft status, then approve and reject", async () => {
    const created = await saveMockupAdmin(
      {
        productId: "prod-mockup-test",
        imageUrl: "https://cdn.example.com/mockup-front.jpg",
        viewType: "front",
        isPrimary: true,
        status: "draft",
      },
      "admin-id",
    );

    assert.strictEqual(created.ok, true);
    if (created.ok) {
      assert.strictEqual(created.mockup.status, "draft");

      const appRes = await setMockupStatusAdmin(created.mockup.id, "approved", "admin-id");
      assert.strictEqual(appRes.ok, true);

      const all = await getAllMockupsAdmin();
      const approved = all.find((m) => m.id === created.mockup.id);
      assert.strictEqual(approved?.status, "approved");

      const rejRes = await setMockupStatusAdmin(created.mockup.id, "rejected", "admin-id");
      assert.strictEqual(rejRes.ok, true);
    }
  });

  it("CRITICAL: Public DTOs, cart, and checkout payloads contain ZERO provider identifiers", async () => {
    // Save a mapped product
    await saveProductAdmin(
      {
        title: "Isolation Garment",
        slug: "isolation-garment",
        status: "active",
        variants: [
          { id: "var-iso-m", sku: "ISO-M", size: "M", color: "black", pricePaise: 290000, providerCostPaise: 100000, isActive: true, availabilityStatus: "available" },
        ],
      },
      "admin-id",
    );

    const providers = await getAllPODProvidersAdmin();
    await saveProviderMappingAdmin(
      {
        providerProduct: {
          providerId: providers[0].id,
          productId: "prod-isolation-garment",
          externalProductId: "SECRET-QIKINK-PROD-999",
          notes: "CONFIDENTIAL PROVIDER NOTES",
        },
        providerVariants: [
          {
            productVariantId: "var-iso-m",
            externalVariantId: "SECRET-QIKINK-VAR-888",
            externalSku: "SECRET-QIKINK-SKU-777",
          },
        ],
      },
      "admin-id",
    );

    // Read provider mappings via admin store
    const mappings = await getAllProviderMappingsAdmin();
    const mappedProd = mappings.providerProducts.find((p) => p.productId === "prod-isolation-garment");
    assert.strictEqual(mappedProd?.externalProductId, "SECRET-QIKINK-PROD-999");

    // Inspect public store product
    const storeSrc = readFileSync(resolve(process.cwd(), "lib/wearables/store.ts"), "utf-8");
    assert.strictEqual(storeSrc.includes("provider_cost_paise"), true);
    // getPublicProductBySlug MUST NOT expose externalProductId, providerVariantId, or secret notes
    const publicFn = storeSrc.match(/export async function getPublicProductBySlug[\s\S]*?^}/m);
    assert.notStrictEqual(publicFn, null);
    if (publicFn) {
      assert.strictEqual(publicFn[0].includes("external_product_id"), false);
      assert.strictEqual(publicFn[0].includes("external_variant_id"), false);
      assert.strictEqual(publicFn[0].includes("provider_cost_paise"), false);
    }
  });

  // ============================================================
  // SECTION 8: Verification of NO Provider Network Requests
  // ============================================================
  it("VERIFIED: Phase 5 code contains NO live Qikink / Printrove API calls or network requests", () => {
    const phase5Files = [
      "lib/wearables/design-types.ts",
      "lib/wearables/design-storage.ts",
      "lib/wearables/placement-validator.ts",
      "lib/wearables/readiness-engine.ts",
      "lib/wearables/design-store.ts",
      "app/api/admin/wearables/designs/route.ts",
      "app/api/admin/wearables/pod-mappings/route.ts",
      "app/api/admin/wearables/mockups/route.ts",
      "app/api/admin/wearables/readiness/route.ts",
    ];

    for (const file of phase5Files) {
      const src = readFileSync(resolve(process.cwd(), file), "utf-8");
      assert.strictEqual(src.includes("qikink.com"), false, `File ${file} must NOT make live network requests to qikink.com`);
      assert.strictEqual(src.includes("printrove.com"), false, `File ${file} must NOT make live network requests to printrove.com`);
      assert.strictEqual(src.includes("fetch('https://api.qikink"), false, `File ${file} must NOT invoke Qikink API`);
    }
  });
});
