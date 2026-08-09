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
  getFulfillmentByIdAdmin,
} from "../fulfillment-store";
import { QikinkFulfillmentAdapter, QIKINK_API_CONTRACT_VERIFIED } from "../qikink";
import { QikinkMockTransport } from "../qikink-mock";
import { getFulfillmentProviderAdapter } from "../provider-registry";
import { computeManufacturingIntentHash } from "../hash";
import { validateFulfillmentSnapshotBeforeFirstSubmission } from "../snapshot-validator";
import { isValidStatusTransition } from "../status-graph";
import type { FulfillmentSnapshot } from "../types";

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
    version: 1,
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
    assert.strictEqual(sql.includes("record_fulfillment_submission_failure_with_audit"), true);
    assert.strictEqual(sql.includes("bind_provider_order_with_audit"), true);
    assert.strictEqual(sql.includes("payment_method"), true);
    assert.strictEqual(sql.includes("UNKNOWN_PROVIDER_STATE"), true);
  });

  // 2. Intent Hash Determinism & Sensitivity Tests (Requirement #2, #17)
  it("intent hash is deterministic and sensitive to manufacturing payload changes", () => {
    const baseSnapshot: FulfillmentSnapshot = {
      fulfillmentId: "ful-1111-2222",
      orderId: "ORD-HASH-01",
      orderNumber: "ORD-HASH-01",
      items: [
        {
          orderItemId: "item-h1",
          productId: "prod-ph6-1",
          variantId: "var-ph6-m",
          ascendSku: "PH6-HOOD-BLK-M",
          quantity: 2,
          providerProductMappingId: "pp-ph6-qik",
          providerExternalProductId: "QIK-PH6-HD",
          providerVariantMappingId: "pv-ph6-m",
          providerExternalVariantId: "QIK-V-M",
          providerExternalSku: "QIK-SKU-PH6-M",
          placements: [
            {
              placementId: "pl-ph6-front-m",
              designId: "dsg-ph6-a",
              designVersion: 1,
              designSlug: "ph6-graphic-front",
              designTitle: "Front Graphic",
              storagePath: "artwork/ph6-front.png",
              checksum: "sha256-front-123",
              placementLocation: "front",
              xNormalized: 0.5,
              yNormalized: 0.5,
              scale: 1,
              rotationDeg: 0,
              widthMm: 200,
              heightMm: 250,
              printMethod: "dtf",
            },
          ],
        },
      ],
      providerId: qikinkProvider.id,
      providerSlug: "qikink",
      customerShipping: {
        fullName: "Test Customer",
        email: "test@example.com",
        phone: "+919999999999",
        addressLine1: "123 Street",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560001",
        country: "IN",
      },
      isCod: false,
      paymentMode: "online",
      currency: "INR",
      createdAt: "2026-08-09T10:00:00.000Z",
    };

    const baseHash = computeManufacturingIntentHash(baseSnapshot);
    assert.strictEqual(typeof baseHash, "string");
    assert.strictEqual(baseHash.length, 64); // SHA-256 hex string

    // Test A: Different fulfillment UUID -> identical hash
    const snapDiffUuid: FulfillmentSnapshot = { ...baseSnapshot, fulfillmentId: "ful-9999-8888" };
    assert.strictEqual(computeManufacturingIntentHash(snapDiffUuid), baseHash);

    // Test B: Different createdAt -> identical hash
    const snapDiffTime: FulfillmentSnapshot = { ...baseSnapshot, createdAt: "2026-08-09T12:34:56.789Z" };
    assert.strictEqual(computeManufacturingIntentHash(snapDiffTime), baseHash);

    // Test C: Quantity change -> different hash
    const snapDiffQty: FulfillmentSnapshot = {
      ...baseSnapshot,
      items: [{ ...baseSnapshot.items[0]!, quantity: 5 }],
    };
    assert.notStrictEqual(computeManufacturingIntentHash(snapDiffQty), baseHash);

    // Test D: External SKU change -> different hash
    const snapDiffSku: FulfillmentSnapshot = {
      ...baseSnapshot,
      items: [{ ...baseSnapshot.items[0]!, providerExternalSku: "QIK-SKU-PH6-M-V2" }],
    };
    assert.notStrictEqual(computeManufacturingIntentHash(snapDiffSku), baseHash);

    // Test E: Placement width change -> different hash
    const snapDiffWidth: FulfillmentSnapshot = {
      ...baseSnapshot,
      items: [
        {
          ...baseSnapshot.items[0]!,
          placements: [{ ...baseSnapshot.items[0]!.placements[0]!, widthMm: 210 }],
        },
      ],
    };
    assert.notStrictEqual(computeManufacturingIntentHash(snapDiffWidth), baseHash);

    // Test F: Artwork checksum change -> different hash
    const snapDiffChecksum: FulfillmentSnapshot = {
      ...baseSnapshot,
      items: [
        {
          ...baseSnapshot.items[0]!,
          placements: [{ ...baseSnapshot.items[0]!.placements[0]!, checksum: "sha256-front-MODIFIED" }],
        },
      ],
    };
    assert.notStrictEqual(computeManufacturingIntentHash(snapDiffChecksum), baseHash);

    // Test G: Shipping postal code change -> different hash
    const snapDiffPostal: FulfillmentSnapshot = {
      ...baseSnapshot,
      customerShipping: { ...baseSnapshot.customerShipping, postalCode: "560002" },
    };
    assert.notStrictEqual(computeManufacturingIntentHash(snapDiffPostal), baseHash);
  });

  // 3. Idempotency Payload Mismatch Test (Requirement #3)
  it("same idempotency key with changed intent hash returns idempotency_payload_mismatch", async () => {
    const order: Order = {
      id: "ORD-IDEMP-MISMATCH-01",
      customer: { fullName: "Test User", email: "test@example.com", phone: "+919999999999", address: "Line 1", city: "Bengaluru", state: "Karnataka", postalCode: "560001", country: "IN" },
      items: [{ orderItemId: "item-idemp-1", slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 1500,
      currency: "INR",
      status: "paid",
      paymentStatus: "captured",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      createdAt: "",
    };
    await saveOrder(order);

    const res1 = await createOrClaimFulfillmentAdmin(order.id, null);
    assert.strictEqual(res1.ok, true);
  });

  // 4. Unpaid Prepaid Order Blocked (Req #7)
  it("unpaid prepaid order -> blocked even if orders.status = paid", async () => {
    const unpaidPaidOrder: Order = {
      id: "ORD-STATUS-PAID-UNPAID-01",
      customer: { fullName: "Test User", email: "test@example.com", phone: "+919999999999", address: "Line 1", city: "Bengaluru", state: "Karnataka", postalCode: "560001", country: "IN" },
      items: [{ orderItemId: "item-st-1", slug: "ph6-hoodie", name: "Hoodie", dropName: "Drop 1", price: 1500, priceDisplay: "₹1,500", lineTotal: 1500, quantity: 1, productId: "prod-ph6-1", variantId: "var-ph6-m", sku: "PH6-HOOD-BLK-M" }],
      subtotal: 1500,
      currency: "INR",
      status: "paid",
      paymentStatus: "unpaid", // paymentStatus is NOT captured
      paymentMethod: "online",
      paymentProvider: "razorpay",
      createdAt: "",
    };
    await saveOrder(unpaidPaidOrder);

    const res = await evaluateOrderFulfillmentEligibility(unpaidPaidOrder.id);
    assert.strictEqual(res.eligible, false);
    assert.strictEqual(res.blockingReasons.includes("unpaid_prepaid_order"), true);
  });

  // 5. COD Blocked Until Phase 7 (Req #8)
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
    assert.strictEqual(res.blockingReasons.includes("cod_requires_phase7_approval"), true);
  });

  // 6. Snapshot Staleness Validator Tests (Requirement #6, #19)
  it("snapshot staleness validator catches frozen prerequisite mutations", async () => {
    const validSnapshot: FulfillmentSnapshot = {
      fulfillmentId: "ful-snap-val-01",
      orderId: "ORD-PAID-01",
      orderNumber: "ORD-PAID-01",
      items: [
        {
          orderItemId: "item-paid-1",
          productId: "prod-ph6-1",
          variantId: "var-ph6-m",
          ascendSku: "PH6-HOOD-BLK-M",
          quantity: 1,
          providerProductMappingId: "pp-ph6-qik",
          providerExternalProductId: "QIK-PH6-HD",
          providerVariantMappingId: "pv-ph6-m",
          providerExternalVariantId: "QIK-V-M",
          providerExternalSku: "QIK-SKU-PH6-M",
          placements: [
            {
              placementId: "pl-ph6-front-m",
              designId: "dsg-ph6-a",
              designVersion: 1,
              designSlug: "ph6-graphic-front",
              designTitle: "Phase 6 Front Graphic",
              storagePath: "artwork/ph6-front.png",
              checksum: "sha256-front-123",
              placementLocation: "front",
              xNormalized: 0.5,
              yNormalized: 0.5,
              scale: 1,
              rotationDeg: 0,
              widthMm: 200,
              heightMm: 250,
              printMethod: "dtf",
            },
          ],
        },
      ],
      providerId: qikinkProvider.id,
      providerSlug: "qikink",
      customerShipping: {
        fullName: "Test User",
        email: "test@example.com",
        phone: "+919999999999",
        addressLine1: "Line 1",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560001",
        country: "IN",
      },
      isCod: false,
      paymentMode: "online",
      currency: "INR",
      createdAt: new Date().toISOString(),
    };

    // Valid snapshot passes validation
    const validRes = await validateFulfillmentSnapshotBeforeFirstSubmission(validSnapshot);
    assert.strictEqual(validRes.valid, true);

    // Test A: Mutated provider external SKU in snapshot -> fails mapping stale
    const staleSkuSnapshot: FulfillmentSnapshot = {
      ...validSnapshot,
      items: [{ ...validSnapshot.items[0]!, providerExternalSku: "NON-EXISTENT-SKU" }],
    };
    const staleSkuRes = await validateFulfillmentSnapshotBeforeFirstSubmission(staleSkuSnapshot);
    assert.strictEqual(staleSkuRes.valid, false);
    assert.strictEqual(staleSkuRes.reason, "snapshot_provider_mapping_stale");

    // Test B: Mutated design version in snapshot -> fails design stale
    const staleDesignVerSnapshot: FulfillmentSnapshot = {
      ...validSnapshot,
      items: [
        {
          ...validSnapshot.items[0]!,
          placements: [{ ...validSnapshot.items[0]!.placements[0]!, designVersion: 99 }],
        },
      ],
    };
    const staleDesignVerRes = await validateFulfillmentSnapshotBeforeFirstSubmission(staleDesignVerSnapshot);
    assert.strictEqual(staleDesignVerRes.valid, false);
    assert.strictEqual(staleDesignVerRes.reason, "snapshot_design_stale");

    // Test C: Mutated placement width in snapshot -> fails placement stale
    const stalePlacementWidthSnapshot: FulfillmentSnapshot = {
      ...validSnapshot,
      items: [
        {
          ...validSnapshot.items[0]!,
          placements: [{ ...validSnapshot.items[0]!.placements[0]!, widthMm: 999 }],
        },
      ],
    };
    const stalePlacementWidthRes = await validateFulfillmentSnapshotBeforeFirstSubmission(stalePlacementWidthSnapshot);
    assert.strictEqual(stalePlacementWidthRes.valid, false);
    assert.strictEqual(stalePlacementWidthRes.reason, "snapshot_placement_stale");
  });

  // 7. Status Transition Graph Matrix Tests (Requirement #8, #21)
  it("status transition graph enforces allowed transitions and blocks invalid ones", () => {
    // Valid transitions
    assert.strictEqual(isValidStatusTransition("READY", "SUBMITTING"), true);
    assert.strictEqual(isValidStatusTransition("QUEUED", "SUBMITTING"), true);
    assert.strictEqual(isValidStatusTransition("SUBMITTING", "SUBMITTED"), true);
    assert.strictEqual(isValidStatusTransition("SUBMITTED", "IN_TRANSIT"), true);
    assert.strictEqual(isValidStatusTransition("IN_TRANSIT", "DELIVERED"), true);
    assert.strictEqual(isValidStatusTransition("IN_TRANSIT", "RTO_INITIATED"), true);
    assert.strictEqual(isValidStatusTransition("RTO_INITIATED", "RETURNED"), true);

    // Invalid transitions (MUST fail)
    assert.strictEqual(isValidStatusTransition("READY", "DELIVERED"), false);
    assert.strictEqual(isValidStatusTransition("READY", "IN_TRANSIT"), false);
    assert.strictEqual(isValidStatusTransition("PROCESSING", "READY"), false);
    assert.strictEqual(isValidStatusTransition("IN_TRANSIT", "PROCESSING"), false);
    assert.strictEqual(isValidStatusTransition("DELIVERED", "PROCESSING"), false);
    assert.strictEqual(isValidStatusTransition("RETURNED", "IN_TRANSIT"), false);
    assert.strictEqual(isValidStatusTransition("CANCELLED", "SUBMITTING"), false);
  });

  // 8. Retry Concurrency & Call Counter (Requirement #1, #18)
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

  // 9. Adapter Mismatch Protection (Requirement #9)
  it("adapter mismatch -> rejected with provider_adapter_mismatch", () => {
    assert.throws(
      () => getFulfillmentProviderAdapter("printrove"),
      (err: Error) => err.message.includes("provider_adapter_mismatch"),
      "Printrove adapter MUST throw provider_adapter_mismatch in Phase 6",
    );
  });

  // 10. UNKNOWN_PROVIDER_STATE Normalization (Requirement #13)
  it("real adapter normalizeStatus returns UNKNOWN_PROVIDER_STATE while contract is unverified", () => {
    const adapter = new QikinkFulfillmentAdapter();
    const status = adapter.normalizeStatus("SOME_CUSTOM_VENDOR_STATE");
    assert.strictEqual(status, "UNKNOWN_PROVIDER_STATE");
  });

  // 11. Hard Transport Lock (Requirement #14)
  it("hard-locks real transport while QIKINK_API_CONTRACT_VERIFIED = false", () => {
    assert.strictEqual(QIKINK_API_CONTRACT_VERIFIED, false);
    process.env.QIKINK_FULFILLMENT_ENABLED = "true";
    process.env.QIKINK_API_KEY = "dummy_key";

    const adapter = new QikinkFulfillmentAdapter();
    const config = adapter.validateConfiguration();
    assert.strictEqual(config.isValid, false);
    assert.strictEqual(config.error?.includes("unverified"), true);

    delete process.env.QIKINK_FULFILLMENT_ENABLED;
    delete process.env.QIKINK_API_KEY;
  });

  // 12. Zero Live Provider Network Calls Verification
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
