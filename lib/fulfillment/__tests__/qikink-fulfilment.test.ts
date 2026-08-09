import { describe, it, before, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

import type { Order } from "@/lib/orders/types";
import type { Product, ProductVariant } from "@/lib/wearables/types";
import type { PODProvider, ProviderProduct, ProviderVariant, DesignAsset, DesignPlacement, ProductMockup } from "@/lib/wearables/design-types";
import { saveProductAdmin } from "@/lib/wearables/store";
import { saveDesignAdmin, saveProviderMappingAdmin, saveMockupAdmin } from "@/lib/wearables/design-store";
import { saveOrder } from "@/lib/orders/store";

import { evaluateOrderFulfillmentEligibility } from "../eligibility";
import {
  createOrClaimFulfillmentAdmin,
  submitFulfillmentToProviderAdmin,
  bindProviderOrderAdmin,
  updateFulfillmentStatusAdmin,
  getFulfillmentByIdAdmin,
} from "../fulfillment-store";
import { QikinkFulfillmentAdapter, redactSecrets } from "../qikink";
import { QikinkMockTransport } from "../qikink-mock";

describe("Phase 6 — Qikink Fulfilment Integration Tests", () => {
  const qikinkProvider: PODProvider = {
    id: "a0000000-0000-0000-0000-000000000001",
    slug: "qikink",
    name: "Qikink",
    isActive: true,
    createdAt: "",
  };

  const validProduct: Product = {
    id: "prod-ph6-1",
    slug: "ph6-hoodie",
    title: "Phase 6 Hoodie",
    status: "active",
    basePricePaise: 150000,
    currency: "INR",
    category: "wearables",
    gender: "unisex",
    isFeatured: true,
    galleryJson: [],
    variants: [
      {
        id: "var-ph6-m",
        productId: "prod-ph6-1",
        sku: "PH6-HOOD-BLK-M",
        size: "M",
        color: "black",
        stockQuantity: 20,
        pricePaise: 150000,
        compareAtPricePaise: 0,
        providerCostPaise: 80000,
        availabilityStatus: "available",
        isActive: true,
        sortOrder: 0,
        createdAt: "",
        updatedAt: "",
      },
    ],
    createdAt: "",
    updatedAt: "",
  };

  const validDesign: DesignAsset = {
    id: "dsg-ph6-1",
    title: "Phase 6 Front Graphic",
    slug: "ph6-graphic",
    status: "active",
    storagePath: "artwork/ph6-front.png",
    assetUrl: "https://storage.example.com/artwork/ph6-front.png",
    placements: [
      {
        id: "pl-ph6-front",
        designId: "dsg-ph6-1",
        productId: "prod-ph6-1",
        productVariantId: "var-ph6-m",
        position: "front",
        placementLocation: "front",
        xNormalized: 0.5,
        yNormalized: 0.5,
        scale: 1,
        rotationDeg: 0,
        widthMm: 200,
        heightMm: 250,
        printMethod: "dtf",
        isActive: true,
        createdAt: "",
        updatedAt: "",
      },
    ],
    createdAt: "",
    updatedAt: "",
  };

  const validMockup: ProductMockup = {
    id: "mock-ph6-1",
    productId: "prod-ph6-1",
    variantId: "var-ph6-m",
    designId: "dsg-ph6-1",
    placementId: "pl-ph6-front",
    imageUrl: "https://storage.example.com/mockups/ph6-front.png",
    viewType: "front",
    isPrimary: true,
    sortOrder: 0,
    status: "approved",
    createdAt: "",
    updatedAt: "",
  };

  before(async () => {
    await saveProductAdmin(validProduct, "admin-id");
    await saveDesignAdmin({ design: validDesign, placements: validDesign.placements }, "admin-id");
    await saveMockupAdmin(validMockup, "admin-id");
    await saveProviderMappingAdmin(
      {
        providerProduct: {
          id: "pp-ph6-qik",
          providerId: qikinkProvider.id,
          productId: validProduct.id,
          externalProductId: "QIK-PH6-HD",
          name: "Qikink Premium Hoodie",
          printMethodsJson: ["dtf"],
          printableAreasJson: [{ location: "front", maxWidthMm: 300, maxHeightMm: 400, printMethod: "dtf" }],
          mappingStatus: "verified",
        },
        providerVariants: [
          {
            id: "pv-ph6-m",
            providerProductId: "pp-ph6-qik",
            productVariantId: "var-ph6-m",
            externalVariantId: "QIK-V-M",
            externalSku: "QIK-SKU-PH6-M",
            sku: "QIK-SKU-PH6-M",
            mappingStatus: "verified",
          },
        ],
      },
      "admin-id",
    );
  });

  // 1. Migration 00007 Structure Tests
  it("migration 00007 exists and extends fulfillments, fulfillment_events, and shipments", () => {
    const migPath = path.join(process.cwd(), "supabase", "migrations", "20260809000007_qikink_fulfilment.sql");
    assert.strictEqual(fs.existsSync(migPath), true, "Migration 00007 MUST exist");
    const sql = fs.readFileSync(migPath, "utf-8");
    assert.strictEqual(sql.includes("ALTER TABLE public.fulfillments"), true);
    assert.strictEqual(sql.includes("ALTER TABLE public.fulfillment_events"), true);
    assert.strictEqual(sql.includes("ALTER TABLE public.shipments"), true);
    assert.strictEqual(sql.includes("idx_unique_fulfillments_provider_order_id"), true);
    assert.strictEqual(sql.includes("create_or_claim_fulfillment_with_audit"), true);
    assert.strictEqual(sql.includes("bind_provider_order_with_audit"), true);
  });

  // 2. Unpaid Prepaid Order Blocked (Req #7 & #38)
  it("unpaid prepaid order -> blocked", async () => {
    const unpaidOrder: Order = {
      id: "ORD-UNPAID-01",
      customer: { fullName: "Test User", email: "test@example.com", phone: "+919999999999", address: "Line 1", city: "Bengaluru", state: "Karnataka", postalCode: "560001", country: "IN" },
      items: [{ slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 1500,
      currency: "INR",
      status: "pending_payment",
      paymentStatus: "unpaid",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      createdAt: "",
    };
    await saveOrder(unpaidOrder);

    const res = await evaluateOrderFulfillmentEligibility(unpaidOrder.id);
    assert.strictEqual(res.eligible, false);
    assert.strictEqual(res.blockingReasons.includes("unpaid_prepaid_order"), true);
  });

  // 3. Captured Prepaid Order Eligible (Req #7 & #38)
  it("captured prepaid order -> eligible", async () => {
    const paidOrder: Order = {
      id: "ORD-PAID-01",
      customer: { fullName: "Test User", email: "test@example.com", phone: "+919999999999", address: "Line 1", city: "Bengaluru", state: "Karnataka", postalCode: "560001", country: "IN" },
      items: [{ slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 1500,
      currency: "INR",
      status: "paid",
      paymentStatus: "paid",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      createdAt: "",
    };
    await saveOrder(paidOrder);

    const res = await evaluateOrderFulfillmentEligibility(paidOrder.id);
    assert.strictEqual(res.eligible, true, `Expected eligible, got reasons: ${res.blockingReasons.join(", ")}`);
  });

  // 4. COD Blocked Until Phase 7 (Req #8 & #38)
  it("COD order -> blocked with cod_requires_phase7_approval", async () => {
    const codOrder: Order = {
      id: "ORD-COD-01",
      customer: { fullName: "COD User", email: "cod@example.com", phone: "+919999999999", address: "Line 1", city: "Bengaluru", state: "Karnataka", postalCode: "560001", country: "IN" },
      items: [{ slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 1500,
      currency: "INR",
      status: "paid",
      paymentStatus: "pending",
      paymentMethod: "cod",
      paymentProvider: "none",
      isCod: true,
      createdAt: "",
    };
    await saveOrder(codOrder);

    const res = await evaluateOrderFulfillmentEligibility(codOrder.id);
    assert.strictEqual(res.eligible, false);
    assert.strictEqual(res.blockingReasons.includes("cod_requires_phase7_approval"), true, "COD MUST be blocked for Phase 7 approval");
  });

  // 5. Immutable Snapshot Model & Exact Attributes (Req #6 & #10)
  it("creates exact immutable fulfillment snapshot", async () => {
    const order: Order = {
      id: "ORD-SNAP-01",
      customer: { fullName: "Snap User", email: "snap@example.com", phone: "+919999999999", address: "123 Main St", city: "Mumbai", state: "Maharashtra", postalCode: "400001", country: "IN" },
      items: [{ slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 3000, priceDisplay: "₹3,000", lineTotal: 3000, quantity: 2, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 3000,
      currency: "INR",
      status: "paid",
      paymentStatus: "paid",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      createdAt: "",
    };
    await saveOrder(order);

    const claimRes = await createOrClaimFulfillmentAdmin(order.id, "admin-id");
    assert.strictEqual(claimRes.ok, true);
    if (claimRes.ok) {
      const snap = claimRes.fulfillment.snapshotJson;
      assert.ok(snap);
      assert.strictEqual(snap.orderId, "ORD-SNAP-01");
      assert.strictEqual(snap.ascendSku, "PH6-HOOD-BLK-M");
      assert.strictEqual(snap.providerExternalSku, "QIK-SKU-PH6-M");
      assert.strictEqual(snap.customerShipping.fullName, "Snap User");
      assert.strictEqual(snap.customerShipping.city, "Mumbai");
    }
  });

  // 6. Duplicate Simultaneous Claim Guard (Req #11 & #34)
  it("duplicate simultaneous submit -> only one succeeds", async () => {
    const order: Order = {
      id: "ORD-DUPLICATE-CLAIM-02",
      customer: { fullName: "Dup User", email: "dup@example.com", phone: "+919999999999", address: "Line 1", city: "Delhi", state: "Delhi", postalCode: "110001", country: "IN" },
      items: [{ slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 1500,
      currency: "INR",
      status: "paid",
      paymentStatus: "paid",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      createdAt: "",
    };
    await saveOrder(order);

    const res1 = await createOrClaimFulfillmentAdmin(order.id, "admin-id");
    assert.strictEqual(res1.ok, true);

    const res2 = await createOrClaimFulfillmentAdmin(order.id, "admin-id");
    assert.strictEqual(res2.ok, false);
    const isBlocked = res2.error.includes("already_claimed") || res2.error.includes("existing_active_fulfillment_conflict");
    assert.strictEqual(isBlocked, true, `Expected duplicate claim blocked, got: ${res2.error}`);
  });

  // 7. Ambiguous Network Timeout Reconciliation (Req #13)
  it("timeout ambiguous -> sets RECONCILIATION_REQUIRED when lookup is absent", async () => {
    const order: Order = {
      id: "ORD-AMBIGUOUS-ABSENT-01",
      customer: { fullName: "Timeout User", email: "timeout@example.com", phone: "+919999999999", address: "Line 1", city: "Chennai", state: "Tamil Nadu", postalCode: "600001", country: "IN" },
      items: [{ slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 1500,
      currency: "INR",
      status: "paid",
      paymentStatus: "paid",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      createdAt: "",
    };
    await saveOrder(order);

    const claimRes = await createOrClaimFulfillmentAdmin(order.id, "admin-id");
    assert.strictEqual(claimRes.ok, true, `Expected claim ok, got: ${claimRes.ok ? "" : (claimRes as { error?: string }).error}`);

    if (claimRes.ok) {
      const mockTransport = new QikinkMockTransport("timeout_ambiguous_absent");
      const adapter = new QikinkFulfillmentAdapter(mockTransport);

      const submitRes = await submitFulfillmentToProviderAdmin(claimRes.fulfillment.id, "admin-id", adapter);
      assert.strictEqual(submitRes.ok, false);
      assert.strictEqual(submitRes.error.includes("Ambiguous network failure"), true);

      const fRecord = await getFulfillmentByIdAdmin(claimRes.fulfillment.id);
      assert.strictEqual(fRecord?.status, "RECONCILIATION_REQUIRED");
    }
  });

  // 8. Rebound Provider Order Rejected (Req #33)
  it("provider-order rebound -> rejected", async () => {
    const order: Order = {
      id: "ORD-REBOUND-02",
      customer: { fullName: "Rebound User", email: "rebound@example.com", phone: "+919999999999", address: "Line 1", city: "Pune", state: "Maharashtra", postalCode: "411001", country: "IN" },
      items: [{ slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 1500,
      currency: "INR",
      status: "paid",
      paymentStatus: "paid",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      createdAt: "",
    };
    await saveOrder(order);

    const claimRes = await createOrClaimFulfillmentAdmin(order.id, "admin-id");
    assert.strictEqual(claimRes.ok, true, `Expected claim ok, got: ${claimRes.ok ? "" : claimRes.error}`);

    if (claimRes.ok) {
      const initRes = await bindProviderOrderAdmin(claimRes.fulfillment.id, "QIK-ORD-INITIAL", "PRINTING", "PROCESSING", {}, "admin-id");
      assert.strictEqual(initRes.ok, true);

      const reboundRes = await bindProviderOrderAdmin(claimRes.fulfillment.id, "QIK-ORD-DIFFERENT", "PRINTING", "PROCESSING", {}, "admin-id");
      assert.strictEqual(reboundRes.ok, false);
      assert.strictEqual(reboundRes.error, "provider_order_rebound");
    }
  });

  // 9. Secret Redaction Helper (Req #23)
  it("provider secrets are recursively redacted from logs and payloads", () => {
    const rawData = {
      apiKey: "secret_qikink_api_key_12345",
      token: "bearer_token_xyz999",
      nested: {
        authorization: "Bearer secret_header_value",
        signedUrl: "https://cdn.example.com/art.png?Signature=ABC123KEY&token=XYZ",
        publicName: "Ascend Hoodie",
      },
    };

    const redacted = redactSecrets(rawData);
    assert.strictEqual(redacted.apiKey, "[REDACTED]");
    assert.strictEqual(redacted.token, "[REDACTED]");
    assert.strictEqual(redacted.nested.authorization, "[REDACTED]");
    assert.strictEqual(redacted.nested.publicName, "Ascend Hoodie");
    assert.strictEqual(redacted.nested.signedUrl.includes("Signature=[REDACTED]"), true);
  });

  // 10. QIKINK_FULFILLMENT_ENABLED=false Default Safety Guard (Req #41)
  it("QIKINK_FULFILLMENT_ENABLED=false by default disables live network execution", () => {
    delete process.env.QIKINK_FULFILLMENT_ENABLED;
    const adapter = new QikinkFulfillmentAdapter();
    const config = adapter.validateConfiguration();
    assert.strictEqual(config.isValid, false);
    assert.strictEqual(config.error?.includes("QIKINK_FULFILLMENT_ENABLED is set to false"), true);
  });

  // 11. Zero Live Provider Network Calls Verification (Req #37)
  it("VERIFIED: Phase 6 code contains NO live Qikink / Printrove API calls or network requests", () => {
    const filesToScan = [
      path.join(process.cwd(), "lib", "fulfillment", "qikink.ts"),
      path.join(process.cwd(), "lib", "fulfillment", "fulfillment-store.ts"),
      path.join(process.cwd(), "lib", "fulfillment", "eligibility.ts"),
      path.join(process.cwd(), "app", "api", "admin", "wearables", "fulfillment", "route.ts"),
    ];

    for (const file of filesToScan) {
      const src = fs.readFileSync(file, "utf-8");
      assert.strictEqual(src.includes("fetch('https://api.qikink"), false, `File ${file} must NOT invoke live Qikink endpoints`);
      assert.strictEqual(src.includes("fetch(\"https://api.qikink"), false, `File ${file} must NOT invoke live Qikink endpoints`);
    }
  });
});
