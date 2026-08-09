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
  getAllDesignsAdmin,
  saveDesignAdmin,
  saveProviderMappingAdmin,
  saveMockupAdmin,
} from "../design-store";
import { saveProductAdmin } from "../store";
import type { Product, ProductVariant } from "../types";
import type {
  DesignAsset,
  DesignPlacement,
  ProductMockup,
} from "../design-types";
import { PATCH as mockupPatchHandler } from "@/app/api/admin/wearables/mockups/route";

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

  it("migration 00006 public read approved mockups RLS policy requires active parent product and active available variant", () => {
    assert.strictEqual(sql00006.includes('CREATE POLICY "Public read approved mockups" ON public.product_mockups'), true);
    assert.strictEqual(sql00006.includes("p.status = 'active'"), true);
    assert.strictEqual(sql00006.includes("v.availability_status = 'available'"), true);
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
  // SECTION 3: Signed URL Non-Persistence Tests (Req #13)
  // ============================================================
  it("signed preview URL is NEVER persisted to designs.asset_url", async () => {
    const saveRes = await saveDesignAdmin(
      {
        design: {
          title: "Private Storage Design",
          slug: "priv-dsg-1",
          status: "draft",
          storagePath: "private/artwork/priv-dsg-1/logo.png",
          previewUrl: "https://signed.preview.url/temp-token-12345",
          mimeType: "image/png",
          fileSizeBytes: 2048,
        },
      },
      "admin-id",
    );

    assert.strictEqual(saveRes.ok, true);
    if (saveRes.ok) {
      assert.strictEqual(saveRes.design.storagePath, "private/artwork/priv-dsg-1/logo.png");
      assert.strictEqual(saveRes.design.assetUrl, "", "assetUrl must remain empty when private storagePath is present");
    }

    const allDesigns = await getAllDesignsAdmin();
    const fetched = allDesigns.find((d) => d.slug === "priv-dsg-1");
    assert.ok(fetched);
    assert.strictEqual(fetched?.storagePath, "private/artwork/priv-dsg-1/logo.png");
    assert.strictEqual(fetched?.assetUrl, "");
    assert.ok(fetched?.previewUrl, "Server must generate previewUrl on read");
    assert.notStrictEqual(fetched?.previewUrl, "https://signed.preview.url/temp-token-12345", "Preview URL must not be static old string");
  });

  // ============================================================
  // SECTION 4: Disable -> Re-Add Placement History Reactivation (Req #4 & #5)
  // ============================================================
  it("re-adding a disabled placement location reuses historical row ID without duplicate or unique error", async () => {
    const dummyProduct: Product = {
      id: "prod-readd-pl",
      slug: "readd-pl-prod",
      title: "Readd Placement Product",
      status: "active",
      basePricePaise: 100000,
      currency: "INR",
      category: "wearables",
      gender: "unisex",
      isFeatured: false,
      galleryJson: [],
      variants: [
        {
          id: "var-radd-1",
          productId: "prod-readd-pl",
          sku: "RADD-1",
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
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveProductAdmin(dummyProduct, "admin-id");

    const frontPl: Partial<DesignPlacement> = {
      productId: "prod-readd-pl",
      productVariantId: "var-radd-1",
      placementLocation: "front",
      widthMm: 200,
      heightMm: 250,
      printMethod: "dtf",
      isActive: true,
    };

    // 1. Create Black/M front, save
    const res1 = await saveDesignAdmin(
      {
        design: { title: "Readd Placement Design", slug: "readd-pl-dsg", status: "draft" },
        placements: [frontPl],
      },
      "admin-id",
    );
    assert.strictEqual(res1.ok, true);
    const initialPlId = res1.ok ? res1.design.placements?.[0]?.id : undefined;
    assert.ok(initialPlId);

    // 2. Remove front -> row becomes isActive = false
    const res2 = await saveDesignAdmin(
      {
        design: { id: res1.ok ? res1.design.id : undefined, title: "Readd Placement Design", slug: "readd-pl-dsg", status: "draft" },
        placements: [],
      },
      "admin-id",
    );
    assert.strictEqual(res2.ok, true);
    if (res2.ok) {
      const activePls = res2.design.placements?.filter((p) => p.isActive);
      assert.strictEqual(activePls?.length, 0, "Placement must be deactivated");
    }

    // 3. Re-add Black/M front without ID -> same historical placement row ID is reused
    const res3 = await saveDesignAdmin(
      {
        design: { id: res1.ok ? res1.design.id : undefined, title: "Readd Placement Design", slug: "readd-pl-dsg", status: "draft" },
        placements: [{ ...frontPl, widthMm: 210 }],
      },
      "admin-id",
    );

    assert.strictEqual(res3.ok, true);
    if (res3.ok) {
      const activePls = res3.design.placements?.filter((p) => p.isActive);
      assert.strictEqual(activePls?.length, 1, "Exactly one active placement row must exist");
      assert.strictEqual(activePls?.[0].id, initialPlId, "Historical placement row ID MUST be reused");
      assert.strictEqual(activePls?.[0].widthMm, 210, "Dimensions updated on historical row");
    }
  });

  // ============================================================
  // SECTION 5: Mockup Null-Rebound & Placement Compatibility Tests (Req #6, #7, #15)
  // ============================================================
  it("saveMockupAdmin enforces null-safe mockup rebound", async () => {
    const dummyProduct1: Product = {
      id: "prod-mock-reb",
      slug: "mock-prod-reb",
      title: "Mockup Rebound Product",
      status: "active",
      basePricePaise: 100000,
      currency: "INR",
      category: "wearables",
      gender: "unisex",
      isFeatured: false,
      galleryJson: [],
      variants: [
        {
          id: "var-mk-reb-1",
          productId: "prod-mock-reb",
          sku: "MK-REB-1",
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
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveProductAdmin(dummyProduct1, "admin-id");

    const mockupRes = await saveMockupAdmin(
      {
        id: "mock-reb-null-1",
        productId: "prod-mock-reb",
        variantId: "var-mk-reb-1",
        imageUrl: "https://cdn.example.com/mock1.png",
        viewType: "front",
        status: "draft",
      },
      "admin-id",
    );
    assert.strictEqual(mockupRes.ok, true);

    // Rebound test: submit same ID with variantId: null -> reject with mockup_rebound
    const badNullRebound = await saveMockupAdmin(
      {
        id: "mock-reb-null-1",
        productId: "prod-mock-reb",
        variantId: undefined, // NULL!
        imageUrl: "https://cdn.example.com/mock1.png",
      },
      "admin-id",
    );
    assert.strictEqual(badNullRebound.ok, false);
    assert.strictEqual(badNullRebound.error, "mockup_rebound");
  });

  it("mockups route exports PATCH for mockup status transitions", async () => {
    assert.ok(mockupPatchHandler, "mockups route MUST export PATCH function");
  });

  // ============================================================
  // SECTION 6: Multi-Placement & Multi-Design Readiness Tests (Req #1, #2, #3, #14)
  // ============================================================
  it("evaluateVariantReadiness evaluates ALL active placements across multi-designs and provider printable areas", () => {
    const dummyProduct: Product = {
      id: "prod-all-pl-rd",
      slug: "all-pl-rd-prod",
      title: "All Placements Readiness Prod",
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
      id: "var-all-pl-1",
      productId: "prod-all-pl-rd",
      sku: "ALL-PL-1",
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

    const activeDesignA: DesignAsset = {
      id: "dsg-a",
      title: "Design A Active",
      slug: "dsg-a-active",
      status: "active",
      assetUrl: "https://cdn.example.com/art-a.png",
      storagePath: "artwork/2026/art-a.png",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const draftDesignB: DesignAsset = {
      id: "dsg-b",
      title: "Design B Draft",
      slug: "dsg-b-draft",
      status: "draft", // DRAFT!
      assetUrl: "https://cdn.example.com/art-b.png",
      storagePath: "artwork/2026/art-b.png",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const designsMap = new Map<string, DesignAsset>([
      ["dsg-a", activeDesignA],
      ["dsg-b", draftDesignB],
    ]);

    const frontPl: DesignPlacement = {
      id: "pl-front-multi",
      designId: "dsg-a",
      productId: "prod-all-pl-rd",
      productVariantId: "var-all-pl-1",
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

    const backPlOversized: DesignPlacement = {
      id: "pl-back-multi",
      designId: "dsg-a",
      productId: "prod-all-pl-rd",
      productVariantId: "var-all-pl-1",
      position: "back",
      placementLocation: "back",
      xNormalized: 0.5,
      yNormalized: 0.5,
      scale: 1.0,
      rotationDeg: 0,
      widthMm: 450, // oversized for Qikink max 350mm!
      heightMm: 500,
      printMethod: "dtf",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockups: ProductMockup[] = [
      {
        id: "mock-all-pl",
        productId: "prod-all-pl-rd",
        variantId: "var-all-pl-1",
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
      providerProduct: {
        id: "pp-q",
        providerId: "p-qikink",
        productId: "prod-all-pl-rd",
        externalProductId: "QIK-1",
        name: "Qikink",
        printableAreasJson: [
          { location: "front" as const, maxWidthMm: 300, maxHeightMm: 400, printMethod: "dtf" as const },
          { location: "back" as const, maxWidthMm: 350, maxHeightMm: 400, printMethod: "dtf" as const }, // max 350mm
        ],
        mappingStatus: "verified" as const,
        createdAt: "",
        updatedAt: "",
      },
      providerVariant: { id: "pv-q", providerProductId: "pp-q", productVariantId: "var-all-pl-1", externalVariantId: "QIK-V1", sku: "QIK-V1", mappingStatus: "verified" as const, createdAt: "", updatedAt: "" },
    };

    const printrovePath = {
      provider: { id: "p-printrove", slug: "printrove", name: "Printrove", isActive: true, createdAt: "" },
      providerProduct: {
        id: "pp-pr",
        providerId: "p-printrove",
        productId: "prod-all-pl-rd",
        externalProductId: "PRV-1",
        name: "Printrove",
        printableAreasJson: [
          { location: "front" as const, maxWidthMm: 300, maxHeightMm: 400, printMethod: "dtf" as const },
          { location: "back" as const, maxWidthMm: 500, maxHeightMm: 600, printMethod: "dtf" as const }, // supports 450mm back!
        ],
        mappingStatus: "verified" as const,
        createdAt: "",
        updatedAt: "",
      },
      providerVariant: { id: "pv-pr", providerProductId: "pp-pr", productVariantId: "var-all-pl-1", externalVariantId: "PRV-V1", sku: "PRV-V1", mappingStatus: "verified" as const, createdAt: "", updatedAt: "" },
    };

    // 1. Both placements active, back is oversized for Qikink (450mm > 350mm) but valid for Printrove (450mm < 500mm)
    const report1 = evaluateVariantReadiness({
      product: dummyProduct,
      variant: dummyVariant,
      placements: [frontPl, backPlOversized],
      designsMap,
      providerMappings: [qikinkPath, printrovePath],
      mockups,
    });

    assert.strictEqual(report1.readyForFulfillment, true, "Overall ready because Printrove supports 450mm back placement");
    const q1 = report1.providerReadiness?.find((p) => p.providerSlug === "qikink");
    const pr1 = report1.providerReadiness?.find((p) => p.providerSlug === "printrove");
    assert.strictEqual(q1?.ready, false, "Qikink path is blocked due to print_exceeds_provider_area on back placement");
    assert.ok(q1?.reasons.includes("print_exceeds_provider_area"));
    assert.strictEqual(pr1?.ready, true, "Printrove path is ready");

    // 2. Multi-design test: Front = Design A (active), Back = Design B (draft) -> variant NOT ready
    const backPlDraftDesign: DesignPlacement = { ...backPlOversized, designId: "dsg-b", widthMm: 300 };
    const report2 = evaluateVariantReadiness({
      product: dummyProduct,
      variant: dummyVariant,
      placements: [frontPl, backPlDraftDesign],
      designsMap,
      providerMappings: [qikinkPath, printrovePath],
      mockups,
    });

    assert.strictEqual(report2.readyForFulfillment, false, "Variant MUST NOT be ready when back placement design is draft");
    assert.ok(report2.blockingReasons.includes("draft_design"), "Must include draft_design blocking reason");
  });

  // ============================================================
  // SECTION 7: Preserve Printable Areas on Edit Test (Req #11)
  // ============================================================
  it("saveProviderMappingAdmin preserves existing printMethodsJson and printableAreasJson on edit", async () => {
    const initRes = await saveProviderMappingAdmin(
      {
        providerProduct: {
          providerId: "a0000000-0000-0000-0000-000000000001",
          externalProductId: "QIK-EDIT-AREA-100",
          title: "Qikink Area Product",
          printMethodsJson: ["dtf", "screen_print"],
          printableAreasJson: [
            { location: "front", maxWidthMm: 300, maxHeightMm: 400, printMethod: "dtf" },
          ],
          mappingStatus: "mapped",
        },
      },
      "admin-id",
    );
    assert.strictEqual(initRes.ok, true);
    const existingId = initRes.ok ? initRes.providerProduct.id : undefined;
    assert.ok(existingId);

    // Edit notes & title while passing existing printMethodsJson and printableAreasJson
    const editRes = await saveProviderMappingAdmin(
      {
        providerProduct: {
          id: existingId,
          providerId: "a0000000-0000-0000-0000-000000000001",
          externalProductId: "QIK-EDIT-AREA-100",
          title: "Qikink Area Product Updated",
          printMethodsJson: ["dtf", "screen_print"],
          printableAreasJson: [
            { location: "front", maxWidthMm: 300, maxHeightMm: 400, printMethod: "dtf" },
          ],
          mappingStatus: "mapped",
          notes: "Updated internal notes",
        },
      },
      "admin-id",
    );

    assert.strictEqual(editRes.ok, true);
    if (editRes.ok) {
      assert.strictEqual(editRes.providerProduct.id, existingId);
      assert.deepStrictEqual(editRes.providerProduct.printMethodsJson, ["dtf", "screen_print"]);
      assert.strictEqual(editRes.providerProduct.printableAreasJson?.length, 1);
      assert.strictEqual(editRes.providerProduct.printableAreasJson?.[0].maxWidthMm, 300);
    }
  });

  // ============================================================
  // SECTION 8: VERIFICATION OF ZERO PROVIDER NETWORK REQUESTS
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
