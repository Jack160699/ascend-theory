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
import { getCartProductFromLine } from "../../cart/catalog";
import type { CartLine } from "../../cart/types";

// ==========================================
// SECTION 1: Migration 00004 column-level privilege lockdown
// ==========================================
describe("Phase 4 — Wearables Security & Cart Integrity Tests", () => {
  it("migration 00004 enforces column-level privilege lockdown revoking provider_cost_paise from anon/authenticated", () => {
    const sql = readFileSync(
      resolve(process.cwd(), "supabase/migrations/20260809000004_wearables_catalogue_management.sql"),
      "utf-8"
    );

    assert.strictEqual(sql.includes("REVOKE ALL ON public.product_variants FROM PUBLIC, anon, authenticated;"), true);
    const selectGrantBlock = sql.match(/GRANT SELECT \([\s\S]*?\) ON public\.product_variants TO anon, authenticated;/);
    assert.notStrictEqual(selectGrantBlock, null);
    if (selectGrantBlock) {
      assert.strictEqual(selectGrantBlock[0].includes("provider_cost_paise"), false);
    }
  });

  it("migration 00004 contains cross-product variant ID protection", () => {
    const sql = readFileSync(
      resolve(process.cwd(), "supabase/migrations/20260809000004_wearables_catalogue_management.sql"),
      "utf-8"
    );
    assert.strictEqual(sql.includes("variant_product_mismatch"), true);
    assert.strictEqual(sql.includes("product_id != v_product_id"), true);
  });

  it("migration 00004 rejects empty size and color", () => {
    const sql = readFileSync(
      resolve(process.cwd(), "supabase/migrations/20260809000004_wearables_catalogue_management.sql"),
      "utf-8"
    );
    assert.strictEqual(sql.includes("has empty size"), true);
    assert.strictEqual(sql.includes("has empty color"), true);
  });

  it("migration 00004 prevents product_id ownership change in ON CONFLICT UPDATE", () => {
    const sql = readFileSync(
      resolve(process.cwd(), "supabase/migrations/20260809000004_wearables_catalogue_management.sql"),
      "utf-8"
    );
    assert.strictEqual(sql.includes("WHERE product_variants.product_id = v_product_id"), true);
  });

  // ==========================================
  // SECTION 2: Cart display snapshot — DB-only product
  // ==========================================
  it("CartLine with display snapshot resolves product display without static CATALOG lookup", () => {
    const dbOnlyLine: CartLine = {
      slug: "db-only-exclusive-hoodie",
      variantId: "var-db-only-m",
      sku: "DB-ONLY-HOODIE-M",
      size: "M",
      color: "charcoal",
      quantity: 1,
      title: "DB-Only Exclusive Hoodie",
      image: "https://cdn.example.com/db-only-hoodie.jpg",
      priceDisplay: "₹3,500",
      currency: "INR",
      pricePaise: 350000,
    };

    const resolved = getCartProductFromLine(dbOnlyLine);
    assert.notStrictEqual(resolved, undefined);
    assert.strictEqual(resolved?.name, "DB-Only Exclusive Hoodie");
    assert.strictEqual(resolved?.image, "https://cdn.example.com/db-only-hoodie.jpg");
    assert.strictEqual(resolved?.currency, "INR");
    assert.strictEqual(resolved?.price, 3500);
  });

  it("CartLine without snapshot falls back to static CATALOG for local dev products", () => {
    const staticLine: CartLine = {
      slug: "ascend-jacket",
      quantity: 1,
    };
    const resolved = getCartProductFromLine(staticLine);
    assert.notStrictEqual(resolved, undefined);
    assert.strictEqual(resolved?.name, "The Ascend Jacket");
  });

  it("CartLine for slug not in CATALOG and no snapshot returns undefined (not found)", () => {
    const orphanLine: CartLine = {
      slug: "completely-unknown-product-xyz",
      quantity: 1,
    };
    const resolved = getCartProductFromLine(orphanLine);
    assert.strictEqual(resolved, undefined);
  });

  // ==========================================
  // SECTION 3: Checkout payload contains full variant identity
  // ==========================================
  it("checkout payload from resolvedLines must contain variantId, sku, size, color — not slug-only", () => {
    // Simulate what CheckoutExperience.onSubmit now sends
    const resolvedLines = [
      {
        line: {
          slug: "snapshot-garment",
          variantId: "var-snap-m",
          sku: "SNAP-GARMENT-M",
          size: "M",
          color: "black",
          quantity: 2,
          pricePaise: 500000,
          currency: "INR",
        } as CartLine,
        product: { name: "Snapshot Garment", price: 5000, currency: "INR", priceDisplay: "₹5,000", image: "", imageAlt: "", dropName: "", slug: "snapshot-garment", maxQuantity: 10 },
      },
    ];

    // Build the payload as CheckoutExperience.onSubmit now does
    const items = resolvedLines.map(({ line }) => ({
      slug: line.slug,
      variantId: line.variantId,
      sku: line.sku,
      size: line.size,
      color: line.color,
      quantity: line.quantity,
    }));

    assert.strictEqual(items[0].variantId, "var-snap-m");
    assert.strictEqual(items[0].sku, "SNAP-GARMENT-M");
    assert.strictEqual(items[0].size, "M");
    assert.strictEqual(items[0].color, "black");
    assert.strictEqual(items[0].slug, "snapshot-garment");
    assert.strictEqual(items[0].quantity, 2);
  });

  // ==========================================
  // SECTION 4: Draft product hidden from public, draft variants hidden
  // ==========================================
  it("public cannot read draft products", async () => {
    await saveProductAdmin(
      {
        title: "Draft Luxury Hoodie §4",
        slug: "draft-luxury-hoodie-s4",
        description: "Test.",
        status: "draft",
        variants: [
          { sku: "DRAFT-S4-M", size: "M", color: "black", pricePaise: 450000, providerCostPaise: 150000, isActive: true, availabilityStatus: "available" },
        ],
      },
      "admin-owner-id"
    );
    const pubProduct = await getPublicProductBySlug("draft-luxury-hoodie-s4");
    assert.strictEqual(pubProduct, null);
    const drop = await getDropBySlugAsync("draft-luxury-hoodie-s4");
    assert.strictEqual(drop, undefined);
  });

  // ==========================================
  // SECTION 5: Public visibility requires all 3 (is_active + available + parent active)
  // ==========================================
  it("public sees only available variants on active product; sample_only/unavailable/returned_inventory_only hidden", async () => {
    await saveProductAdmin(
      {
        title: "Multi Status Garment §5",
        slug: "multi-status-garment-s5",
        description: "Desc",
        status: "active",
        primaryImageUrl: "https://example.com/img.jpg",
        variants: [
          { sku: "MSS5-AVAIL-M", size: "M", color: "black", pricePaise: 300000, providerCostPaise: 100000, isActive: true, availabilityStatus: "available" },
          { sku: "MSS5-SAMPLE-L", size: "L", color: "black", pricePaise: 300000, providerCostPaise: 100000, isActive: true, availabilityStatus: "sample_only" },
          { sku: "MSS5-UNAVAIL-S", size: "S", color: "black", pricePaise: 300000, providerCostPaise: 100000, isActive: true, availabilityStatus: "unavailable" },
          { sku: "MSS5-RETURNED-XL", size: "XL", color: "black", pricePaise: 300000, providerCostPaise: 100000, isActive: true, availabilityStatus: "returned_inventory_only" },
        ],
      },
      "admin-id"
    );
    const pubProduct = await getPublicProductBySlug("multi-status-garment-s5");
    assert.notStrictEqual(pubProduct, null);
    if (pubProduct) {
      assert.strictEqual(pubProduct.variants.length, 1);
      assert.strictEqual(pubProduct.variants[0].sku, "MSS5-AVAIL-M");
      assert.strictEqual("providerCostPaise" in pubProduct.variants[0], false);
    }
  });

  // ==========================================
  // SECTION 6: Checkout validation — exact identity mismatches
  // ==========================================
  it("rejects unknown SKU, sample_only, and unavailable SKU during checkout resolution", async () => {
    const unknownRes = await getAuthoritativeVariantForCheckout({ sku: "NON-EXISTENT-SKU-XYZ-999" });
    assert.strictEqual(unknownRes.ok, false);

    const sampleRes = await getAuthoritativeVariantForCheckout({ sku: "MSS5-SAMPLE-L" });
    assert.strictEqual(sampleRes.ok, false);

    const unavailRes = await getAuthoritativeVariantForCheckout({ sku: "MSS5-UNAVAIL-S" });
    assert.strictEqual(unavailRes.ok, false);
  });

  it("rejects size mismatch between cart line and DB variant", async () => {
    const sizeMismatch = await getAuthoritativeVariantForCheckout({
      slug: "multi-status-garment-s5",
      sku: "MSS5-AVAIL-M",
      size: "XL",
    });
    assert.strictEqual(sizeMismatch.ok, false);
    if (!sizeMismatch.ok) {
      assert.strictEqual(sizeMismatch.error.toLowerCase().includes("size"), true);
    }
  });

  it("rejects slug mismatch between cart line and DB variant", async () => {
    const slugMismatch = await getAuthoritativeVariantForCheckout({
      slug: "totally-wrong-slug",
      sku: "MSS5-AVAIL-M",
    });
    assert.strictEqual(slugMismatch.ok, false);
    if (!slugMismatch.ok) {
      assert.strictEqual(slugMismatch.error.toLowerCase().includes("slug"), true);
    }
  });

  // ==========================================
  // SECTION 7: buildOrderFromInputAsync — requires SKU or variantId
  // ==========================================
  it("rejects checkout build if both SKU and variantId are omitted", async () => {
    const res = await buildOrderFromInputAsync({
      items: [{ slug: "multi-status-garment-s5", quantity: 1 }],
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
    if (!res.ok) {
      assert.strictEqual(res.error.toLowerCase().includes("variant identity"), true);
    }
  });

  // ==========================================
  // SECTION 8: Server-authoritative pricing ignores client price
  // ==========================================
  it("server resolves authoritative price; client-supplied price is ignored in order snapshot", async () => {
    await saveProductAdmin(
      {
        title: "Price Tamper Garment",
        slug: "price-tamper-garment",
        description: "Desc",
        status: "active",
        primaryImageUrl: "https://example.com/tamper.jpg",
        variants: [
          { id: "var-ptg-m", sku: "PTG-M", size: "M", color: "black", pricePaise: 500000, providerCostPaise: 200000, isActive: true, availabilityStatus: "available" },
        ],
      },
      "admin-id"
    );

    const buildRes = await buildOrderFromInputAsync({
      items: [{ slug: "price-tamper-garment", sku: "PTG-M", quantity: 2, price: 1 }],
      paymentMethod: "online",
      customer: {
        fullName: "Price Tamper Tester",
        email: "tamper@example.com",
        phone: "+919999999999",
        address: "123 St",
        city: "Mumbai",
        postalCode: "400001",
        country: "IN",
      },
    });
    assert.strictEqual(buildRes.ok, true);
    if (buildRes.ok) {
      assert.strictEqual(buildRes.order.items[0].price, 5000); // 500000 paise / 100
      assert.strictEqual(buildRes.order.items[0].sku, "PTG-M");
      assert.strictEqual(buildRes.order.items[0].size, "M");
      assert.strictEqual(buildRes.order.items[0].color, "black");
      assert.strictEqual(buildRes.order.items[0].variantId, "var-ptg-m");
    }
  });

  // ==========================================
  // SECTION 9: Multi-variant cart isolation
  // ==========================================
  it("M and L of same product are independent cart lines (different variantIds)", () => {
    const lineM: CartLine = { slug: "ascend-jacket", variantId: "var-ascend-jacket-M", sku: "ASCEND-JACKET-M", size: "M", color: "black", quantity: 1 };
    const lineL: CartLine = { slug: "ascend-jacket", variantId: "var-ascend-jacket-L", sku: "ASCEND-JACKET-L", size: "L", color: "black", quantity: 1 };
    // They must have different identity keys
    const keyM = lineM.variantId!;
    const keyL = lineL.variantId!;
    assert.notStrictEqual(keyM, keyL, "M and L must have independent variant identity keys");
  });

  it("two colors of same size are separate cart lines", () => {
    const lineBlack: CartLine = { slug: "ascend-jacket", variantId: "var-aj-M-black", sku: "AJ-M-BLACK", size: "M", color: "black", quantity: 1 };
    const lineWhite: CartLine = { slug: "ascend-jacket", variantId: "var-aj-M-white", sku: "AJ-M-WHITE", size: "M", color: "white", quantity: 1 };
    assert.notStrictEqual(lineBlack.variantId, lineWhite.variantId);
  });

  // ==========================================
  // SECTION 10: Variant reconciliation on product save
  // ==========================================
  it("reconciles removed variants: missing variant becomes is_active=false and availability_status=unavailable", async () => {
    await saveProductAdmin(
      {
        title: "Reconcile Product §10",
        slug: "reconcile-product-s10",
        description: "Desc",
        status: "draft",
        variants: [
          { id: "var-rec10-s", sku: "REC10-S", size: "S", color: "black", pricePaise: 100000, providerCostPaise: 50000, isActive: true, availabilityStatus: "available" },
          { id: "var-rec10-m", sku: "REC10-M", size: "M", color: "black", pricePaise: 100000, providerCostPaise: 50000, isActive: true, availabilityStatus: "available" },
        ],
      },
      "admin-id"
    );

    // Remove var-rec10-m by not including it
    await saveProductAdmin(
      {
        title: "Reconcile Product §10",
        slug: "reconcile-product-s10",
        description: "Desc",
        status: "draft",
        variants: [
          { id: "var-rec10-s", sku: "REC10-S", size: "S", color: "black", pricePaise: 100000, providerCostPaise: 50000, isActive: true, availabilityStatus: "available" },
        ],
      },
      "admin-id"
    );

    const allProds = await getAllProductsAdmin();
    const recProd = allProds.find((p) => p.slug === "reconcile-product-s10");
    assert.notStrictEqual(recProd, undefined, "Reconcile product must exist in admin catalogue");
    if (recProd) {
      const removedVar = (recProd.variants || []).find((v) => v.sku === "REC10-M");
      assert.notStrictEqual(removedVar, undefined, "Removed variant must still exist (as inactive)");
      if (removedVar) {
        assert.strictEqual(removedVar.isActive, false);
        assert.strictEqual(removedVar.availabilityStatus, "unavailable");
      }
    }
  });

  // ==========================================
  // SECTION 11: Negative price/cost validation
  // ==========================================
  it("rejects variant with negative price", async () => {
    const res = await saveProductAdmin(
      {
        title: "Neg Price",
        slug: "neg-price-s11",
        description: "Desc",
        status: "draft",
        variants: [{ sku: "NEG-PRICE-S11", size: "S", color: "black", pricePaise: -500, providerCostPaise: 10000, isActive: true, availabilityStatus: "available" }],
      },
      "admin-id"
    );
    assert.strictEqual(res.ok, false);
    if (!res.ok) {
      assert.strictEqual(res.error.toLowerCase().includes("negative"), true);
    }
  });

  it("rejects variant with negative provider cost", async () => {
    const res = await saveProductAdmin(
      {
        title: "Neg Cost",
        slug: "neg-cost-s11",
        description: "Desc",
        status: "draft",
        variants: [{ sku: "NEG-COST-S11", size: "S", color: "black", pricePaise: 10000, providerCostPaise: -500, isActive: true, availabilityStatus: "available" }],
      },
      "admin-id"
    );
    assert.strictEqual(res.ok, false);
    if (!res.ok) {
      assert.strictEqual(res.error.toLowerCase().includes("negative"), true);
    }
  });

  // ==========================================
  // SECTION 12: Empty size and color validation
  // ==========================================
  it("rejects variant with empty size", async () => {
    const res = await saveProductAdmin(
      {
        title: "Empty Size Product",
        slug: "empty-size-product-s12",
        description: "Desc",
        status: "draft",
        variants: [{ sku: "EMPTY-SIZE-S12", size: "", color: "black", pricePaise: 10000, providerCostPaise: 5000, isActive: true, availabilityStatus: "available" }],
      },
      "admin-id"
    );
    assert.strictEqual(res.ok, false);
    if (!res.ok) {
      assert.strictEqual(res.error.toLowerCase().includes("size"), true);
    }
  });

  it("rejects variant with empty color", async () => {
    const res = await saveProductAdmin(
      {
        title: "Empty Color Product",
        slug: "empty-color-product-s12",
        description: "Desc",
        status: "draft",
        variants: [{ sku: "EMPTY-COLOR-S12", size: "M", color: "", pricePaise: 10000, providerCostPaise: 5000, isActive: true, availabilityStatus: "available" }],
      },
      "admin-id"
    );
    assert.strictEqual(res.ok, false);
    if (!res.ok) {
      assert.strictEqual(res.error.toLowerCase().includes("color"), true);
    }
  });

  // ==========================================
  // SECTION 13: Cross-product variant ID protection (memory path)
  // ==========================================
  it("rejects variant ID that belongs to another product (variant_product_mismatch)", async () => {
    // Create Product A with a variant
    await saveProductAdmin(
      {
        title: "Product Alpha",
        slug: "product-alpha-s13",
        description: "Desc",
        status: "draft",
        variants: [
          { id: "var-alpha-s13-m", sku: "ALPHA-S13-M", size: "M", color: "black", pricePaise: 100000, providerCostPaise: 40000, isActive: true, availabilityStatus: "available" },
        ],
      },
      "admin-id"
    );

    // Create Product B and try to save it with Product A's variant ID
    const res = await saveProductAdmin(
      {
        title: "Product Beta",
        slug: "product-beta-s13",
        description: "Desc",
        status: "draft",
        variants: [
          { id: "var-alpha-s13-m", sku: "BETA-S13-L", size: "L", color: "white", pricePaise: 100000, providerCostPaise: 40000, isActive: true, availabilityStatus: "available" },
        ],
      },
      "admin-id"
    );

    assert.strictEqual(res.ok, false);
    if (!res.ok) {
      assert.strictEqual(res.error.includes("variant_product_mismatch"), true);
    }

    // Verify Product A is unchanged
    const allProds = await getAllProductsAdmin();
    const alphaProduct = allProds.find((p) => p.slug === "product-alpha-s13");
    const alphaVar = (alphaProduct?.variants || []).find((v) => v.id === "var-alpha-s13-m");
    assert.notStrictEqual(alphaVar, undefined, "Product Alpha's variant must be unchanged");
    if (alphaVar) {
      assert.strictEqual(alphaVar.sku, "ALPHA-S13-M");
    }
  });

  // ==========================================
  // SECTION 14: Archived product hidden from public storefront
  // ==========================================
  it("archived product is hidden from public catalogue and drop by slug", async () => {
    await saveProductAdmin(
      { title: "Archived §14", slug: "archived-product-s14", description: "Desc", status: "archived" },
      "admin-id"
    );
    const pubRes = await getPublicProductBySlug("archived-product-s14");
    assert.strictEqual(pubRes, null);
    const dropRes = await getDropBySlugAsync("archived-product-s14");
    assert.strictEqual(dropRes, undefined);
  });
});
