import { describe, it } from "node:test";
import assert from "node:assert";
import { validateRedirectUrl, hasPermission, hasMinimumRole } from "../../admin/auth-shared.js";
import { saveOrder } from "../../orders/store.js";
import type { Order } from "../../orders/types.js";

describe("Phase 2 Security & Auth Tests", () => {
  it("rejects open redirects and unsafe external target URLs", () => {
    assert.strictEqual(validateRedirectUrl("/admin/commerce/orders"), "/admin/commerce/orders");
    assert.strictEqual(validateRedirectUrl("https://evil.com"), "/admin");
    assert.strictEqual(validateRedirectUrl("//evil.com/admin"), "/admin");
    assert.strictEqual(validateRedirectUrl("javascript:alert(1)"), "/admin");
    assert.strictEqual(validateRedirectUrl("http://attacker.com/admin"), "/admin");
    assert.strictEqual(validateRedirectUrl(null), "/admin");
    assert.strictEqual(validateRedirectUrl(undefined), "/admin");
  });

  it("enforces role hierarchy and permissions correctly", () => {
    assert.strictEqual(hasMinimumRole("owner", "admin"), true);
    assert.strictEqual(hasMinimumRole("editor", "admin"), false);
    assert.strictEqual(hasMinimumRole("support", "editor"), false);

    assert.strictEqual(hasPermission("owner", "system", "delete"), true);
    assert.strictEqual(hasPermission("admin", "system", "delete"), false);
    assert.strictEqual(hasPermission("editor", "journal", "write"), true);
    assert.strictEqual(hasPermission("support", "commerce", "read"), true);
    assert.strictEqual(hasPermission("support", "system", "read"), false);
  });

  it("refuses insecure file/tmp order fallback in production mode when Supabase is missing", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const testOrder: Order = {
      id: "TEST-ORD-9999",
      createdAt: new Date().toISOString(),
      status: "pending_payment",
      paymentMethod: "online",
      paymentProvider: "razorpay",
      currency: "INR",
      subtotal: 1000,
      items: [],
      customer: {
        fullName: "Test Customer",
        email: "test@example.com",
        phone: "+919999999999",
        address: "123 Sovereign Way",
        city: "Mumbai",
        postalCode: "400001",
        country: "IN",
      },
    };

    try {
      await assert.rejects(
        async () => {
          await saveOrder(testOrder);
        },
        (err: Error) => {
          return err.message.includes("Insecure file/memory fallback is prohibited in production");
        }
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
