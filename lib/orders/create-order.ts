import { createPaymentSession, getAvailablePaymentProviders } from "@/lib/payments";
import { buildOrderFromInputAsync } from "./build-order";
import { saveOrder } from "./store";
import type { CreateOrderInput, CreateOrderResult } from "./types";

export async function createOrder(
  input: CreateOrderInput,
  origin: string,
): Promise<
  | { ok: true; data: CreateOrderResult }
  | { ok: false; error: string; status: number }
> {
  const built = await buildOrderFromInputAsync(input);
  if (!built.ok) {
    return { ok: false, error: built.error, status: 400 };
  }

  let order = built.order;

  if (order.paymentMethod === "online") {
    const providers = getAvailablePaymentProviders();
    if (providers.length === 0) {
      return {
        ok: false,
        error:
          "Online payment is not configured. Choose Cash on Delivery or contact support.",
        status: 503,
      };
    }
    if (
      order.paymentProvider !== "none" &&
      !providers.includes(order.paymentProvider as "stripe" | "razorpay")
    ) {
      order = {
        ...order,
        paymentProvider: providers[0]!,
      };
    }
  }

  await saveOrder(order);

  // Requirement #9 & #13: COD checkout MUST start in COD_PENDING_CONFIRMATION state and generate a confirmation token.
  // DOES NOT claim/create/submit fulfillment or auto-approve until explicit server risk decision workflow.
  if (order.paymentMethod === "cod") {
    const { randomBytes, createHash } = await import("node:crypto");
    const confirmationToken = randomBytes(32).toString("hex");
    const codConfirmationTokenHash = createHash("sha256").update(confirmationToken).digest("hex");

    order = {
      ...order,
      codStatus: "COD_PENDING_CONFIRMATION",
      codConfirmationTokenHash,
      advanceRequired: false,
      advanceAmountPaise: 0,
      advanceStatus: "none" as import("@/lib/cod/types").AdvanceStatus,
    };

    await saveOrder(order);

    return {
      ok: true,
      data: {
        order,
        confirmationToken,
      },
    };
  }

  const payment = await createPaymentSession(order, origin);
  if (!payment) {
    return {
      ok: false,
      error: "Could not start payment session. Try again or use Cash on Delivery.",
      status: 502,
    };
  }

  order = {
    ...order,
    paymentReference: payment.paymentReference,
  };
  await saveOrder(order);

  return {
    ok: true,
    data: {
      order,
      paymentUrl: payment.paymentUrl,
    },
  };
}

/**
 * @deprecated Unauthenticated order status mutation is prohibited.
 * Use verifyRazorpayCheckoutCallback or handleRazorpayWebhook for payment verification.
 */
export async function confirmOrderPaid(orderId: string): Promise<void> {
  const { getOrder } = await import("./store");
  const order = await getOrder(orderId);
  if (!order) return;

  // Unauthenticated browser navigation cannot mark order paid
  if (order.status !== "paid") {
    throw new Error(
      `Cannot confirm order ${orderId} as paid without verified provider signature.`
    );
  }
}
