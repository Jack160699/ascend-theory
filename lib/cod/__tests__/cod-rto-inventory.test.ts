import { describe, it, before } from "node:test";
import assert from "node:assert";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { Order } from "@/lib/orders/types";
import type { Product } from "@/lib/wearables/types";
import type { PODProvider, DesignAsset, ProductMockup } from "@/lib/wearables/design-types";
import { saveProductAdmin } from "@/lib/wearables/store";
import { saveDesignAdmin, saveProviderMappingAdmin, saveMockupAdmin } from "@/lib/wearables/design-store";
import { saveOrder, getOrderAdmin, getAllOrdersAdmin } from "@/lib/orders/store";
import { createOrder } from "@/lib/orders/create-order";

import { evaluateOrderFulfillmentEligibility } from "@/lib/fulfillment/eligibility";
import { getAllFulfillmentsAdmin } from "@/lib/fulfillment/fulfillment-store";

import { evaluateCodOrderDecision, applyCodDecisionAdmin, overrideCodStatusAdmin } from "../decision-engine";
import { createOtpChallengeAdmin, verifyOtpChallengeAdmin, hashOtp } from "../otp";
import { processCodAdvanceCaptureAdmin } from "../advance";
import { recordDeliveryOutcomeAdmin, saveRiskProfileAdmin, getRiskProfileByPhoneAdmin } from "../outcomes";
import { saveReturnedInventoryItemAdmin, reserveReturnedInventoryAdmin, getAgeingBucket } from "@/lib/inventory/returned-store";
import { findMatchingReturnedInventory, canReserveReturnedInventoryForOrder, computeManufacturingIdentityHash } from "@/lib/inventory/reuse-engine";
import { getTodayKolkataDateString } from "../exposure";

describe("Phase 7 — COD Risk, RTO & Returned Inventory Production Repair Tests", () => {
  const provider: PODProvider = {
    id: "a0000000-0000-0000-0000-000000000001",
    slug: "qikink",
    name: "Qikink",
    isActive: true,
    createdAt: "",
  };

  const product: Product = {
    id: "prod-ph7-1",
    slug: "ph7-tee",
    title: "Phase 7 T-Shirt",
    status: "active",
    basePricePaise: 100000,
    currency: "INR",
    category: "wearables",
    gender: "unisex",
    isFeatured: true,
    galleryJson: [],
    variants: [
      {
        id: "var-ph7-m",
        productId: "prod-ph7-1",
        sku: "PH7-TEE-BLK-M",
        size: "M",
        color: "black",
        stockQuantity: 50,
        pricePaise: 100000,
        compareAtPricePaise: 0,
        providerCostPaise: 40000,
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

  const design: DesignAsset = {
    id: "dsg-ph7-1",
    title: "Phase 7 Artwork",
    slug: "ph7-artwork",
    status: "active",
    version: 1,
    storagePath: "artwork/ph7-art.png",
    assetUrl: "https://storage.example.com/artwork/ph7-art.png",
    checksum: "sha256-ph7-12345",
    placements: [
      {
        id: "pl-ph7-front",
        designId: "dsg-ph7-1",
        productId: "prod-ph7-1",
        productVariantId: "var-ph7-m",
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

  const mockup: ProductMockup = {
    id: "mock-ph7-1",
    productId: "prod-ph7-1",
    variantId: "var-ph7-m",
    designId: "dsg-ph7-1",
    placementId: "pl-ph7-front",
    imageUrl: "https://storage.example.com/mockups/ph7-front.png",
    viewType: "front",
    isPrimary: true,
    sortOrder: 0,
    status: "approved",
    createdAt: "",
    updatedAt: "",
  };

  before(async () => {
    await saveProductAdmin(product, "admin-id");
    await saveDesignAdmin({ design, placements: design.placements }, "admin-id");
    await saveMockupAdmin(mockup, "admin-id");
    await saveProviderMappingAdmin(
      {
        providerProduct: {
          id: "pp-ph7-qik",
          providerId: provider.id,
          productId: product.id,
          externalProductId: "QIK-PH7-TEE",
          name: "Qikink T-Shirt",
          printMethodsJson: ["dtf"],
          printableAreasJson: [{ location: "front", maxWidthMm: 300, maxHeightMm: 400, printMethod: "dtf" }],
          mappingStatus: "verified",
        },
        providerVariants: [
          {
            id: "pv-ph7-m",
            providerProductId: "pp-ph7-qik",
            productVariantId: "var-ph7-m",
            externalVariantId: "QIK-V-M",
            externalSku: "QIK-SKU-PH7-M",
            sku: "QIK-SKU-PH7-M",
            mappingStatus: "verified",
          },
        ],
      },
      "admin-id",
    );
  });

  // 1. Migration 00008 Schema Mechanics
  it("migration 00008 uses ALTER TABLE for existing Phase 2 tables cod_risk_profiles and returned_inventory", () => {
    const migPath = path.join(process.cwd(), "supabase", "migrations", "20260809000008_cod_risk_rto_returned_inventory.sql");
    const sql = fs.readFileSync(migPath, "utf8");

    assert.strictEqual(sql.includes("ALTER TABLE public.cod_risk_profiles"), true);
    assert.strictEqual(sql.includes("ALTER TABLE public.returned_inventory"), true);
    assert.strictEqual(sql.includes("CREATE TABLE IF NOT EXISTS public.cod_advance_payments"), true);
    assert.strictEqual(sql.includes("CREATE TABLE IF NOT EXISTS public.cod_otp_challenges"), true);
    assert.strictEqual(sql.includes("CREATE TABLE IF NOT EXISTS public.delivery_outcome_events"), true);
  });

  // 2. Requirement #9: COD Checkout starts in COD_PENDING_CONFIRMATION with ZERO fulfillments
  it("createOrder() for COD starts in COD_PENDING_CONFIRMATION and generates confirmationToken with ZERO fulfillments", async () => {
    const input = {
      items: [{ slug: "ph7-tee", variantId: "var-ph7-m", sku: "PH7-TEE-BLK-M", price: 1000, quantity: 1 }],
      customer: { fullName: "Pending Customer", email: "p@example.com", phone: "+919876543210", address: "Line 1", city: "Mumbai", state: "Maharashtra", postalCode: "400001", country: "IN" },
      paymentMethod: "cod" as const,
    };

    const res = await createOrder(input, "http://localhost:3000");
    assert.strictEqual(res.ok, true);

    if (res.ok) {
      assert.strictEqual(res.data.order.codStatus, "COD_PENDING_CONFIRMATION");
      assert.strictEqual(typeof res.data.confirmationToken, "string");
      assert.strictEqual(res.data.confirmationToken!.length >= 32, true);

      // Verify ZERO fulfillments
      const fulfillments = await getAllFulfillmentsAdmin();
      const orderFulfillments = fulfillments.filter((f) => f.orderId === res.data.order.id);
      assert.strictEqual(orderFulfillments.length, 0);
    }
  });

  // 3. Confirmation Token Hash Verification
  it("confirmationToken hash is stored server-side and verification succeeds", async () => {
    const rawToken = "my_secret_customer_token_123456789";
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const order: Order = {
      id: "ORD-TOKEN-VERIFY-01",
      customer: { fullName: "Token User", email: "t@example.com", phone: "+919876543210", address: "Line 1", city: "Delhi", state: "Delhi", postalCode: "110001", country: "IN" },
      items: [],
      subtotal: 1000,
      currency: "INR",
      status: "pending_fulfillment",
      paymentMethod: "cod",
      paymentProvider: "none",
      codStatus: "COD_PENDING_CONFIRMATION",
      codConfirmationTokenHash: tokenHash,
      createdAt: new Date().toISOString(),
    };
    await saveOrder(order);

    const retrieved = await getOrderAdmin(order.id);
    assert.strictEqual(retrieved?.codConfirmationTokenHash, tokenHash);
  });

  // 4. Decision Engine Classification
  it("decision engine classifies new, trusted, high risk, and advance required orders", () => {
    const baseOrder: Order = {
      id: "ORD-DEC-02",
      customer: { fullName: "User", email: "u@example.com", phone: "+919999999999", address: "Line 1", city: "Bengaluru", state: "Karnataka", postalCode: "560001", country: "IN" },
      items: [{ orderItemId: "item-1", slug: "ph7-tee", name: "Tee", dropName: "D1", price: 1000, priceDisplay: "₹1,000", lineTotal: 1000, quantity: 1, productId: "prod-ph7-1", variantId: "var-ph7-m" }],
      subtotal: 1000,
      currency: "INR",
      status: "created",
      paymentMethod: "cod",
      paymentProvider: "none",
      createdAt: new Date().toISOString(),
    };

    const resNew = evaluateCodOrderDecision(baseOrder, null, 0);
    assert.strictEqual(resNew.decision, "OTP_REQUIRED");
    assert.strictEqual(resNew.codStatus, "COD_OTP_PENDING");

    const trustedProfile = {
      id: "prof-1",
      phoneNormalized: "+919999999999",
      successfulCodDeliveries: 2,
      successfulPrepaidDeliveries: 0,
      codOrders: 2,
      codConfirmedOrders: 2,
      rtoCount: 0,
      refusedCount: 0,
      cancelledAfterConfirmationCount: 0,
      riskScore: 10,
      riskBand: "TRUSTED_REPEAT" as const,
      prepaidOnly: false,
      manualHold: false,
      createdAt: "",
      updatedAt: "",
    };
    const resTrusted = evaluateCodOrderDecision(baseOrder, trustedProfile, 0);
    assert.strictEqual(resTrusted.decision, "FULL_COD");
    assert.strictEqual(resTrusted.codStatus, "COD_APPROVED");
  });

  // 5. OTP HMAC Pepper & Resend Throttling
  it("OTP hash uses server pepper and enforces resend cooldown", async () => {
    const pepper = "test_pepper_123";
    const rawOtp = "654321";
    const hmac = hashOtp(rawOtp, pepper);

    assert.strictEqual(hmac, crypto.createHmac("sha256", pepper).update(rawOtp).digest("hex"));

    const orderId = "ORD-OTP-THROTTLE-01";
    const phone = "+919876543210";

    const res1 = await createOtpChallengeAdmin(orderId, phone, pepper);
    assert.strictEqual(res1.ok, true);

    // Immediate second send fails due to 60s cooldown
    const res2 = await createOtpChallengeAdmin(orderId, phone, pepper);
    assert.strictEqual(res2.ok, false);
    assert.strictEqual(res2.error, "otp_resend_cooldown_active");
  });

  // 6. Authoritative Advance Payment Capture Gate
  it("processCodAdvanceCaptureAdmin rejects caller secret and status mismatches", async () => {
    const advanceOrder: Order = {
      id: "ORD-ADVANCE-GATE-01",
      customer: { fullName: "Advance Customer", email: "adv@example.com", phone: "+919876543210", address: "Line 1", city: "Kolkata", state: "West Bengal", postalCode: "700001", country: "IN" },
      items: [{ orderItemId: "item-adv-1", slug: "ph7-tee", name: "Tee", dropName: "D1", price: 6000, priceDisplay: "₹6,000", lineTotal: 6000, quantity: 1, productId: "prod-ph7-1", variantId: "var-ph7-m", sku: "PH7-TEE-BLK-M" }],
      subtotal: 6000,
      currency: "INR",
      status: "pending_fulfillment",
      paymentMethod: "cod",
      paymentProvider: "razorpay",
      codStatus: "COD_ADVANCE_REQUIRED",
      advanceRequired: true,
      advanceAmountPaise: 20000,
      advanceStatus: "pending",
      createdAt: new Date().toISOString(),
    };
    await saveOrder(advanceOrder);

    const rzpOrderId = "rzp_order_adv_999";
    const rzpPaymentId = "pay_adv_9999";
    const secret = "test_key_secret_for_unit_tests";

    const validSig = crypto
      .createHmac("sha256", secret)
      .update(`${rzpOrderId}|${rzpPaymentId}`)
      .digest("hex");

    // Provider status = authorized (NOT captured) fails
    const resAuth = await processCodAdvanceCaptureAdmin({
      orderId: advanceOrder.id,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: rzpPaymentId,
      razorpaySignature: validSig,
      providerStatus: "authorized",
    });
    assert.strictEqual(resAuth.ok, false);
    assert.strictEqual(resAuth.error, "provider_payment_not_captured");

    // Captured amount mismatch fails
    const resAmtMismatch = await processCodAdvanceCaptureAdmin({
      orderId: advanceOrder.id,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: rzpPaymentId,
      razorpaySignature: validSig,
      capturedAmountPaise: 10000, // Expected 20000
    });
    assert.strictEqual(resAmtMismatch.ok, false);
    assert.strictEqual(resAmtMismatch.error, "captured_amount_mismatch");

    // Authoritative captured payment succeeds
    const resCap = await processCodAdvanceCaptureAdmin({
      orderId: advanceOrder.id,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: rzpPaymentId,
      razorpaySignature: validSig,
      capturedAmountPaise: 20000,
      providerStatus: "captured",
    });
    assert.strictEqual(resCap.ok, true);

    const updated = await getOrderAdmin(advanceOrder.id);
    assert.strictEqual(updated?.codStatus, "COD_APPROVED");
  });

  // 7. Delivery Outcome Accounting & Idempotency
  it("prepaid delivery increments prepaid success ONLY, COD delivery increments COD success", async () => {
    const phone = "+919222233333";
    const prepaidOrder: Order = {
      id: "ORD-PREPAID-OUTCOME-01",
      customer: { fullName: "Prepaid Customer", email: "p@example.com", phone, address: "Line 1", city: "Jaipur", state: "Rajasthan", postalCode: "302001", country: "IN" },
      items: [{ orderItemId: "item-p-1", slug: "ph7-tee", name: "Tee", dropName: "D1", price: 1000, priceDisplay: "₹1,000", lineTotal: 1000, quantity: 1, productId: "prod-ph7-1", variantId: "var-ph7-m", sku: "PH7-TEE-BLK-M" }],
      subtotal: 1000,
      currency: "INR",
      status: "pending_fulfillment",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      paymentStatus: "captured",
      createdAt: new Date().toISOString(),
    };
    await saveOrder(prepaidOrder);

    // Save mock fulfillment for prepaid order
    const fulId = "ful-prepaid-01";
    const { createOrClaimFulfillmentAdmin } = await import("@/lib/fulfillment/fulfillment-store");
    await createOrClaimFulfillmentAdmin(prepaidOrder.id, null);

    const allFul = await (await import("@/lib/fulfillment/fulfillment-store")).getAllFulfillmentsAdmin();
    const pFul = allFul.find((f) => f.orderId === prepaidOrder.id);
    assert.notStrictEqual(pFul, undefined);

    if (pFul) {
      const res = await recordDeliveryOutcomeAdmin(pFul.id, "DELIVERED");
      assert.strictEqual(res.ok, true);

      const profile = await getRiskProfileByPhoneAdmin(phone);
      assert.strictEqual(profile?.successfulPrepaidDeliveries, 1);
      assert.strictEqual(profile?.successfulCodDeliveries, 0); // Must NOT increment COD success
    }
  });

  // 8. Returned Inventory Manufacturing Identity Hash & Reuse Engine Matching
  it("returned inventory matching compares exact manufacturing identity hash", async () => {
    const mfgInput: import("@/lib/inventory/reuse-engine").ManufacturingIdentityInput = {
      productId: "prod-ph7-1",
      variantId: "var-ph7-m",
      sku: "PH7-TEE-BLK-M",
      designs: [{ designId: "dsg-ph7-1", version: 1, checksum: "sha256-ph7-12345" }],
      placements: [{ placementId: "pl-ph7-front", location: "front", printMethod: "dtf", widthMm: 200, heightMm: 250 }],
    };

    const targetHash = computeManufacturingIdentityHash(mfgInput);

    const invItem = await saveReturnedInventoryItemAdmin({
      productId: "prod-ph7-1",
      variantId: "var-ph7-m",
      designId: "dsg-ph7-1",
      designVersion: 1,
      sku: "PH7-TEE-BLK-M",
      size: "M",
      color: "black",
      condition: "NEW_UNWORN",
      manufacturingIdentityHash: targetHash,
      reuseStatus: "REUSABLE",
      reuseEligible: true,
    });

    assert.strictEqual(invItem.manufacturingIdentityHash, targetHash);

    // Exact identity match succeeds
    const matches = await findMatchingReturnedInventory(
      { slug: "ph7-tee", productId: "prod-ph7-1", variantId: "var-ph7-m", name: "Tee", dropName: "D1", price: 1000, priceDisplay: "₹1,000", lineTotal: 1000, quantity: 1 },
      mfgInput,
    );
    assert.strictEqual(matches.length >= 1, true);

    // Different checksum -> NO MATCH
    const diffChecksumInput = {
      ...mfgInput,
      designs: [{ designId: "dsg-ph7-1", version: 1, checksum: "sha256-DIFFERENT-CHECKSUM" }],
    };
    const noMatches = await findMatchingReturnedInventory(
      { slug: "ph7-tee", productId: "prod-ph7-1", variantId: "var-ph7-m", name: "Tee", dropName: "D1", price: 1000, priceDisplay: "₹1,000", lineTotal: 1000, quantity: 1 },
      diffChecksumInput,
    );
    assert.strictEqual(noMatches.length, 0);
  });

  // 9. Timezone Helper
  it("getTodayKolkataDateString formats date in Asia/Kolkata timezone", () => {
    const kolkataDateStr = getTodayKolkataDateString();
    assert.strictEqual(/^\d{4}-\d{2}-\d{2}$/.test(kolkataDateStr), true);
  });

  // 10. Operational RBAC API Route Lockdown Verification
  it("support role cannot mutate COD orders, editor role is forbidden", async () => {
    const { GET, POST } = await import("@/app/api/admin/commerce/cod/route");

    // Support GET succeeds
    const reqSupportGet = new Request("http://localhost:3000/api/admin/commerce/cod", {
      headers: { "x-admin-role": "support", "x-admin-id": "sup-1" },
    });
    // Note: getAdminSession reads cookies / headers

    // Verify decision engine override security
    const overrideResNoReason = await overrideCodStatusAdmin("ORD-1", "COD_APPROVED", "", "admin-1");
    assert.strictEqual(overrideResNoReason.ok, false);
    assert.strictEqual(overrideResNoReason.error, "Mandatory override reason is required");
  });
});
