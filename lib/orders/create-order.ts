import { submitOrderForFulfillment } from "@/lib/fulfillment";
import { createPaymentSession, getAvailablePaymentProviders } from "@/lib/payments";
import { buildOrderFromInput } from "./build-order";
import { saveOrder, updateOrder } from "./store";
import type { CreateOrderInput, CreateOrderResult } from "./types";

export async function createOrder(
  input: CreateOrderInput,
  origin: string,
): Promise<
  | { ok: true; data: CreateOrderResult }
  | { ok: false; error: string; status: number }
> {
  const built = buildOrderFromInput(input);
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

  if (order.paymentMethod === "cod") {
    const fulfillment = await submitOrderForFulfillment(order);
    order = {
      ...order,
      fulfillment: {
        provider: fulfillment.provider,
        externalId: fulfillment.externalId,
      },
    };
    await saveOrder(order);

    return {
      ok: true,
      data: { order },
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

export async function confirmOrderPaid(orderId: string): Promise<void> {
  await updateOrder(orderId, { status: "paid" });
  const { getOrder } = await import("./store");
  const order = await getOrder(orderId);
  if (order) {
    await submitOrderForFulfillment({ ...order, status: "paid" });
  }
}
