import { ManualFulfillmentAdapter } from "./manual";
import { QikinkFulfillmentAdapter } from "./qikink";
import { ShopifyFulfillmentAdapter } from "./shopify";
import type { FulfillmentAdapter, FulfillmentProvider } from "./types";
import type { Order } from "@/lib/orders/types";

export function getFulfillmentAdapter(
  provider?: FulfillmentProvider,
): FulfillmentAdapter {
  switch (provider) {
    case "qikink":
      return new QikinkFulfillmentAdapter();
    case "shopify":
      return new ShopifyFulfillmentAdapter();
    default:
      return new ManualFulfillmentAdapter();
  }
}

export async function submitOrderForFulfillment(order: Order) {
  if (order.status === "refunded") {
    throw new Error(`Cannot submit refunded order ${order.id} for fulfillment.`);
  }

  if (order.status === "pending_payment" && order.paymentMethod === "online") {
    throw new Error(`Cannot submit unpaid order ${order.id} for fulfillment.`);
  }

  if (order.fulfillment?.externalId && order.fulfillment.provider !== "manual") {
    return {
      success: true,
      provider: order.fulfillment.provider,
      externalId: order.fulfillment.externalId,
      message: "Order already submitted for fulfillment.",
    };
  }

  const provider =
    order.fulfillment?.provider ??
    (process.env.FULFILLMENT_PROVIDER as FulfillmentProvider | undefined) ??
    "manual";

  const adapter = getFulfillmentAdapter(provider);
  const result = await adapter.submitOrder(order);
  return result;
}

export type { FulfillmentAdapter, FulfillmentResult } from "./types";
