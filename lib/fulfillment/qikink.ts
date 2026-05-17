import type { FulfillmentAdapter, FulfillmentResult } from "./types";
import type { Order } from "@/lib/orders/types";

/**
 * Qikink fulfillment stub — wire `QIKINK_API_KEY` and implement per their API docs.
 * @see https://qikink.com/
 */
export class QikinkFulfillmentAdapter implements FulfillmentAdapter {
  readonly provider = "qikink" as const;

  async submitOrder(order: Order): Promise<FulfillmentResult> {
    const apiKey = process.env.QIKINK_API_KEY;
    if (!apiKey) {
      return {
        provider: "qikink",
        status: "failed",
        message: "QIKINK_API_KEY not configured",
      };
    }

    // TODO: POST to Qikink order API when credentials and SKU mapping are ready.
    console.info("[fulfillment:qikink] queued", order.id);

    return {
      provider: "qikink",
      status: "queued",
      message: "Awaiting Qikink API integration",
    };
  }
}
