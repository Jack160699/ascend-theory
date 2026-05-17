import type { Order } from "@/lib/orders/types";

export type FulfillmentProvider = "qikink" | "shopify" | "manual";

export type FulfillmentResult = {
  provider: FulfillmentProvider;
  externalId?: string;
  status: "queued" | "submitted" | "failed";
  message?: string;
};

/** Adapter for external fulfillment systems (Qikink, Shopify, etc.) */
export interface FulfillmentAdapter {
  readonly provider: FulfillmentProvider;
  submitOrder(order: Order): Promise<FulfillmentResult>;
}
