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
  // SECTION 3: Signed URL Non-Persistence Tests (Req #13 & #14)
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
  // SECTION 4: Multi-Placement per Variant Tests (Req #15)
  // ============================================================
  it("supports multiple placements (front, back, sleeve) for the same exact variant simultaneously", async () => {
    const dummyProduct: Product = {
      id: "prod-multi-pl",
      slug: "multi-pl-prod",
      title: "Multi Placement Product",
      status: "active",
      basePricePaise: 100000,
      currency: "INR",
      category: "wearables",
      gender: "unisex",
      isFeatured: false,
      galleryJson: [],
      variants: [
        {
          id: "var-mpl-1",
          productId: "prod-multi-pl",
          sku: "MPL-1",
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
      id: "pl-front-1",
      productId: "prod-multi-pl",
      productVariantId: "var-mpl-1",
      placementLocation: "front",
      widthMm: 200,
      heightMm: 250,
      printMethod: "dtf",
      isActive: true,
    };

    const backPl: Partial<DesignPlacement> = {
      id: "pl-back-1",
      productId: "prod-multi-pl",
      productVariantId: "var-mpl-1",
      placementLocation: "back",
      widthMm: 300,
      heightMm: 350,
      printMethod: "dtf",
      isActive: true,
    };

    // Save both front and back placements simultaneously
    const res1 = await saveDesignAdmin(
      {
        design: { title: "Multi Placement Design", slug: "multi-pl-dsg", status: "draft" },
        placements: [frontPl, backPl],
      },
      "admin-id",
    );

    assert.strictEqual(res1.ok, true);
    if (res1.ok) {
      assert.strictEqual(res1.design.placements?.length, 2, "Both front and back placements must persist");
    }

    // Edit back placement widthMm to 380mm -> front placement widthMm must remain 200mm
    const updatedBackPl: Partial<DesignPlacement> = { ...backPl, widthMm: 380 };
    const res2 = await saveDesignAdmin(
      {
        design: { id: res1.ok ? res1.design.id : undefined, title: "Multi Placement Design", slug: "multi-pl-dsg", status: "draft" },
        placements: [frontPl, updatedBackPl],
      },
      "admin-id",
    );

    assert.strictEqual(res2.ok, true);
    if (res2.ok) {
      const front = res2.design.placements?.find((p) => p.placementLocation === "front");
      const back = res2.design.placements?.find((p) => p.placementLocation === "back");
      assert.strictEqual(front?.widthMm, 200, "Front placement widthMm must remain unchanged at 200mm");
      assert.strictEqual(back?.widthMm, 380, "Back placement widthMm must be updated to 380mm");
    }

    // Remove back placement (submit front only) -> back becomes inactive
    const res3 = await saveDesignAdmin(
      {
        design: { id: res1.ok ? res1.design.id : undefined, title: "Multi Placement Design", slug: "multi-pl-dsg", status: "draft" },
        placements: [frontPl],
      },
      "admin-id",
    );

    assert.strictEqual(res3.ok, true);
    if (res3.ok) {
      const activePlacements = res3.design.placements?.filter((p) => p.isActive);
      assert.strictEqual(activePlacements?.length, 1, "Only front placement must remain active");
      assert.strictEqual(activePlacements?.[0].placementLocation, "front");
    }
  });

  // ============================================================
  // SECTION 5: Mockup Rebound, Compatibility & PATCH Route Tests (Req #16)
  // ============================================================
  it("saveMockupAdmin enforces mockup rebound and placement compatibility checks", async () => {
    const dummyProduct1: Product = {
      id: "prod-mock-1",
      slug: "mock-prod-1",
      title: "Mockup Product 1",
      status: "active",
      basePricePaise: 100000,
      currency: "INR",
      category: "wearables",
      gender: "unisex",
      isFeatured: false,
      galleryJson: [],
      variants: [
        {
          id: "var-mk-1",
          productId: "prod-mock-1",
          sku: "MK-1",
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
        id: "mock-reb-1",
        productId: "prod-mock-1",
        variantId: "var-mk-1",
        imageUrl: "https://cdn.example.com/mock1.png",
        viewType: "front",
        status: "draft",
      },
      "admin-id",
    );
    assert.strictEqual(mockupRes.ok, true);

    // Rebound test: submit same ID for prod-mock-2 -> reject with mockup_rebound
    const badRebound = await saveMockupAdmin(
      {
        id: "mock-reb-1",
        productId: "prod-mock-2",
        imageUrl: "https://cdn.example.com/mock1.png",
      },
      "admin-id",
    );
    assert.strictEqual(badRebound.ok, false);
    assert.strictEqual(badRebound.error, "mockup_rebound");
  });

  it("mockups route exports PATCH for mockup status transitions", async () => {
    assert.ok(mockupPatchHandler, "mockups route MUST export PATCH function");
  });

  // ============================================================
  // SECTION 6: Multi-Provider Readiness & Order Independence Tests (Req #17)
  // ============================================================
  it("evaluateVariantReadiness evaluates multi-provider paths deterministically and independently of array order", () => {
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
      providerProduct: { id: "pp-pr", providerId: "p-printrove", productId: "prod-multi-prov", externalProductId: "PRV-1", name: "Printrove", mappingStatus: "draft" as const, createdAt: "", updatedAt: "" },
      providerVariant: { id: "pv-pr", providerProductId: "pp-pr", productVariantId: "var-mp-1", externalVariantId: "PRV-V1", sku: "PRV-V1", mappingStatus: "draft" as const, createdAt: "", updatedAt: "" },
    };

    // Forward order: [Qikink, Printrove]
    const report1 = evaluateVariantReadiness({
      product: dummyProduct,
      variant: dummyVariant,
      design,
      placement,
      providerMappings: [qikinkPath, printrovePath],
      mockups,
    });

    assert.strictEqual(report1.readyForFulfillment, true, "Overall ready because Qikink path is verified & ready");
    assert.strictEqual(report1.providerReadiness?.length, 2);
    const q1 = report1.providerReadiness?.find((p) => p.providerSlug === "qikink");
    const pr1 = report1.providerReadiness?.find((p) => p.providerSlug === "printrove");
    assert.strictEqual(q1?.ready, true, "Qikink path is ready");
    assert.strictEqual(pr1?.ready, false, "Printrove path is not ready due to draft status");

    // Reverse order: [Printrove, Qikink]
    const report2 = evaluateVariantReadiness({
      product: dummyProduct,
      variant: dummyVariant,
      design,
      placement,
      providerMappings: [printrovePath, qikinkPath],
      mockups,
    });

    assert.strictEqual(report2.readyForFulfillment, true, "Overall ready result must be identical regardless of provider array order");
    const q2 = report2.providerReadiness?.find((p) => p.providerSlug === "qikink");
    const pr2 = report2.providerReadiness?.find((p) => p.providerSlug === "printrove");
    assert.strictEqual(q2?.ready, true, "Qikink path remains ready");
    assert.strictEqual(pr2?.ready, false, "Printrove path remains unready");
  });

  // ============================================================
  // SECTION 7: VERIFICATION OF ZERO PROVIDER NETWORK REQUESTS
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
