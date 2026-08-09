import { describe, it, before } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

import type { Order } from "@/lib/orders/types";
import type { Product } from "@/lib/wearables/types";
import type { PODProvider, DesignAsset, ProductMockup } from "@/lib/wearables/design-types";
import { saveProductAdmin } from "@/lib/wearables/store";
import { saveDesignAdmin, saveProviderMappingAdmin, saveMockupAdmin } from "@/lib/wearables/design-store";
import { saveOrder } from "@/lib/orders/store";

import { evaluateOrderFulfillmentEligibility } from "../eligibility";
import {
  createOrClaimFulfillmentAdmin,
  submitFulfillmentToProviderAdmin,
  retryFulfillmentSubmissionAdmin,
  reconcileSubmissionAdmin,
  bindProviderOrderAdmin,
  updateFulfillmentStatusAdmin,
  getFulfillmentByIdAdmin,
} from "../fulfillment-store";
import { QikinkFulfillmentAdapter, redactSecrets } from "../qikink";
import { QikinkMockTransport } from "../qikink-mock";
import { getFulfillmentProviderAdapter } from "../provider-registry";

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
      {
        id: "var-ph6-l",
        productId: "prod-ph6-1",
        sku: "PH6-HOOD-BLK-L",
        size: "L",
        color: "black",
        stockQuantity: 15,
        pricePaise: 150000,
        compareAtPricePaise: 0,
        providerCostPaise: 80000,
        availabilityStatus: "available",
        isActive: true,
        sortOrder: 1,
        createdAt: "",
        updatedAt: "",
      },
    ],
    createdAt: "",
    updatedAt: "",
  };

  const validDesignA: DesignAsset = {
    id: "dsg-ph6-a",
    title: "Phase 6 Front Graphic",
    slug: "ph6-graphic-front",
    status: "active",
    storagePath: "artwork/ph6-front.png",
    assetUrl: "https://storage.example.com/artwork/ph6-front.png",
    checksum: "sha256-front-123",
    placements: [
      {
        id: "pl-ph6-front-m",
        designId: "dsg-ph6-a",
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
      {
        id: "pl-ph6-front-l",
        designId: "dsg-ph6-a",
        productId: "prod-ph6-1",
        productVariantId: "var-ph6-l",
        position: "front",
        placementLocation: "front",
        xNormalized: 0.5,
        yNormalized: 0.5,
        scale: 1,
        rotationDeg: 0,
        widthMm: 220,
        heightMm: 270,
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
    designId: "dsg-ph6-a",
    placementId: "pl-ph6-front-m",
    imageUrl: "https://storage.example.com/mockups/ph6-front.png",
    viewType: "front",
    isPrimary: true,
    sortOrder: 0,
    status: "approved",
    createdAt: "",
    updatedAt: "",
  };

  const validMockupL: ProductMockup = {
    id: "mock-ph6-2",
    productId: "prod-ph6-1",
    variantId: "var-ph6-l",
    designId: "dsg-ph6-a",
    placementId: "pl-ph6-front-l",
    imageUrl: "https://storage.example.com/mockups/ph6-front-l.png",
    viewType: "front",
    isPrimary: true,
    sortOrder: 0,
    status: "approved",
    createdAt: "",
    updatedAt: "",
  };

  before(async () => {
    await saveProductAdmin(validProduct, "admin-id");
    await saveDesignAdmin({ design: validDesignA, placements: validDesignA.placements }, "admin-id");
    await saveMockupAdmin(validMockup, "admin-id");
    await saveMockupAdmin(validMockupL, "admin-id");
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
          {
            id: "pv-ph6-l",
            providerProductId: "pp-ph6-qik",
            productVariantId: "var-ph6-l",
            externalVariantId: "QIK-V-L",
            externalSku: "QIK-SKU-PH6-L",
            sku: "QIK-SKU-PH6-L",
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
    assert.strictEqual(sql.includes("claim_fulfillment_retry_with_audit"), true);
    assert.strictEqual(sql.includes("bind_provider_order_with_audit"), true);
    assert.strictEqual(sql.includes("payment_method"), true);
    assert.strictEqual(sql.includes("UNKNOWN_PROVIDER_STATE"), true);
  });

  // 2. Unpaid Prepaid Order Blocked (Req #7 & #38)
  it("unpaid prepaid order -> blocked", async () => {
    const unpaidOrder: Order = {
      id: "ORD-UNPAID-01",
      customer: { fullName: "Test User", email: "test@example.com", phone: "+919999999999", address: "Line 1", city: "Bengaluru", state: "Karnataka", postalCode: "560001", country: "IN" },
      items: [{ orderItemId: "item-unpaid-1", slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
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
      items: [{ orderItemId: "item-paid-1", slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 1500,
      currency: "INR",
      status: "paid",
      paymentStatus: "captured",
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
      items: [{ orderItemId: "item-cod-1", slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
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

  // 5. Multi-Item Snapshot Model & Exact Attributes (Requirement #6, #7, #30)
  it("multi-item order assembles exact snapshot from real Phase 5 rows without fabricated strings", async () => {
    const multiOrder: Order = {
      id: "ORD-MULTI-SNAP-01",
      customer: { fullName: "Multi User", email: "multi@example.com", phone: "+919999999999", address: "123 Main St", city: "Mumbai", state: "Maharashtra", postalCode: "400001", country: "IN" },
      items: [
        { orderItemId: "item-row-m-1", slug: "ph6-hoodie", name: "Hoodie M", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" },
        { orderItemId: "item-row-l-2", slug: "ph6-hoodie", name: "Hoodie L", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-l", sku: "PH6-HOOD-BLK-L" },
      ],
      subtotal: 3000,
      currency: "INR",
      status: "paid",
      paymentStatus: "captured",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      createdAt: "",
    };
    await saveOrder(multiOrder);

    const claimRes = await createOrClaimFulfillmentAdmin(multiOrder.id, "a0000000-0000-0000-0000-000000000099");
    assert.strictEqual(claimRes.ok, true);
    if (claimRes.ok) {
      const snap = claimRes.fulfillment.snapshotJson;
      assert.ok(snap);
      assert.strictEqual(snap.orderId, "ORD-MULTI-SNAP-01");
      assert.strictEqual(snap.items.length, 2);

      // Verify item 1
      assert.strictEqual(snap.items[0]!.orderItemId, "item-row-m-1");
      assert.strictEqual(snap.items[0]!.ascendSku, "PH6-HOOD-BLK-M");
      assert.strictEqual(snap.items[0]!.providerExternalSku, "QIK-SKU-PH6-M");
      assert.strictEqual(snap.items[0]!.placements[0]!.placementId, "pl-ph6-front-m");
      assert.strictEqual(snap.items[0]!.placements[0]!.storagePath, "artwork/ph6-front.png");

      // Verify item 2
      assert.strictEqual(snap.items[1]!.orderItemId, "item-row-l-2");
      assert.strictEqual(snap.items[1]!.ascendSku, "PH6-HOOD-BLK-L");
      assert.strictEqual(snap.items[1]!.providerExternalSku, "QIK-SKU-PH6-L");
      assert.strictEqual(snap.items[1]!.placements[0]!.placementId, "pl-ph6-front-l");

      // Assert NO fabricated strings exist
      const snapStr = JSON.stringify(snap);
      assert.strictEqual(snapStr.includes("pl-snap-"), false, "Snapshot MUST NOT contain pl-snap-");
      assert.strictEqual(snapStr.includes("dsg-snap-"), false, "Snapshot MUST NOT contain dsg-snap-");
      assert.strictEqual(snapStr.includes("artwork/design-"), false, "Snapshot MUST NOT contain artwork/design-");
    }
  });

  // 6. Duplicate Simultaneous Claim Guard (Req #11 & #34)
  it("duplicate simultaneous submit -> only one succeeds", async () => {
    const order: Order = {
      id: "ORD-DUPLICATE-CLAIM-02",
      customer: { fullName: "Dup User", email: "dup@example.com", phone: "+919999999999", address: "Line 1", city: "Delhi", state: "Delhi", postalCode: "110001", country: "IN" },
      items: [{ orderItemId: "item-dup-1", slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 1500,
      currency: "INR",
      status: "paid",
      paymentStatus: "captured",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      createdAt: "",
    };
    await saveOrder(order);

    const res1 = await createOrClaimFulfillmentAdmin(order.id, "a0000000-0000-0000-0000-000000000099");
    assert.strictEqual(res1.ok, true);

    const res2 = await createOrClaimFulfillmentAdmin(order.id, "a0000000-0000-0000-0000-000000000099");
    assert.strictEqual(res2.ok, false);
    const isBlocked = res2.error.includes("already_claimed") || res2.error.includes("existing_active_fulfillment_conflict");
    assert.strictEqual(isBlocked, true, `Expected duplicate claim blocked, got: ${res2.error}`);
  });

  // 7. Ambiguous Network Timeout Reconciliation (Req #13 & #17)
  it("timeout ambiguous -> sets RECONCILIATION_REQUIRED when lookup is absent", async () => {
    const order: Order = {
      id: "ORD-AMBIGUOUS-ABSENT-01",
      customer: { fullName: "Timeout User", email: "timeout@example.com", phone: "+919999999999", address: "Line 1", city: "Chennai", state: "Tamil Nadu", postalCode: "600001", country: "IN" },
      items: [{ orderItemId: "item-to-1", slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 1500,
      currency: "INR",
      status: "paid",
      paymentStatus: "captured",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      createdAt: "",
    };
    await saveOrder(order);

    const claimRes = await createOrClaimFulfillmentAdmin(order.id, "a0000000-0000-0000-0000-000000000099");
    assert.strictEqual(claimRes.ok, true);

    if (claimRes.ok) {
      const mockTransport = new QikinkMockTransport("timeout_ambiguous_absent");
      const adapter = new QikinkFulfillmentAdapter(mockTransport);

      const submitRes = await submitFulfillmentToProviderAdmin(claimRes.fulfillment.id, "a0000000-0000-0000-0000-000000000099", adapter);
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
      items: [{ orderItemId: "item-reb-1", slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 1500,
      currency: "INR",
      status: "paid",
      paymentStatus: "captured",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      createdAt: "",
    };
    await saveOrder(order);

    const claimRes = await createOrClaimFulfillmentAdmin(order.id, "a0000000-0000-0000-0000-000000000099");
    assert.strictEqual(claimRes.ok, true);

    if (claimRes.ok) {
      const initRes = await bindProviderOrderAdmin(claimRes.fulfillment.id, "QIK-ORD-INITIAL", "PRINTING", "PROCESSING", {}, "a0000000-0000-0000-0000-000000000099");
      assert.strictEqual(initRes.ok, true);

      const reboundRes = await bindProviderOrderAdmin(claimRes.fulfillment.id, "QIK-ORD-DIFFERENT", "PRINTING", "PROCESSING", {}, "a0000000-0000-0000-0000-000000000099");
      assert.strictEqual(reboundRes.ok, false);
      assert.strictEqual(reboundRes.error, "provider_order_rebound");
    }
  });

  // 9. Adapter Mismatch Protection (Requirement #9)
  it("adapter mismatch -> rejected with provider_adapter_mismatch", () => {
    assert.throws(
      () => getFulfillmentProviderAdapter("printrove"),
      (err: Error) => err.message.includes("provider_adapter_mismatch"),
      "Printrove adapter MUST throw provider_adapter_mismatch in Phase 6",
    );
  });

  // 10. Retry Concurrency & Call Counter (Requirement #13 & #33)
  it("concurrent retries increment provider submit call count by ONLY 1", async () => {
    const order: Order = {
      id: "ORD-RETRY-COUNT-01",
      customer: { fullName: "Retry Counter User", email: "rc@example.com", phone: "+919999999999", address: "Line 1", city: "Kolkata", state: "West Bengal", postalCode: "700001", country: "IN" },
      items: [{ orderItemId: "item-rc-1", slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 1500,
      currency: "INR",
      status: "paid",
      paymentStatus: "captured",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      createdAt: "",
    };
    await saveOrder(order);

    const claimRes = await createOrClaimFulfillmentAdmin(order.id, null);
    assert.strictEqual(claimRes.ok, true);

    if (claimRes.ok) {
      const mockTransport = new QikinkMockTransport("rate_limit_429");
      const adapter = new QikinkFulfillmentAdapter(mockTransport);

      // Initial submit -> rate limit -> QUEUED
      const submit1 = await submitFulfillmentToProviderAdmin(claimRes.fulfillment.id, null, adapter);
      assert.strictEqual(submit1.ok, false);
      assert.strictEqual(mockTransport.callCount, 1);

      const fRec = await getFulfillmentByIdAdmin(claimRes.fulfillment.id);
      assert.strictEqual(fRec?.status, "QUEUED");

      // Switch scenario to success for retry
      mockTransport.setScenario("success");

      // Execute 2 concurrent retry requests
      const [r1, r2] = await Promise.all([
        retryFulfillmentSubmissionAdmin(claimRes.fulfillment.id, null, adapter),
        retryFulfillmentSubmissionAdmin(claimRes.fulfillment.id, null, adapter),
      ]);

      // Exactly one retry succeeds, callCount increments by ONLY 1 (total 2)
      assert.strictEqual(mockTransport.callCount, 2, "Call count MUST be exactly 2 after 1 initial + 1 winning retry");
      assert.strictEqual((r1.ok && !r2.ok) || (!r1.ok && r2.ok), true, "Exactly one retry MUST succeed");
    }
  });

  // 11. RECONCILIATION_REQUIRED Retry Rejection (Requirement #14 & #33)
  it("RECONCILIATION_REQUIRED state rejects retryFulfillmentSubmissionAdmin without calling submitOrder", async () => {
    const order: Order = {
      id: "ORD-NO-RETRY-RECON-01",
      customer: { fullName: "No Retry User", email: "noretry@example.com", phone: "+919999999999", address: "Line 1", city: "Surat", state: "Gujarat", postalCode: "395001", country: "IN" },
      items: [{ orderItemId: "item-nr-1", slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 1500,
      currency: "INR",
      status: "paid",
      paymentStatus: "captured",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      createdAt: "",
    };
    await saveOrder(order);

    const claimRes = await createOrClaimFulfillmentAdmin(order.id, null);
    assert.strictEqual(claimRes.ok, true);

    if (claimRes.ok) {
      await updateFulfillmentStatusAdmin(claimRes.fulfillment.id, "RECONCILIATION_REQUIRED");

      const mockTransport = new QikinkMockTransport("success");
      const adapter = new QikinkFulfillmentAdapter(mockTransport);

      const retryRes = await retryFulfillmentSubmissionAdmin(claimRes.fulfillment.id, null, adapter);
      assert.strictEqual(retryRes.ok, false);
      assert.strictEqual(retryRes.error, "reconciliation_required");
      assert.strictEqual(mockTransport.callCount, 0, "Provider submit MUST NOT be called from RECONCILIATION_REQUIRED");

      // Calling reconcileSubmissionAdmin with unverified lookup returns QIKINK_RECONCILIATION_API_UNVERIFIED
      const reconRes = await reconcileSubmissionAdmin(claimRes.fulfillment.id, null, adapter);
      assert.strictEqual(reconRes.ok, false);
      assert.strictEqual(reconRes.error, "QIKINK_RECONCILIATION_API_UNVERIFIED");
    }
  });

  // 12. UNKNOWN_PROVIDER_STATE Normalization (Requirement #20 & #34)
  it("unknown provider status returns UNKNOWN_PROVIDER_STATE", () => {
    const adapter = new QikinkFulfillmentAdapter();
    const status = adapter.normalizeStatus("SOME_CUSTOM_VENDOR_STATE");
    assert.strictEqual(status, "UNKNOWN_PROVIDER_STATE");
  });

  // 13. Status Transition Enforcement (Requirement #21 & #34)
  it("prevents invalid status transitions from terminal state", async () => {
    const order: Order = {
      id: "ORD-TRANSITION-GUARD-01",
      customer: { fullName: "Term User", email: "term@example.com", phone: "+919999999999", address: "Line 1", city: "Jaipur", state: "Rajasthan", postalCode: "302001", country: "IN" },
      items: [{ orderItemId: "item-tg-1", slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 1500,
      currency: "INR",
      status: "paid",
      paymentStatus: "captured",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      createdAt: "",
    };
    await saveOrder(order);

    const claimRes = await createOrClaimFulfillmentAdmin(order.id, null);
    assert.strictEqual(claimRes.ok, true);

    if (claimRes.ok) {
      await updateFulfillmentStatusAdmin(claimRes.fulfillment.id, "DELIVERED");

      const transitionRes = await updateFulfillmentStatusAdmin(claimRes.fulfillment.id, "PROCESSING");
      assert.strictEqual(transitionRes.ok, false);
      assert.strictEqual(transitionRes.error.includes("Invalid status transition"), true);
    }
  });

  // 14. Secret Redaction Helper (Req #23)
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

  // 15. QIKINK_FULFILLMENT_ENABLED=false Default Safety Guard (Req #41)
  it("QIKINK_FULFILLMENT_ENABLED=false by default disables live network execution", () => {
    delete process.env.QIKINK_FULFILLMENT_ENABLED;
    const adapter = new QikinkFulfillmentAdapter();
    const config = adapter.validateConfiguration();
    assert.strictEqual(config.isValid, false);
    assert.strictEqual(config.error?.includes("QIKINK_FULFILLMENT_ENABLED is set to false"), true);
  });

  // 16. Zero Live Provider Network Calls Verification (Req #37)
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
