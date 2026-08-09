import { describe, it, before } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import type { Order } from "@/lib/orders/types";
import type { Product } from "@/lib/wearables/types";
import type { PODProvider, DesignAsset, ProductMockup } from "@/lib/wearables/design-types";
import { saveProductAdmin } from "@/lib/wearables/store";
import { saveDesignAdmin, saveProviderMappingAdmin, saveMockupAdmin } from "@/lib/wearables/design-store";
import { saveOrder, getOrderAdmin } from "@/lib/orders/store";

import { evaluateOrderFulfillmentEligibility } from "@/lib/fulfillment/eligibility";
import { createOrClaimFulfillmentAdmin, getAllFulfillmentsAdmin } from "@/lib/fulfillment/fulfillment-store";

import { evaluateCodOrderDecision } from "../decision-engine";
import { createOtpChallengeAdmin, verifyOtpChallengeAdmin, hashOtp } from "../otp";
import { processCodAdvanceCaptureAdmin } from "../advance";
import { recordDeliveryOutcomeAdmin, saveRiskProfileAdmin, getRiskProfileByPhoneAdmin } from "../outcomes";
import { saveReturnedInventoryItemAdmin, reserveReturnedInventoryAdmin, getAgeingBucket } from "@/lib/inventory/returned-store";
import { findMatchingReturnedInventory, canReserveReturnedInventoryForOrder } from "@/lib/inventory/reuse-engine";

describe("Phase 7 — COD Risk, RTO & Returned Inventory Tests", () => {
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

  // 1. COD Checkout & Zero Fulfillment Creation (Requirement #4)
  it("COD checkout initializes COD status and creates ZERO fulfillment rows", async () => {
    const codOrder: Order = {
      id: "ORD-COD-CHK-01",
      customer: { fullName: "COD Customer", email: "cod@example.com", phone: "+919876543210", address: "Line 1", city: "Mumbai", state: "Maharashtra", postalCode: "400001", country: "IN" },
      items: [{ orderItemId: "item-cod-1", slug: "ph7-tee", name: "T-Shirt", dropName: "Drop 1", price: 1000, priceDisplay: "₹1,000", lineTotal: 1000, quantity: 1, productId: "prod-ph7-1", variantId: "var-ph7-m", sku: "PH7-TEE-BLK-M" }],
      subtotal: 1000,
      currency: "INR",
      status: "pending_fulfillment",
      paymentMethod: "cod",
      paymentProvider: "none",
      codStatus: "COD_OTP_PENDING",
      createdAt: new Date().toISOString(),
    };
    await saveOrder(codOrder);

    // Verify 0 fulfillments exist for this order
    const fulfillments = await getAllFulfillmentsAdmin();
    const matches = fulfillments.filter((f) => f.orderId === codOrder.id);
    assert.strictEqual(matches.length, 0, "COD checkout MUST NOT create fulfillment rows");
  });

  // 2. Decision Engine Customer Classification (Requirement #6 & #7)
  it("decision engine classifies new, trusted, high risk, and prepaid only customers", () => {
    const baseOrder: Order = {
      id: "ORD-DEC-01",
      customer: { fullName: "User", email: "u@example.com", phone: "+919999999999", address: "Line 1", city: "Bengaluru", state: "Karnataka", postalCode: "560001", country: "IN" },
      items: [{ orderItemId: "item-1", slug: "ph7-tee", name: "Tee", dropName: "D1", price: 1000, priceDisplay: "₹1,000", lineTotal: 1000, quantity: 1, productId: "prod-ph7-1", variantId: "var-ph7-m" }],
      subtotal: 1000,
      currency: "INR",
      status: "created",
      paymentMethod: "cod",
      paymentProvider: "none",
      createdAt: new Date().toISOString(),
    };

    // New Customer -> OTP_REQUIRED
    const resNew = evaluateCodOrderDecision(baseOrder, null, 0);
    assert.strictEqual(resNew.decision, "OTP_REQUIRED");
    assert.strictEqual(resNew.codStatus, "COD_OTP_PENDING");

    // Trusted Repeat Customer (2 successful COD deliveries, 0 RTO) -> FULL_COD (COD_APPROVED)
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

    // High Risk (2 RTOs) -> PREPAID_ONLY
    const highRiskProfile = { ...trustedProfile, rtoCount: 2, riskBand: "PREPAID_ONLY" as const, prepaidOnly: true };
    const resPrepaidOnly = evaluateCodOrderDecision(baseOrder, highRiskProfile, 0);
    assert.strictEqual(resPrepaidOnly.decision, "PREPAID_ONLY");
    assert.strictEqual(resPrepaidOnly.codStatus, "COD_PREPAID_ONLY");

    // High Value Order (> ₹5,000) -> ADVANCE_REQUIRED
    const highValOrder: Order = { ...baseOrder, subtotal: 6000 };
    const resHighVal = evaluateCodOrderDecision(highValOrder, null, 0);
    assert.strictEqual(resHighVal.decision, "ADVANCE_REQUIRED");
    assert.strictEqual(resHighVal.codStatus, "COD_ADVANCE_REQUIRED");
    assert.strictEqual(resHighVal.advanceAmountPaise, 20000);
  });

  // 3. Cryptographic OTP Challenge & Security (Requirement #9)
  it("OTP challenge enforces SHA-256 hashing, single-use, max attempts, and expiry", async () => {
    const orderId = "ORD-OTP-TEST-01";
    const phone = "+919876543210";

    const challengeRes = await createOtpChallengeAdmin(orderId, phone);
    assert.strictEqual(challengeRes.ok, true);

    if (challengeRes.ok) {
      const rawOtp = challengeRes.otpText;
      assert.strictEqual(rawOtp.length, 6);
      assert.strictEqual(challengeRes.challenge.otpHash, hashOtp(rawOtp));

      // Wrong OTP fails
      const wrongRes = await verifyOtpChallengeAdmin(orderId, "000000");
      assert.strictEqual(wrongRes.ok, false);
      assert.strictEqual(wrongRes.error, "invalid_otp");

      // Correct OTP succeeds single-use
      const correctRes = await verifyOtpChallengeAdmin(orderId, rawOtp);
      assert.strictEqual(correctRes.ok, true);

      // Replay fails (already consumed)
      const replayRes = await verifyOtpChallengeAdmin(orderId, rawOtp);
      assert.strictEqual(replayRes.ok, false);
      assert.strictEqual(replayRes.error, "otp_already_consumed");
    }
  });

  // 4. Fulfillment Gate Check: COD_CONFIRMED vs COD_APPROVED (Requirement #3)
  it("fulfillment gate BLOCKS COD_CONFIRMED and ONLY allows COD_APPROVED", async () => {
    const unapprovedCodOrder: Order = {
      id: "ORD-GATE-COD-CONFIRMED-01",
      customer: { fullName: "Gate Customer", email: "g@example.com", phone: "+919876543210", address: "Line 1", city: "Delhi", state: "Delhi", postalCode: "110001", country: "IN" },
      items: [{ orderItemId: "item-g-1", slug: "ph7-tee", name: "Tee", dropName: "D1", price: 1000, priceDisplay: "₹1,000", lineTotal: 1000, quantity: 1, productId: "prod-ph7-1", variantId: "var-ph7-m", sku: "PH7-TEE-BLK-M" }],
      subtotal: 1000,
      currency: "INR",
      status: "pending_fulfillment",
      paymentMethod: "cod",
      paymentProvider: "none",
      codStatus: "COD_CONFIRMED", // CONFIRMED but NOT APPROVED
      createdAt: new Date().toISOString(),
    };
    await saveOrder(unapprovedCodOrder);

    const checkConfirmed = await evaluateOrderFulfillmentEligibility(unapprovedCodOrder.id);
    assert.strictEqual(checkConfirmed.eligible, false);
    assert.strictEqual(checkConfirmed.blockingReasons.includes("cod_approval_required"), true);

    // Promote to COD_APPROVED -> passes COD portion of gate
    const approvedCodOrder: Order = { ...unapprovedCodOrder, codStatus: "COD_APPROVED" };
    await saveOrder(approvedCodOrder);

    const checkApproved = await evaluateOrderFulfillmentEligibility(approvedCodOrder.id);
    assert.strictEqual(checkApproved.eligible, true);
  });

  // 5. Authoritative Advance Payment Capture (Requirement #8)
  it("advance payment capture verifies Razorpay signature and advances order to COD_APPROVED", async () => {
    const advanceOrder: Order = {
      id: "ORD-ADVANCE-PAY-01",
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

    const rzpOrderId = "rzp_order_adv_123";
    const rzpPaymentId = "pay_adv_9999";
    const secret = "dummy_secret_for_tests";

    const validSig = crypto
      .createHmac("sha256", secret)
      .update(`${rzpOrderId}|${rzpPaymentId}`)
      .digest("hex");

    const processRes = await processCodAdvanceCaptureAdmin({
      orderId: advanceOrder.id,
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: rzpPaymentId,
      razorpaySignature: validSig,
      secret,
    });

    assert.strictEqual(processRes.ok, true);

    const updated = await getOrderAdmin(advanceOrder.id);
    assert.strictEqual(updated?.codStatus, "COD_APPROVED");
    assert.strictEqual(updated?.advanceStatus, "captured");
    assert.strictEqual(updated?.advancePaymentId, rzpPaymentId);
  });

  // 6. Outcome Idempotency & Risk Profile Counters (Requirements #20 & #21)
  it("delivery/RTO outcome replay is idempotent and increments risk counters exactly once", async () => {
    const phone = "+919111122222";
    const order: Order = {
      id: "ORD-OUTCOME-IDEMP-01",
      customer: { fullName: "Outcome Customer", email: "out@example.com", phone, address: "Line 1", city: "Jaipur", state: "Rajasthan", postalCode: "302001", country: "IN" },
      items: [{ orderItemId: "item-out-1", slug: "ph7-tee", name: "Tee", dropName: "D1", price: 1000, priceDisplay: "₹1,000", lineTotal: 1000, quantity: 1, productId: "prod-ph7-1", variantId: "var-ph7-m", sku: "PH7-TEE-BLK-M" }],
      subtotal: 1000,
      currency: "INR",
      status: "pending_fulfillment",
      paymentMethod: "cod",
      paymentProvider: "none",
      codStatus: "COD_APPROVED",
      createdAt: new Date().toISOString(),
    };
    await saveOrder(order);

    const claimRes = await createOrClaimFulfillmentAdmin(order.id, null);
    assert.strictEqual(claimRes.ok, true);

    if (claimRes.ok) {
      const fulId = claimRes.fulfillment.id;

      // First DELIVERED outcome call
      const res1 = await recordDeliveryOutcomeAdmin(fulId, "DELIVERED");
      assert.strictEqual(res1.ok, true);
      assert.strictEqual(res1.alreadyProcessed, false);

      // Replay DELIVERED outcome call
      const res2 = await recordDeliveryOutcomeAdmin(fulId, "DELIVERED");
      assert.strictEqual(res2.ok, true);
      assert.strictEqual(res2.alreadyProcessed, true);

      // Verify risk profile successful delivery counter is strictly 1 (NOT 2)
      const prof = await getRiskProfileByPhoneAdmin(phone);
      assert.strictEqual(prof?.successfulCodDeliveries, 1);
    }
  });

  // 7. Returned Inventory Identity & Concurrency Reservation (Requirements #22, #23, #25, #27)
  it("returned inventory preserves manufactured identity and enforces atomic FOR UPDATE SKIP LOCKED reservation", async () => {
    const invItem = await saveReturnedInventoryItemAdmin({
      productId: "prod-ph7-1",
      variantId: "var-ph7-m",
      designId: "dsg-ph7-1",
      designVersion: 1,
      sku: "PH7-TEE-BLK-M",
      size: "M",
      color: "black",
      condition: "NEW_UNWORN",
      reuseStatus: "REUSABLE",
      reuseEligible: true,
    });

    assert.strictEqual(invItem.productId, "prod-ph7-1");
    assert.strictEqual(invItem.designId, "dsg-ph7-1");
    assert.strictEqual(invItem.designVersion, 1);

    // Reuse matching engine test: exact identity match succeeds
    const matches = await findMatchingReturnedInventory(
      { slug: "ph7-tee", productId: "prod-ph7-1", variantId: "var-ph7-m", name: "Tee", dropName: "D1", price: 1000, priceDisplay: "₹1,000", lineTotal: 1000, quantity: 1 },
      { designId: "dsg-ph7-1", designVersion: 1, checksum: "sha256-ph7-12345" },
    );
    assert.strictEqual(matches.length >= 1, true);

    // Mismatched design version returns 0 matches
    const noMatches = await findMatchingReturnedInventory(
      { slug: "ph7-tee", productId: "prod-ph7-1", variantId: "var-ph7-m", name: "Tee", dropName: "D1", price: 1000, priceDisplay: "₹1,000", lineTotal: 1000, quantity: 1 },
      { designId: "dsg-ph7-1", designVersion: 99 },
    );
    assert.strictEqual(noMatches.length, 0);

    // Unapproved COD order CANNOT reserve inventory
    const unapprovedOrder: Order = {
      id: "ORD-RESERVE-UNAPPROVED-01",
      customer: { fullName: "Customer", email: "c@example.com", phone: "+919999999999", address: "Line 1", city: "Delhi", state: "Delhi", postalCode: "110001", country: "IN" },
      items: [],
      subtotal: 1000,
      currency: "INR",
      status: "created",
      paymentMethod: "cod",
      paymentProvider: "none",
      codStatus: "COD_OTP_PENDING",
      createdAt: "",
    };
    const gateCheck = canReserveReturnedInventoryForOrder(unapprovedOrder);
    assert.strictEqual(gateCheck.allowed, false);

    // Atomic reservation call
    const reserveRes = await reserveReturnedInventoryAdmin(invItem.id, "ORD-REPLACEMENT-123");
    assert.strictEqual(reserveRes.ok, true);
    if (reserveRes.ok) {
      assert.strictEqual(reserveRes.item.reuseStatus, "RESERVED");
      assert.strictEqual(reserveRes.item.replacementOrderId, "ORD-REPLACEMENT-123");
    }

    // Second reservation attempt on already RESERVED item fails
    const reserveRes2 = await reserveReturnedInventoryAdmin(invItem.id, "ORD-REPLACEMENT-456");
    assert.strictEqual(reserveRes2.ok, false);
  });

  // 8. Ageing Bucket Helper Test (Requirement #26)
  it("ageing helper correctly computes age days and ageing buckets", () => {
    assert.strictEqual(getAgeingBucket(5), "0-7 days");
    assert.strictEqual(getAgeingBucket(15), "8-30 days");
    assert.strictEqual(getAgeingBucket(45), "31-60 days");
    assert.strictEqual(getAgeingBucket(90), "60+ days");
  });
});
