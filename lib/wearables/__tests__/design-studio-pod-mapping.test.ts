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
  evaluateVariantReadiness,
} from "../readiness-engine";
import {
  saveDesignAdmin,
  getAllPODProvidersAdmin,
  getAllProviderMappingsAdmin,
  saveProviderMappingAdmin,
} from "../design-store";
import { saveProductAdmin } from "../store";
import type { Product, ProductVariant } from "../types";
import type {
  DesignAsset,
  DesignPlacement,
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

  it("migration 00006 contains valid JSONB tag array conversion using jsonb_array_elements_text", () => {
    assert.strictEqual(sql00006.includes("jsonb_array_elements_text"), true);
    assert.strictEqual(sql00006.includes("ARRAY(SELECT jsonb_array_elements_text"), true);
  });

  it("migration 00006 grants SELECT only on PUBLIC-SAFE columns of product_mockups to anon/authenticated", () => {
    assert.strictEqual(
      sql00006.includes(
        "GRANT SELECT (id, product_id, variant_id, image_url, view_type, is_primary, sort_order, status, created_at, updated_at)",
      ),
      true,
    );
    assert.strictEqual(sql00006.includes("ON public.product_mockups TO anon, authenticated;"), true);
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

  // ============================================================
  // SECTION 2: Artwork Asset Storage & Upload Validation
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
  // SECTION 3: Placement & Tag Array Validation
  // ============================================================
  it("saveDesignAdmin accepts valid tag arrays ([] and ['core', 'black'])", async () => {
    const resEmpty = await saveDesignAdmin(
      { design: { title: "Tag Design Empty", slug: "tag-dsg-empty", tags: [] } },
      "admin-id",
    );
    assert.strictEqual(resEmpty.ok, true);

    const resTags = await saveDesignAdmin(
      { design: { title: "Tag Design Core", slug: "tag-dsg-core", tags: ["core", "black"] } },
      "admin-id",
    );
    assert.strictEqual(resTags.ok, true);
    if (resTags.ok) {
      assert.deepStrictEqual(resTags.design.tags, ["core", "black"]);
    }
  });

  it("saveDesignAdmin rejects invalid non-array tags", async () => {
    const resBad = await saveDesignAdmin(
      { design: { title: "Tag Design Bad", slug: "tag-dsg-bad", tags: "not-an-array" as unknown as string[] } },
      "admin-id",
    );
    assert.strictEqual(resBad.ok, false);
    if (!resBad.ok) {
      assert.ok(resBad.error.includes("tags must be a JSON array"));
    }
  });

  it("saveDesignAdmin rejects placement without variant or placement/variant mismatch", async () => {
    const pRes = await saveProductAdmin(
      {
        title: "Product Placement Test",
        slug: "prod-placement-test",
        status: "active",
        variants: [{ id: "var-plc-1", sku: "PLC-1", size: "M", color: "black", pricePaise: 1000, providerCostPaise: 500, isActive: true, availabilityStatus: "available" }],
      },
      "admin-id",
    );
    assert.strictEqual(pRes.ok, true);
    const prodId = pRes.ok ? pRes.product.id : "prod-prod-placement-test";

    const resNoVar = await saveDesignAdmin(
      {
        design: { title: "No Var Design", slug: "no-var-dsg" },
        placements: [{ productId: prodId, placementLocation: "front", widthMm: 200, heightMm: 250 }],
      },
      "admin-id",
    );
    assert.strictEqual(resNoVar.ok, false);

    const resMismatch = await saveDesignAdmin(
      {
        design: { title: "Mismatch Var Design", slug: "mismatch-var-dsg" },
        placements: [{ productId: prodId, productVariantId: "non-existent-var-id", placementLocation: "front", widthMm: 200, heightMm: 250 }],
      },
      "admin-id",
    );
    assert.strictEqual(resMismatch.ok, false);
    if (!resMismatch.ok) {
      assert.ok(resMismatch.error.includes("placement_product_variant_mismatch"));
    }
  });

  // ============================================================
  // SECTION 4: POD Mapping Edits & Rebound Protection
  // ============================================================
  it("saveProviderMappingAdmin preserves row ID on edit and updates same row", async () => {
    const providers = await getAllPODProvidersAdmin();
    const qikink = providers[0];

    const initial = await saveProviderMappingAdmin(
      {
        providerProduct: {
          providerId: qikink.id,
          productId: "prod-placement-test",
          externalProductId: "QIK-EXT-EDIT-100",
          title: "Initial Title",
          mappingStatus: "draft",
        },
        providerVariants: [
          { productVariantId: "var-plc-1", externalVariantId: "QIK-VAR-100", externalSku: "QIK-SKU-100" },
        ],
      },
      "admin-id",
    );

    assert.strictEqual(initial.ok, true);
    if (initial.ok) {
      const initialId = initial.providerProduct.id;
      const initialVarId = initial.providerProduct.variants?.[0]?.id;

      // Edit title and external SKU using SAME row IDs
      const updated = await saveProviderMappingAdmin(
        {
          providerProduct: {
            id: initialId,
            providerId: qikink.id,
            productId: "prod-placement-test",
            externalProductId: "QIK-EXT-EDIT-100",
            title: "Updated Title",
            mappingStatus: "verified",
          },
          providerVariants: [
            { id: initialVarId, productVariantId: "var-plc-1", externalVariantId: "QIK-VAR-100", externalSku: "QIK-SKU-100-NEW" },
          ],
        },
        "admin-id",
      );

      assert.strictEqual(updated.ok, true);
      if (updated.ok) {
        assert.strictEqual(updated.providerProduct.id, initialId, "Must retain same provider product ID");
        assert.strictEqual(updated.providerProduct.title, "Updated Title");
        assert.strictEqual(updated.providerProduct.variants?.[0]?.id, initialVarId, "Must retain same provider variant ID");
        assert.strictEqual(updated.providerProduct.variants?.[0]?.externalSku, "QIK-SKU-100-NEW");
      }
    }
  });

  it("provider product rebound rejected (attempting to change providerId on existing row)", async () => {
    const providers = await getAllPODProvidersAdmin();
    const qikink = providers.find((p) => p.slug === "qikink")!;
    const printrove = providers.find((p) => p.slug === "printrove")!;

    const createRes = await saveProviderMappingAdmin(
      {
        providerProduct: {
          id: "pp-rebound-test",
          providerId: qikink.id,
          productId: "prod-placement-test",
          externalProductId: "QIK-REBOUND-1",
        },
      },
      "admin-id",
    );
    assert.strictEqual(createRes.ok, true);

    // Try to edit row pp-rebound-test to Printrove
    const reboundRes = await saveProviderMappingAdmin(
      {
        providerProduct: {
          id: "pp-rebound-test",
          providerId: printrove.id, // rebound!
          productId: "prod-placement-test",
          externalProductId: "QIK-REBOUND-1",
        },
      },
      "admin-id",
    );

    assert.strictEqual(reboundRes.ok, false);
    if (!reboundRes.ok) {
      assert.ok(reboundRes.error.includes("provider_product_rebound"));
    }
  });

  // ============================================================
  // SECTION 5: Multi-Provider & Readiness Rules
  // ============================================================
  it("evaluateVariantReadiness enforces printable area limit check (print_exceeds_provider_area)", () => {
    const dummyProduct: Product = {
      id: "prod-print-area",
      slug: "print-area-prod",
      title: "Print Area Prod",
      status: "active",
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
      id: "var-pa-1",
      productId: "prod-print-area",
      sku: "PA-1",
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

    const design: DesignAsset = {
      id: "dsg-pa",
      title: "PA Design",
      slug: "pa-design",
      status: "active",
      assetUrl: "https://cdn.example.com/art.png",
      storagePath: "artwork/2026/art.png",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const oversizedPlacement: DesignPlacement = {
      id: "pl-oversized",
      designId: "dsg-pa",
      productId: "prod-print-area",
      productVariantId: "var-pa-1",
      position: "front",
      placementLocation: "front",
      xNormalized: 0.5,
      yNormalized: 0.5,
      scale: 1.0,
      rotationDeg: 0,
      widthMm: 450, // oversized! limit is 300mm
      heightMm: 500,
      printMethod: "dtf",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const providerProduct: ProviderProduct = {
      id: "pp-pa",
      providerId: "a0000000-0000-0000-0000-000000000001",
      productId: "prod-print-area",
      externalProductId: "QIK-PA-100",
      name: "Qikink PA Product",
      printableAreasJson: [
        { location: "front", maxWidthMm: 300, maxHeightMm: 400, printMethod: "dtf" },
      ],
      mappingStatus: "verified",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const providerVariant: ProviderVariant = {
      id: "pv-pa",
      providerProductId: "pp-pa",
      productVariantId: "var-pa-1",
      externalVariantId: "QIK-PA-VAR-1",
      sku: "QIK-PA-VAR-1",
      mappingStatus: "verified",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockups: ProductMockup[] = [
      {
        id: "mock-pa",
        productId: "prod-print-area",
        variantId: "var-pa-1",
        imageUrl: "https://cdn.example.com/mock.png",
        viewType: "front",
        isPrimary: true,
        sortOrder: 0,
        status: "approved",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const report = evaluateVariantReadiness({
      product: dummyProduct,
      variant: dummyVariant,
      design,
      placement: oversizedPlacement,
      providerProduct,
      providerVariant,
      mockups,
    });

    assert.strictEqual(report.readyForFulfillment, false);
    assert.ok(report.blockingReasons.includes("print_exceeds_provider_area"), "Must report print_exceeds_provider_area");
  });

  it("evaluateVariantReadiness evaluates multi-provider paths deterministically and independently", () => {
    const dummyProduct: Product = {
      id: "prod-multi-prov",
      slug: "multi-prov-prod",
      title: "Multi Provider Prod",
      status: "active",
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
      id: "var-mp-1",
      productId: "prod-multi-prov",
      sku: "MP-1",
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

    const design: DesignAsset = {
      id: "dsg-mp",
      title: "MP Design",
      slug: "mp-design",
      status: "active",
      assetUrl: "https://cdn.example.com/art.png",
      storagePath: "artwork/2026/art.png",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const placement: DesignPlacement = {
      id: "pl-mp",
      designId: "dsg-mp",
      productId: "prod-multi-prov",
      productVariantId: "var-mp-1",
      position: "front",
      placementLocation: "front",
      xNormalized: 0.5,
      yNormalized: 0.5,
      scale: 1.0,
      rotationDeg: 0,
      widthMm: 200,
      heightMm: 250,
      printMethod: "dtf",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockups: ProductMockup[] = [
      {
        id: "mock-mp",
        productId: "prod-multi-prov",
        variantId: "var-mp-1",
        imageUrl: "https://cdn.example.com/mock.png",
        viewType: "front",
        isPrimary: true,
        sortOrder: 0,
        status: "approved",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const qikinkPath = {
      provider: { id: "p-qikink", slug: "qikink", name: "Qikink", isActive: true, createdAt: "" },
      providerProduct: { id: "pp-q", providerId: "p-qikink", productId: "prod-multi-prov", externalProductId: "QIK-1", name: "Qikink", mappingStatus: "verified" as const, createdAt: "", updatedAt: "" },
      providerVariant: { id: "pv-q", providerProductId: "pp-q", productVariantId: "var-mp-1", externalVariantId: "QIK-V1", sku: "QIK-V1", mappingStatus: "verified" as const, createdAt: "", updatedAt: "" },
    };

    const printrovePath = {
      provider: { id: "p-printrove", slug: "printrove", name: "Printrove", isActive: true, createdAt: "" },
      providerProduct: { id: "pp-pr", providerId: "p-printrove", productId: "prod-multi-prov", externalProductId: "PRV-1", name: "Printrove", mappingStatus: "draft" as const, createdAt: "", updatedAt: "" }, // draft!
      providerVariant: { id: "pv-pr", providerProductId: "pp-pr", productVariantId: "var-mp-1", externalVariantId: "PRV-V1", sku: "PRV-V1", mappingStatus: "draft" as const, createdAt: "", updatedAt: "" },
    };

    const report = evaluateVariantReadiness({
      product: dummyProduct,
      variant: dummyVariant,
      design,
      placement,
      providerMappings: [qikinkPath, printrovePath],
      mockups,
    });

    assert.strictEqual(report.readyForFulfillment, true, "Overall ready because Qikink path is verified & ready");
    assert.strictEqual(report.providerReadiness?.length, 2);
    assert.strictEqual(report.providerReadiness?.[0].ready, true, "Qikink path is ready");
    assert.strictEqual(report.providerReadiness?.[1].ready, false, "Printrove path is not ready due to unverified status");
  });

  // ============================================================
  // SECTION 6: VERIFICATION OF ZERO PROVIDER NETWORK REQUESTS
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
