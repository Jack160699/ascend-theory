/**
 * Phase 6 — Qikink POD Provider Adapter
 * Implements PODFulfillmentProvider for Qikink manufacturing integration.
 * Transport is DISABLED by default (QIKINK_FULFILLMENT_ENABLED=false) until
 * exact official Qikink API documentation and merchant credentials are provided.
 */

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import type {
  PODFulfillmentProvider,
  ProviderCapabilityModel,
  FulfillmentSnapshot,
  ProviderOrderSubmissionResult,
  ProviderOrderLookupResult,
  ProviderBalanceResult,
  FulfillmentStatus,
} from "./types";
import { QikinkMockTransport } from "./qikink-mock";

export function redactSecrets<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data === "string") {
    if (data.includes("token=") || data.includes("Signature=")) {
      return data.replace(/(\?|&)(token|Signature|apiKey|secret)=[^&]+/gi, "$1$2=[REDACTED]") as unknown as T;
    }
    return data;
  }
  if (typeof data !== "object") return data;
  if (Array.isArray(data)) {
    return data.map((item) => redactSecrets(item)) as unknown as T;
  }

  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("key") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("token") ||
      lowerKey.includes("auth") ||
      lowerKey.includes("password") ||
      lowerKey.includes("signature")
    ) {
      redacted[key] = "[REDACTED]";
    } else {
      redacted[key] = redactSecrets(value);
    }
  }
  return redacted as T;
}

export class QikinkFulfillmentAdapter implements PODFulfillmentProvider {
  readonly providerSlug = "qikink" as const;
  readonly capabilities: ProviderCapabilityModel = {
    submitOrder: true,
    orderLookup: true,
    cancellation: false,
    walletBalance: true,
    webhookStatus: false,
    pollingStatus: true,
  };

  private mockTransport?: QikinkMockTransport;

  constructor(mockTransport?: QikinkMockTransport) {
    this.mockTransport = mockTransport;
  }

  validateConfiguration(): { isValid: boolean; error?: string } {
    const enabled = process.env.QIKINK_FULFILLMENT_ENABLED === "true";
    if (!enabled) {
      return {
        isValid: false,
        error: "QIKINK_FULFILLMENT_ENABLED is set to false (Production transport disabled by safety guard)",
      };
    }
    const apiKey = process.env.QIKINK_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      return { isValid: false, error: "QIKINK_API_KEY environment variable is not configured" };
    }
    return { isValid: true };
  }

  async submitOrder(snapshot: FulfillmentSnapshot): Promise<ProviderOrderSubmissionResult> {
    // 1. Check if mock transport is explicitly provided (for unit testing)
    if (this.mockTransport) {
      return this.mockTransport.submitOrder(snapshot);
    }

    // 2. Validate configuration safety guard (Req #41)
    const configCheck = this.validateConfiguration();
    if (!configCheck.isValid) {
      return {
        success: false,
        normalizedStatus: "FAILED",
        errorCode: "QIKINK_FULFILLMENT_DISABLED",
        errorMessage: configCheck.error || "Qikink fulfillment disabled",
      };
    }

    // 3. Generate transient time-limited signed URL for private artwork (Req #16)
    const activePlacements = await Promise.all(
      snapshot.placements.map(async (pl) => {
        let signedUrl: string | undefined = undefined;
        if (pl.storagePath && hasSupabaseConfig()) {
          const serviceClient = createSupabaseServiceClient();
          if (serviceClient) {
            const { data } = await serviceClient.storage
              .from("design-artwork")
              .createSignedUrl(pl.storagePath, 3600);
            signedUrl = data?.signedUrl || undefined;
          }
        }
        return {
          ...pl,
          transientSignedUrl: signedUrl,
        };
      }),
    );

    // Unverified API Contract Safety Lock: Return QIKINK_API_CONTRACT_UNVERIFIED response
    return {
      success: false,
      normalizedStatus: "FAILED",
      errorCode: "QIKINK_API_CONTRACT_UNVERIFIED",
      errorMessage: "Exact official Qikink API documentation/merchant credentials not verified. External network calls remain locked.",
      rawResponse: redactSecrets({
        snapshot_summary: {
          orderId: snapshot.orderId,
          ascendSku: snapshot.ascendSku,
          providerExternalSku: snapshot.providerExternalSku,
          placementsCount: activePlacements.length,
        },
      }),
    };
  }

  async getOrder(providerOrderId: string, merchantReference?: string): Promise<ProviderOrderLookupResult> {
    if (this.mockTransport) {
      return this.mockTransport.getOrder(providerOrderId, merchantReference);
    }
    const configCheck = this.validateConfiguration();
    if (!configCheck.isValid) {
      return { found: false };
    }
    return { found: false };
  }

  async getBalance(): Promise<ProviderBalanceResult> {
    if (this.mockTransport) {
      return this.mockTransport.getBalance();
    }
    return {
      supported: true,
      message: "Qikink wallet balance inquiry requires verified merchant API credentials.",
    };
  }

  normalizeStatus(rawStatus: string): FulfillmentStatus {
    if (!rawStatus) return "PROCESSING";
    const s = rawStatus.toUpperCase().trim();
    switch (s) {
      case "LIVE":
      case "PRINTING":
      case "PROCESSING":
      case "IN_PRODUCTION":
        return "PROCESSING";
      case "LIVE-OOS":
      case "OUT_OF_STOCK":
      case "OOS":
        return "OUT_OF_STOCK";
      case "ACTION_REQUIRED":
      case "ACTION REQUIRED":
      case "ATTENTION":
        return "ACTION_REQUIRED";
      case "MANIFESTED":
      case "PACKED":
      case "READY_TO_SHIP":
        return "MANIFESTED";
      case "IN_TRANSIT":
      case "DISPATCHED":
      case "SHIPPED":
        return "IN_TRANSIT";
      case "DELIVERED":
      case "COMPLETED":
        return "DELIVERED";
      case "RTO":
      case "RTO_INITIATED":
      case "RETURN_TO_ORIGIN":
        return "RTO_INITIATED";
      case "RETURNED":
        return "RETURNED";
      case "CANCELLED":
      case "CANCELED":
        return "CANCELLED";
      case "FAILED":
      case "REJECTED":
        return "FAILED";
      default:
        return "PROCESSING";
    }
  }

  async healthCheck(): Promise<{ ok: boolean; message?: string }> {
    const config = this.validateConfiguration();
    if (!config.isValid) {
      return { ok: false, message: config.error };
    }
    return { ok: true, message: "Qikink adapter ready (disabled by safety guard)" };
  }
}
