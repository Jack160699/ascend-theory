import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  getPublicProductBySlug,
  getAuthoritativeVariantForCheckout,
  saveProductAdmin,
  getAllProductsAdmin,
} from "../store";
import { buildOrderFromInputAsync } from "../../orders/build-order";
import { getDropBySlugAsync } from "../../data/drops";

describe("Phase 4 Wearables & Product Management Architecture & Security Tests", () => {
  it("migration 00004 enforces column-level privilege lockdown revoking provider_cost_paise from anon/authenticated", () => {
    const migrationPath = resolve(process.cwd(), "supabase/migrations/20260809000004_wearables_catalogue_management.sql");
    const sql = readFileSync(migrationPath, "utf-8");

    assert.strictEqual(sql.includes("REVOKE ALL ON public.product_variants FROM PUBLIC, anon, authenticated;"), true);
    assert.strictEqual(sql.includes("GRANT SELECT ("), true);
    assert.strictEqual(sql.includes("provider_cost_paise"), true);
    // Ensure provider_cost_paise is NOT in the GRANT SELECT (...) column list for anon/authenticated
    const selectGrantBlock = sql.match(/GRANT SELECT \([\s\S]*?\) ON public.product_variants TO anon, authenticated;/);
    assert.notStrictEqual(selectGrantBlock, null);
    if (selectGrantBlock) {
      assert.strictEqual(selectGrantBlock[0].includes("provider_cost_paise"), false);
    }
  });

  it("public cannot read draft products, draft variants, or provider_cost_paise", async () => {
    const saveRes = await saveProductAdmin(
      {
        title: "Draft Luxury Hoodie",
        slug: "draft-luxury-hoodie-test",
        description: "Unpublished test hoodie.",
        status: "draft",
        basePricePaise: 450000,
        currency: "INR",
        category: "wearables",
        variants: [
          { sku: "DRAFT-HOODIE-M", size: "M", color: "black", pricePaise: 450000, providerCostPaise: 150000, isActive: true, availabilityStatus: "available" },
        ],
      },
      "admin-owner-id"
    );

    assert.strictEqual(saveRes.ok, true);

    const publicProduct = await getPublicProductBySlug("draft-luxury-hoodie-test");
    assert.strictEqual(publicProduct, null);

    const drop = await getDropBySlugAsync("draft-luxury-hoodie-test");
    assert.strictEqual(drop, undefined);
  });

  it("public cannot read sample_only, returned_inventory_only, or unavailable variants", async () => {
    await saveProductAdmin(
      {
        title: "Multi Status Garment",
        slug: "multi-status-garment",
        description: "Desc",
        status: "active",
        primaryImageUrl: "https://example.com/img.jpg",
        variants: [
          { sku: "MULTI-AVAIL-M", size: "M", color: "black", pricePaise: 300000, providerCostPaise: 100000, isActive: true, availabilityStatus: "available" },
          { sku: "MULTI-SAMPLE-L", size: "L", color: "black", pricePaise: 300000, providerCostPaise: 100000, isActive: true, availabilityStatus: "sample_only" },
          { sku: "MULTI-UNAVAIL-S", size: "S", color: "black", pricePaise: 300000, providerCostPaise: 100000, isActive: true, availabilityStatus: "unavailable" },
          { sku: "MULTI-RETURNED-XL", size: "XL", color: "black", pricePaise: 300000, providerCostPaise: 100000, isActive: true, availabilityStatus: "returned_inventory_only" },
        ],
      },
      "admin-id"
    );

    const pubProduct = await getPublicProductBySlug("multi-status-garment");
    assert.notStrictEqual(pubProduct, null);
    if (pubProduct) {
      assert.strictEqual(pubProduct.variants.length, 1);
      assert.strictEqual(pubProduct.variants[0].sku, "MULTI-AVAIL-M");
      assert.strictEqual("providerCostPaise" in pubProduct.variants[0], false);
    }
  });

  it("rejects unknown SKU, inactive SKU, sample_only, or unavailable SKU during checkout resolution", async () => {
    const unknownRes = await getAuthoritativeVariantForCheckout({ sku: "NON-EXISTENT-SKU-999" });
    assert.strictEqual(unknownRes.ok, false);

    const sampleRes = await getAuthoritativeVariantForCheckout({ sku: "MULTI-SAMPLE-L" });
    assert.strictEqual(sampleRes.ok, false);

    const unavailRes = await getAuthoritativeVariantForCheckout({ sku: "MULTI-UNAVAIL-S" });
    assert.strictEqual(unavailRes.ok, false);
  });

  it("rejects identity mismatches between submitted SKU, slug, size, and color", async () => {
    // Mismatch size (submitted XL, variant is M)
    const sizeMismatch = await getAuthoritativeVariantForCheckout({
      slug: "multi-status-garment",
      sku: "MULTI-AVAIL-M",
      size: "XL",
    });
    assert.strictEqual(sizeMismatch.ok, false);
    assert.strictEqual(sizeMismatch.error.includes("Size mismatch"), true);

    // Mismatch slug (submitted wrong slug for SKU)
    const slugMismatch = await getAuthoritativeVariantForCheckout({
      slug: "wrong-slug",
      sku: "MULTI-AVAIL-M",
    });
    assert.strictEqual(slugMismatch.ok, false);
    assert.strictEqual(slugMismatch.error.includes("slug mismatch"), true);
  });

  it("rejects checkout build if SKU or variantId is omitted", async () => {
    const res = await buildOrderFromInputAsync({
      items: [
        {
          slug: "multi-status-garment",
          quantity: 1,
        },
      ],
      paymentMethod: "online",
      customer: {
        fullName: "No SKU Tester",
        email: "test@example.com",
        phone: "+919999999999",
        address: "123 St",
        city: "Mumbai",
        postalCode: "400001",
        country: "IN",
      },
    });

    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error.includes("Variant identity"), true);
  });

  it("reconciles removed variants by marking missing variants inactive and unavailable", async () => {
    const initial = await saveProductAdmin(
      {
        title: "Reconcile Product",
        slug: "reconcile-product",
        description: "Desc",
        status: "draft",
        variants: [
          { id: "var-rec-1", sku: "REC-1", size: "S", color: "black", pricePaise: 100000, providerCostPaise: 50000, isActive: true, availabilityStatus: "available" },
          { id: "var-rec-2", sku: "REC-2", size: "M", color: "black", pricePaise: 100000, providerCostPaise: 50000, isActive: true, availabilityStatus: "available" },
        ],
      },
      "admin-id"
    );

    assert.strictEqual(initial.ok, true);

    // Update product submitting ONLY var-rec-1
    const updateRes = await saveProductAdmin(
      {
        id: initial.ok ? initial.product.id : undefined,
        title: "Reconcile Product Updated",
        slug: "reconcile-product",
        description: "Desc",
        status: "draft",
        variants: [
          { id: "var-rec-1", sku: "REC-1", size: "S", color: "black", pricePaise: 100000, providerCostPaise: 50000, isActive: true, availabilityStatus: "available" },
        ],
      },
      "admin-id"
    );

    assert.strictEqual(updateRes.ok, true);

    // Check all admin products to verify var-rec-2 became inactive & unavailable
    const allProds = await getAllProductsAdmin();
    const recProd = allProds.find((p) => p.slug === "reconcile-product");
    assert.notStrictEqual(recProd, undefined);
    if (recProd) {
      const removedVar = (recProd.variants || []).find((v) => v.id === "var-rec-2");
      assert.notStrictEqual(removedVar, undefined);
      if (removedVar) {
        assert.strictEqual(removedVar.isActive, false);
        assert.strictEqual(removedVar.availabilityStatus, "unavailable");
      }
    }
  });

  it("rejects negative prices and negative provider costs", async () => {
    const negPriceRes = await saveProductAdmin(
      {
        title: "Neg Price Garment",
        slug: "neg-price-garment",
        description: "Desc",
        status: "draft",
        variants: [
          { sku: "NEG-PRICE-1", size: "S", color: "black", pricePaise: -500, providerCostPaise: 10000, isActive: true },
        ],
      },
      "admin-id"
    );
    assert.strictEqual(negPriceRes.ok, false);
    assert.strictEqual(negPriceRes.error.includes("negative"), true);

    const negCostRes = await saveProductAdmin(
      {
        title: "Neg Cost Garment",
        slug: "neg-cost-garment",
        description: "Desc",
        status: "draft",
        variants: [
          { sku: "NEG-COST-1", size: "S", color: "black", pricePaise: 10000, providerCostPaise: -500, isActive: true },
        ],
      },
      "admin-id"
    );
    assert.strictEqual(negCostRes.ok, false);
    assert.strictEqual(negCostRes.error.includes("negative"), true);
  });

  it("resolves authoritative variant price server-side and computes correct order item snapshot", async () => {
    await saveProductAdmin(
      {
        title: "Snapshot Garment",
        slug: "snapshot-garment",
        description: "Desc",
        status: "active",
        primaryImageUrl: "https://example.com/snapshot.jpg",
        variants: [
          { id: "var-snap-m", sku: "SNAP-GARMENT-M", size: "M", color: "black", pricePaise: 500000, providerCostPaise: 200000, isActive: true, availabilityStatus: "available" },
        ],
      },
      "admin-id"
    );

    const buildRes = await buildOrderFromInputAsync({
      items: [
        {
          slug: "snapshot-garment",
          sku: "SNAP-GARMENT-M",
          price: 1, // Tampered
          quantity: 2,
        },
      ],
      paymentMethod: "online",
      customer: {
        fullName: "Snapshot Tester",
        email: "snap@example.com",
        phone: "+919999999999",
        address: "123 St",
        city: "Mumbai",
        postalCode: "400001",
        country: "IN",
      },
    });

    assert.strictEqual(buildRes.ok, true);
    if (buildRes.ok) {
      assert.strictEqual(buildRes.order.items[0].price, 5000);
      assert.strictEqual(buildRes.order.items[0].sku, "SNAP-GARMENT-M");
      assert.strictEqual(buildRes.order.items[0].size, "M");
      assert.strictEqual(buildRes.order.items[0].color, "black");
      assert.strictEqual(buildRes.order.items[0].variantId, "var-snap-m");
    }
  });

  it("removes archived products from public storefront queries", async () => {
    await saveProductAdmin(
      {
        title: "Archived Garment Test 2",
        slug: "archived-garment-test-2",
        description: "Desc",
        status: "archived",
      },
      "admin-id"
    );

    const pubRes = await getPublicProductBySlug("archived-garment-test-2");
    assert.strictEqual(pubRes, null);

    const dropRes = await getDropBySlugAsync("archived-garment-test-2");
    assert.strictEqual(dropRes, undefined);
  });
});
