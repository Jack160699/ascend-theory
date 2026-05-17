import type { FulfillmentAdapter, FulfillmentResult } from "./types";
import type { Order } from "@/lib/orders/types";

/**
 * Shopify Admin API stub — set `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_ADMIN_TOKEN`.
 */
export class ShopifyFulfillmentAdapter implements FulfillmentAdapter {
  readonly provider = "shopify" as const;

  async submitOrder(order: Order): Promise<FulfillmentResult> {
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const token = process.env.SHOPIFY_ADMIN_TOKEN;
    if (!domain || !token) {
      return {
        provider: "shopify",
        status: "failed",
        message: "Shopify credentials not configured",
      };
    }

    // TODO: Create draft order via Admin API GraphQL/REST.
    console.info("[fulfillment:shopify] queued", order.id, domain);

    return {
      provider: "shopify",
      status: "queued",
      message: "Awaiting Shopify Admin API integration",
    };
  }
}
