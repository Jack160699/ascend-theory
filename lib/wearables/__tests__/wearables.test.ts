import { describe, it } from "node:test";
import assert from "node:assert";
import {
  getPublicProducts,
  getPublicProductBySlug,
  getAuthoritativeVariantForCheckout,
  saveProductAdmin,
} from "../store";
import {
  validateProductPublishReadiness,
  calculateGrossMarginPaise,
  calculateMarginPercentage,
} from "../validation";
import { buildOrderFromInputAsync } from "../../orders/build-order";
import type { Product, ProductVariant } from "../types";

describe("Phase 4 Wearables & Product Management Architecture Tests", () => {
  it("public cannot read draft products or draft product variants", async () => {
    const draftInput: Partial<Product> = {
      title: "Draft Luxury Hoodie",
      slug: "draft-luxury-hoodie",
      description: "Unpublished test hoodie.",
      status: "draft",
      basePricePaise: 450000,
      currency: "INR",
      category: "apparel",
    };

    const saveRes = await saveProductAdmin(
      {
        ...draftInput,
        variants: [
          { sku: "DRAFT-HOODIE-M", size: "M", color: "black", pricePaise: 450000, providerCostPaise: 150000, isActive: true, availabilityStatus: "available" },
        ],
      },
      "admin-owner-id"
    );

    assert.strictEqual(saveRes.ok, true);

    const publicProduct = await getPublicProductBySlug("draft-luxury-hoodie");
    assert.strictEqual(publicProduct, null);

    const allPublic = await getPublicProducts();
    const foundDraft = allPublic.find((p) => p.slug === "draft-luxury-hoodie");
    assert.strictEqual(foundDraft, undefined);
  });

  it("public cannot read inactive variants and provider_cost_paise is NEVER returned publicly", async () => {
    const pubRes = await saveProductAdmin(
      {
        title: "Active Vest Test",
        slug: "active-vest-test",
        description: "Test vest.",
        status: "active",
        basePricePaise: 300000,
        currency: "INR",
        primaryImageUrl: "https://example.com/vest.jpg",
        variants: [
          { sku: "VEST-ACTIVE-M", size: "M", color: "black", pricePaise: 300000, providerCostPaise: 100000, isActive: true, availabilityStatus: "available" },
          { sku: "VEST-INACTIVE-L", size: "L", color: "black", pricePaise: 300000, providerCostPaise: 100000, isActive: false, availabilityStatus: "available" },
        ],
      },
      "admin-owner-id"
    );

    assert.strictEqual(pubRes.ok, true);

    const publicProduct = await getPublicProductBySlug("active-vest-test");
    assert.notStrictEqual(publicProduct, null);
    if (publicProduct) {
      assert.strictEqual(publicProduct.variants.length, 1);
      assert.strictEqual(publicProduct.variants[0].sku, "VEST-ACTIVE-M");

      // Verify providerCostPaise is NOT in public variant object
      assert.strictEqual("providerCostPaise" in publicProduct.variants[0], false);
    }
  });

  it("rejects duplicate product slugs during admin creation", async () => {
    await saveProductAdmin(
      {
        title: "Original Product",
        slug: "unique-slug-test-1",
        description: "Desc",
        status: "draft",
      },
      "admin-id"
    );

    const dupRes = await saveProductAdmin(
      {
        title: "Duplicate Product",
        slug: "unique-slug-test-1",
        description: "Desc 2",
        status: "draft",
      },
      "admin-id"
    );

    assert.strictEqual(dupRes.ok, false);
    assert.strictEqual(dupRes.error.includes("already exists"), true);
  });

  it("rejects duplicate variant SKUs across products", async () => {
    await saveProductAdmin(
      {
        title: "Product A",
        slug: "product-sku-a",
        description: "Desc",
        status: "draft",
        variants: [{ sku: "SHARED-SKU-999", size: "S", color: "black", pricePaise: 100000, providerCostPaise: 50000, isActive: true, availabilityStatus: "available" }],
      },
      "admin-id"
    );

    const dupSkuRes = await saveProductAdmin(
      {
        title: "Product B",
        slug: "product-sku-b",
        description: "Desc",
        status: "draft",
        variants: [{ sku: "SHARED-SKU-999", size: "M", color: "black", pricePaise: 100000, providerCostPaise: 50000, isActive: true, availabilityStatus: "available" }],
      },
      "admin-id"
    );

    assert.strictEqual(dupSkuRes.ok, false);
    assert.strictEqual(dupSkuRes.error.includes("assigned to another product") || dupSkuRes.error.includes("payload"), true);
  });

  it("rejects transition to active status if publish readiness validator fails", async () => {
    const incompleteRes = await saveProductAdmin(
      {
        title: "Incomplete Product",
        slug: "incomplete-prod-1",
        description: "", // Missing description
        status: "active", // Attempting to activate
        variants: [], // Missing active variant
      },
      "admin-id"
    );

    assert.strictEqual(incompleteRes.ok, false);
    assert.strictEqual(incompleteRes.error, "Product publish readiness check failed");
    assert.strictEqual((incompleteRes.errors || []).length > 0, true);
  });

  it("accepts product activation when publish readiness requirements are satisfied", () => {
    const readyProduct: Partial<Product> = {
      title: "Ready Jacket",
      slug: "ready-jacket",
      description: "Full description.",
      primaryImageUrl: "https://example.com/jacket.jpg",
      status: "active",
    };

    const readyVariants: ProductVariant[] = [
      {
        id: "var-1",
        productId: "prod-1",
        sku: "READY-JKT-L",
        size: "L",
        color: "black",
        stockQuantity: 10,
        pricePaise: 500000,
        providerCostPaise: 200000,
        availabilityStatus: "available",
        isActive: true,
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const readiness = validateProductPublishReadiness(readyProduct, readyVariants);
    assert.strictEqual(readiness.isValid, true);
    assert.strictEqual(readiness.errors.length, 0);
  });

  it("calculates gross margin in paise and gross margin percentage correctly", () => {
    const pricePaise = 500000; // ₹5,000
    const costPaise = 200000; // ₹2,000

    const marginPaise = calculateGrossMarginPaise(pricePaise, costPaise);
    assert.strictEqual(marginPaise, 300000); // ₹3,000

    const marginPct = calculateMarginPercentage(pricePaise, costPaise);
    assert.strictEqual(marginPct, 60); // 60%
  });

  it("resolves authoritative variant price server-side and rejects client price tampering", async () => {
    await saveProductAdmin(
      {
        title: "Auth Price Garment",
        slug: "auth-price-garment",
        description: "Desc",
        status: "active",
        primaryImageUrl: "https://example.com/garment.jpg",
        variants: [
          { sku: "AUTH-GARMENT-L", size: "L", color: "black", pricePaise: 800000, providerCostPaise: 300000, isActive: true, availabilityStatus: "available" },
        ],
      },
      "admin-id"
    );

    const tamperedInput = {
      items: [
        {
          slug: "auth-price-garment",
          sku: "AUTH-GARMENT-L",
          price: 1, // Tampered client price ₹1
          quantity: 2,
        },
      ],
      paymentMethod: "online" as const,
      customer: {
        fullName: "Tamper Tester",
        email: "tamper@example.com",
        phone: "+919999999999",
        address: "123 Way",
        city: "Mumbai",
        postalCode: "400001",
        country: "IN",
      },
    };

    const buildResult = await buildOrderFromInputAsync(tamperedInput);
    assert.strictEqual(buildResult.ok, true);

    if (buildResult.ok) {
      assert.strictEqual(buildResult.order.items[0].price, 8000); // Authoritative ₹8,000
      assert.strictEqual(buildResult.order.items[0].lineTotal, 16000); // Authoritative ₹16,000
      assert.strictEqual(buildResult.order.subtotal, 16000);
      assert.strictEqual(buildResult.order.items[0].sku, "AUTH-GARMENT-L");
      assert.strictEqual(buildResult.order.items[0].size, "L");
    }
  });

  it("rejects unknown SKU or inactive SKU during checkout resolution", async () => {
    const unknownRes = await getAuthoritativeVariantForCheckout({ sku: "NON-EXISTENT-SKU-999" });
    assert.strictEqual(unknownRes.ok, false);
    assert.strictEqual(unknownRes.error.includes("Unknown"), true);

    // Save active product with 1 active variant and 1 inactive variant
    await saveProductAdmin(
      {
        title: "Inactive Variant Garment",
        slug: "inactive-var-garment",
        description: "Desc",
        status: "active",
        primaryImageUrl: "https://example.com/img.jpg",
        variants: [
          { sku: "ACTIVE-SKU-001", size: "M", color: "black", pricePaise: 200000, providerCostPaise: 100000, isActive: true, availabilityStatus: "available" },
          { sku: "INACTIVE-SKU-001", size: "S", color: "black", pricePaise: 200000, providerCostPaise: 100000, isActive: false, availabilityStatus: "available" },
        ],
      },
      "admin-id"
    );

    const inactiveRes = await getAuthoritativeVariantForCheckout({ sku: "INACTIVE-SKU-001" });
    assert.strictEqual(inactiveRes.ok, false);
    assert.strictEqual(inactiveRes.error.includes("inactive"), true);
  });

  it("removes archived products from public catalogue", async () => {
    await saveProductAdmin(
      {
        title: "Archived Garment Test",
        slug: "archived-garment-test",
        description: "Desc",
        status: "archived",
      },
      "admin-id"
    );

    const pubRes = await getPublicProductBySlug("archived-garment-test");
    assert.strictEqual(pubRes, null);
  });
});
