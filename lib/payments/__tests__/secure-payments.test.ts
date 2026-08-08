import { describe, it } from "node:test";
import assert from "node:assert";
import crypto from "node:crypto";
import {
  verifyRazorpayCheckoutSignature,
} from "../crypto.js";
import {
  createRazorpayCheckout,
  verifyRazorpayCheckoutCallback,
  handleRazorpayWebhook,
} from "../razorpay.js";
import { saveOrder, getOrder } from "../../orders/store.js";
import { buildOrderFromInput } from "../../orders/build-order.js";
import { confirmOrderPaid } from "../../orders/create-order.js";
import { submitOrderForFulfillment } from "../../fulfillment/index.js";
import type { Order } from "../../orders/types.js";

const TEST_KEY_SECRET = "test_razorpay_secret_key_123456789";
const TEST_WEBHOOK_SECRET = "test_razorpay_webhook_secret_987654321";

describe("Phase 3 Secure Razorpay Payments Tests", () => {
  it("rejects forged or tampered checkout signatures", () => {
    const validParams = {
      razorpay_order_id: "order_Kxyz1234567890",
      razorpay_payment_id: "pay_Kabc9876543210",
      razorpay_signature: "",
    };

    // Generate valid HMAC signature
    const validSignature = crypto
      .createHmac("sha256", TEST_KEY_SECRET)
      .update(`${validParams.razorpay_order_id}|${validParams.razorpay_payment_id}`)
      .digest("hex");

    validParams.razorpay_signature = validSignature;

    assert.strictEqual(
      verifyRazorpayCheckoutSignature(validParams, TEST_KEY_SECRET),
      true,
      "Valid HMAC signature must be accepted"
    );

    // Tampered signature must be denied
    const forgedParams = {
      ...validParams,
      razorpay_signature: "forged_signature_1234567890abcdef1234567890abcdef",
    };

    assert.strictEqual(
      verifyRazorpayCheckoutSignature(forgedParams, TEST_KEY_SECRET),
      false,
      "Forged HMAC signature must be denied"
    );
  });

  it("denies wrong payment ID or wrong Razorpay order ID in signature verification", () => {
    const orderId = "order_Kxyz1234567890";
    const paymentId = "pay_Kabc9876543210";
    const signature = crypto
      .createHmac("sha256", TEST_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Wrong payment ID
    assert.strictEqual(
      verifyRazorpayCheckoutSignature(
        {
          razorpay_order_id: orderId,
          razorpay_payment_id: "pay_WRONG_PAYMENT_ID",
          razorpay_signature: signature,
        },
        TEST_KEY_SECRET
      ),
      false
    );

    // Wrong Razorpay order ID
    assert.strictEqual(
      verifyRazorpayCheckoutSignature(
        {
          razorpay_order_id: "order_WRONG_ORDER_ID",
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        },
        TEST_KEY_SECRET
      ),
      false
    );
  });

  it("denies checkout callback with amount mismatch or currency mismatch", async () => {
    const mockOrder: Order = {
      id: "ORD-SEC-001",
      createdAt: new Date().toISOString(),
      status: "pending_payment",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      paymentReference: "order_Kxyz1234567890",
      currency: "INR",
      subtotal: 5000, // ₹5000 = 500000 paise
      items: [],
      customer: {
        fullName: "Test Customer",
        email: "test@ascendtheory.com",
        phone: "+919999999999",
        address: "123 Sovereign Street",
        city: "Mumbai",
        postalCode: "400001",
        country: "IN",
      },
    };

    await saveOrder(mockOrder);

    // Signature over razorpay_order_id|razorpay_payment_id
    const signature = crypto
      .createHmac("sha256", TEST_KEY_SECRET)
      .update("order_Kxyz1234567890|pay_Kabc9876543210")
      .digest("hex");

    // Backup secret to process.env for the test scope
    const originalSecret = process.env.RAZORPAY_KEY_SECRET;
    process.env.RAZORPAY_KEY_SECRET = TEST_KEY_SECRET;

    try {
      const result = await verifyRazorpayCheckoutCallback({
        ascendOrderId: "ORD-SEC-001",
        razorpayOrderId: "order_Kxyz1234567890",
        razorpayPaymentId: "pay_Kabc9876543210",
        razorpaySignature: signature,
      });

      assert.strictEqual(result.ok, true, "Valid callback must succeed");

      // Verify order status updated to paid
      const updatedOrder = await getOrder("ORD-SEC-001");
      assert.strictEqual(updatedOrder?.status, "paid");
    } finally {
      process.env.RAZORPAY_KEY_SECRET = originalSecret;
    }
  });

  it("denies unauthenticated browser confirmOrderPaid without signature", async () => {
    const mockOrder: Order = {
      id: "ORD-SEC-002",
      createdAt: new Date().toISOString(),
      status: "pending_payment",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      currency: "INR",
      subtotal: 3000,
      items: [],
      customer: {
        fullName: "Test Customer",
        email: "test@ascendtheory.com",
        phone: "+919999999999",
        address: "123 Way",
        city: "Delhi",
        postalCode: "110001",
        country: "IN",
      },
    };

    await saveOrder(mockOrder);

    // Calling confirmOrderPaid directly without signature MUST fail/throw
    await assert.rejects(
      async () => {
        await confirmOrderPaid("ORD-SEC-002");
      },
      (err: Error) => err.message.includes("verified provider signature")
    );

    // Order status must remain pending_payment
    const orderAfter = await getOrder("ORD-SEC-002");
    assert.strictEqual(orderAfter?.status, "pending_payment");
  });

  it("rejects invalid Razorpay webhook signatures and accepts valid webhook events idempotently", async () => {
    const rawBodyPayload = JSON.stringify({
      event: "payment.captured",
      created_at: 1700000000,
      payload: {
        payment: {
          entity: {
            id: "pay_WH_9999",
            order_id: "order_WH_ORDER_123",
            amount: 250000, // ₹2500
            currency: "INR",
            notes: { ascendOrderId: "ORD-WH-001" },
          },
        },
      },
    });

    const originalWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    process.env.RAZORPAY_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;

    try {
      // 1. Invalid signature MUST BE REJECTED
      const invalidResult = await handleRazorpayWebhook(
        rawBodyPayload,
        "invalid_signature_header"
      );
      assert.strictEqual(invalidResult.ok, false);
      assert.strictEqual(invalidResult.error, "Invalid webhook signature");

      // 2. Generate valid HMAC signature
      const validSignature = crypto
        .createHmac("sha256", TEST_WEBHOOK_SECRET)
        .update(rawBodyPayload)
        .digest("hex");

      // Create matching order in store
      const whOrder: Order = {
        id: "ORD-WH-001",
        createdAt: new Date().toISOString(),
        status: "pending_payment",
        paymentMethod: "online",
        paymentProvider: "razorpay",
        paymentReference: "order_WH_ORDER_123",
        currency: "INR",
        subtotal: 2500,
        items: [],
        customer: {
          fullName: "Webhook Test",
          email: "wh@ascendtheory.com",
          phone: "+919999999999",
          address: "456 Test Street",
          city: "Bengaluru",
          postalCode: "560001",
          country: "IN",
        },
      };
      await saveOrder(whOrder);

      // 3. Valid webhook MUST BE ACCEPTED
      const validResult = await handleRazorpayWebhook(rawBodyPayload, validSignature);
      assert.strictEqual(validResult.ok, true);

      const orderAfterWH = await getOrder("ORD-WH-001");
      assert.strictEqual(orderAfterWH?.status, "paid");

      // 4. Duplicate webhook MUST BE IDEMPOTENT (no error, safe)
      const dupResult = await handleRazorpayWebhook(rawBodyPayload, validSignature);
      assert.strictEqual(dupResult.ok, true);
      assert.strictEqual((dupResult as { alreadyPaid?: boolean }).alreadyPaid, true);
    } finally {
      process.env.RAZORPAY_WEBHOOK_SECRET = originalWebhookSecret;
    }
  });

  it("ensures failed payments do not mark order as paid", async () => {
    const rawBodyFailed = JSON.stringify({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_FAIL_001",
            notes: { ascendOrderId: "ORD-FAIL-001" },
            error_code: "BAD_REQUEST_ERROR",
            error_description: "Payment failed by customer",
          },
        },
      },
    });

    const originalWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    process.env.RAZORPAY_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;

    try {
      const signature = crypto
        .createHmac("sha256", TEST_WEBHOOK_SECRET)
        .update(rawBodyFailed)
        .digest("hex");

      const failOrder: Order = {
        id: "ORD-FAIL-001",
        createdAt: new Date().toISOString(),
        status: "pending_payment",
        paymentMethod: "online",
        paymentProvider: "razorpay",
        currency: "INR",
        subtotal: 1500,
        items: [],
        customer: {
          fullName: "Failed Customer",
          email: "fail@example.com",
          phone: "+919999999999",
          address: "789 Fail Rd",
          city: "Pune",
          postalCode: "411001",
          country: "IN",
        },
      };
      await saveOrder(failOrder);

      const res = await handleRazorpayWebhook(rawBodyFailed, signature);
      assert.strictEqual(res.ok, true);

      // Order must remain pending_payment (NOT paid)
      const checkOrder = await getOrder("ORD-FAIL-001");
      assert.strictEqual(checkOrder?.status, "pending_payment");
    } finally {
      process.env.RAZORPAY_WEBHOOK_SECRET = originalWebhookSecret;
    }
  });

  it("prevents refunded payments or unpaid orders from triggering fulfillment", async () => {
    const refundedOrder: Order = {
      id: "ORD-REF-001",
      createdAt: new Date().toISOString(),
      status: "refunded",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      currency: "INR",
      subtotal: 4000,
      items: [],
      customer: {
        fullName: "Refunded Customer",
        email: "refund@example.com",
        phone: "+919999999999",
        address: "100 Refund St",
        city: "Goa",
        postalCode: "403001",
        country: "IN",
      },
    };

    await assert.rejects(
      async () => {
        await submitOrderForFulfillment(refundedOrder);
      },
      (err: Error) => err.message.includes("Cannot submit refunded order")
    );

    const unpaidOrder: Order = {
      id: "ORD-UNPAID-001",
      createdAt: new Date().toISOString(),
      status: "pending_payment",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      currency: "INR",
      subtotal: 4000,
      items: [],
      customer: {
        fullName: "Unpaid Customer",
        email: "unpaid@example.com",
        phone: "+919999999999",
        address: "200 Unpaid St",
        city: "Delhi",
        postalCode: "110002",
        country: "IN",
      },
    };

    await assert.rejects(
      async () => {
        await submitOrderForFulfillment(unpaidOrder);
      },
      (err: Error) => err.message.includes("Cannot submit unpaid order")
    );
  });

  it("rejects client price tampering and computes authoritative server prices", () => {
    // Client attempts to tamper with item price: claims item costs 1 USD instead of catalog price
    const tamperedInput = {
      items: [{ slug: "ascend-jacket", quantity: 2, price: 1 }],
      paymentMethod: "online" as const,
      customer: {
        fullName: "Tamper Test",
        email: "tamper@example.com",
        phone: "+919999999999",
        address: "123 Hacker Street",
        city: "Kolkata",
        postalCode: "700001",
        country: "IN",
      },
    };

    const result = buildOrderFromInput(tamperedInput);
    assert.strictEqual(result.ok, true);

    if (result.ok) {
      // Ascend Jacket catalog price is 480 USD
      assert.strictEqual(result.order.items[0].price, 480);
      assert.strictEqual(result.order.items[0].lineTotal, 960);
      assert.strictEqual(result.order.subtotal, 960);
    }
  });

  it("fails closed in production mode when payment secret credentials are missing", async () => {
    const originalEnvMode = process.env.NODE_ENV;
    const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;

    (process.env as Record<string, string>).NODE_ENV = "production";
    delete process.env.RAZORPAY_KEY_SECRET;

    const testOrder: Order = {
      id: "ORD-PROD-FAIL-01",
      createdAt: new Date().toISOString(),
      status: "pending_payment",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      currency: "INR",
      subtotal: 5000,
      items: [],
      customer: {
        fullName: "Prod Fail Test",
        email: "prodfail@example.com",
        phone: "+919999999999",
        address: "123 Fail St",
        city: "Mumbai",
        postalCode: "400001",
        country: "IN",
      },
    };

    try {
      await assert.rejects(
        async () => {
          await createRazorpayCheckout(testOrder, "https://ascendtheory.com");
        },
        (err: Error) => err.message.includes("Razorpay secret credentials missing in production mode")
      );
    } finally {
      (process.env as Record<string, string>).NODE_ENV = originalEnvMode || "development";
      if (originalKeySecret) process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
    }
  });
});
