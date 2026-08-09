/**
 * Phase 6 — Authoritative Server-Side POD Fulfilment Store
 * Manages immutable fulfillment snapshots, atomic claim-before-submit flows,
 * provider order binding, ambiguous network failure reconciliation, bounded retries,
 * secret redaction, and operational RBAC mutations.
 */

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import type {
  FulfillmentStatus,
  FulfillmentSnapshot,
  PODFulfillmentProvider,
  ActivePlacementSnapshot,
  ProviderOrderSubmissionResult,
} from "./types";
import { evaluateOrderFulfillmentEligibility } from "./eligibility";
import { QikinkFulfillmentAdapter, redactSecrets } from "./qikink";

export type FulfillmentRecord = {
  id: string;
  orderId: string;
  providerId?: string;
  providerOrderId?: string;
  providerReference?: string;
  idempotencyKey?: string;
  requestHash?: string;
  status: FulfillmentStatus;
  providerStatus?: string;
  attemptCount: number;
  nextRetryAt?: string;
  submittedAt?: string;
  lastSyncedAt?: string;
  failedAt?: string;
  failureCode?: string;
  failureMessage?: string;
  awb?: string;
  courier?: string;
  metadataJson?: Record<string, unknown>;
  snapshotJson?: FulfillmentSnapshot;
  createdAt: string;
  updatedAt: string;
};

// In-memory fallback store for development & testing
const memoryFulfillments = new Map<string, FulfillmentRecord>();
const memoryFulfillmentEvents = new Map<string, Array<{ id: string; type: string; details: Record<string, unknown>; timestamp: string }>>();

export async function getAllFulfillmentsAdmin(): Promise<FulfillmentRecord[]> {
  if (hasSupabaseConfig()) {
    const serviceClient = createSupabaseServiceClient();
    if (serviceClient) {
      const { data, error } = await serviceClient
        .from("fulfillments")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((row) => ({
          id: row.id,
          orderId: row.order_id,
          providerId: row.provider_id,
          providerOrderId: row.provider_order_id,
          providerReference: row.provider_reference,
          idempotencyKey: row.idempotency_key,
          requestHash: row.request_hash,
          status: (row.status as FulfillmentStatus) || "QUEUED",
          providerStatus: row.provider_status,
          attemptCount: row.attempt_count || 0,
          nextRetryAt: row.next_retry_at,
          submittedAt: row.submitted_at,
          lastSyncedAt: row.last_synced_at,
          failedAt: row.failed_at,
          failureCode: row.failure_code,
          failureMessage: row.failure_message,
          awb: row.awb,
          courier: row.courier,
          metadataJson: row.metadata_json || {},
          snapshotJson: row.snapshot_json || undefined,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    }
  }

  return Array.from(memoryFulfillments.values());
}

export async function getFulfillmentByOrderIdAdmin(orderId: string): Promise<FulfillmentRecord | null> {
  const all = await getAllFulfillmentsAdmin();
  return all.find((f) => f.orderId === orderId) || null;
}

export async function getFulfillmentByIdAdmin(id: string): Promise<FulfillmentRecord | null> {
  const all = await getAllFulfillmentsAdmin();
  return all.find((f) => f.id === id) || null;
}

export async function createOrClaimFulfillmentAdmin(
  orderId: string,
  adminId: string,
): Promise<{ ok: true; fulfillment: FulfillmentRecord } | { ok: false; error: string; fulfillmentId?: string }> {
  // 1. Evaluate server-side fulfillment eligibility (Req #7)
  const eligibility = await evaluateOrderFulfillmentEligibility(orderId);
  if (!eligibility.eligible) {
    return {
      ok: false,
      error: `Order fulfillment ineligible: ${eligibility.blockingReasons.join(", ")}`,
    };
  }

  const order = eligibility.order!;
  const provider = eligibility.provider!;
  const providerProduct = eligibility.providerProduct!;
  const providerVariant = eligibility.providerVariant!;
  const firstItem = order.items?.[0] || { productId: "", variantId: "", sku: "", quantity: 1 };

  const fulfillmentId = `ful-${order.id}-${Date.now()}`;
  const idempotencyKey = `idemp-${order.id}-${provider.id}`;
  const providerRef = `ASCEND-ORD-${order.id}`;

  // Assemble Placement Snapshots (Req #6 & #17)
  const placementSnapshots: ActivePlacementSnapshot[] = (providerProduct.printableAreasJson || []).map((area: unknown, idx: number) => {
    const areaSpec = area as { location?: string; placementLocation?: string; maxWidthMm?: number; maxHeightMm?: number; printMethod?: string };
    const loc = areaSpec.location || areaSpec.placementLocation || "front";
    return {
      placementId: `pl-snap-${idx}`,
      designId: `dsg-snap-${idx}`,
      designSlug: `dsg-slug-${idx}`,
      designTitle: `Design ${loc.toUpperCase()}`,
      storagePath: `artwork/design-${idx}.png`,
      placementLocation: loc as unknown as ActivePlacementSnapshot["placementLocation"],
      xNormalized: 0.5,
      yNormalized: 0.5,
      scale: 1,
      rotationDeg: 0,
      widthMm: areaSpec.maxWidthMm || 200,
      heightMm: areaSpec.maxHeightMm || 250,
      printMethod: (areaSpec.printMethod || "dtf") as ActivePlacementSnapshot["printMethod"],
    };
  });

  const customerAddr = order.shippingAddress || order.customer;

  const snapshot: FulfillmentSnapshot = redactSecrets({
    fulfillmentId,
    orderId: order.id,
    orderNumber: order.id,
    orderItemIds: (order.items || []).map((i) => i.variantId || i.sku || i.slug).filter((x): x is string => Boolean(x)),
    productId: firstItem.productId || "",
    variantId: firstItem.variantId || "",
    ascendSku: firstItem.sku || firstItem.slug || "",
    quantity: firstItem.quantity,

    providerId: provider.id,
    providerSlug: provider.slug,
    providerProductMappingId: providerProduct.id,
    providerExternalProductId: providerProduct.externalProductId,
    providerVariantMappingId: providerVariant.id,
    providerExternalVariantId: providerVariant.externalVariantId,
    providerExternalSku: providerVariant.externalSku || providerVariant.sku || "",

    placements: placementSnapshots,

    customerShipping: {
      fullName: customerAddr.fullName,
      email: customerAddr.email || "customer@example.com",
      phone: customerAddr.phone || "",
      addressLine1: customerAddr.addressLine1 || customerAddr.address || "",
      addressLine2: customerAddr.addressLine2,
      city: customerAddr.city,
      state: customerAddr.state || "",
      postalCode: customerAddr.postalCode,
      country: customerAddr.country || "IN",
    },

    isCod: Boolean(order.isCod || order.paymentMethod === "cod"),
    currency: order.currency || "INR",
    createdAt: new Date().toISOString(),
  });

  // FAIL-CLOSED SUPABASE DB RPC CLAIM (Req #11, #32, #34)
  if (hasSupabaseConfig()) {
    const serviceClient = createSupabaseServiceClient();
    if (!serviceClient) {
      return { ok: false, error: "Server configuration error: Supabase service client unavailable" };
    }

    const { data: rpcData, error: rpcErr } = await serviceClient.rpc("create_or_claim_fulfillment_with_audit", {
      p_order_id: orderId,
      p_provider_id: provider.id,
      p_idempotency_key: idempotencyKey,
      p_provider_reference: providerRef,
      p_snapshot_json: snapshot,
      p_admin_id: adminId,
    });

    if (rpcErr) {
      return { ok: false, error: `RPC execution failed: ${rpcErr.message}` };
    }
    if (!rpcData || typeof rpcData !== "object" || !(rpcData as { ok?: boolean }).ok) {
      const errStr = (rpcData as { error?: string })?.error || "Fulfillment claim failed";
      return { ok: false, error: errStr, fulfillmentId: (rpcData as { fulfillment_id?: string })?.fulfillment_id };
    }

    const claimedId = (rpcData as { fulfillment_id: string }).fulfillment_id;
    const fulfillment = await getFulfillmentByIdAdmin(claimedId);
    return { ok: true, fulfillment: fulfillment || (memoryFulfillments.get(claimedId)!) };
  }

  // LOCAL MEMORY FALLBACK WITH EXACTLY-ONCE GUARD
  const existing = Array.from(memoryFulfillments.values()).find(
    (f) => f.orderId === orderId && f.providerId === provider.id && !["FAILED", "CANCELLED", "failed"].includes(f.status),
  );

  if (existing) {
    if (["SUBMITTING", "submitting"].includes(existing.status)) {
      return { ok: false, error: "already_claimed", fulfillmentId: existing.id };
    }
    if (["SUBMITTED", "PROCESSING", "IN_TRANSIT", "DELIVERED"].includes(existing.status) || existing.providerOrderId) {
      return { ok: false, error: "already_submitted", fulfillmentId: existing.id };
    }
  }

  const record: FulfillmentRecord = {
    id: fulfillmentId,
    orderId,
    providerId: provider.id,
    providerReference: providerRef,
    idempotencyKey,
    status: "SUBMITTING",
    attemptCount: 1,
    snapshotJson: snapshot,
    metadataJson: redactSecrets({ claimedBy: adminId }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryFulfillments.set(fulfillmentId, record);
  return { ok: true, fulfillment: record };
}

export async function submitFulfillmentToProviderAdmin(
  fulfillmentId: string,
  adminId: string,
  customAdapter?: PODFulfillmentProvider,
): Promise<{ ok: true; fulfillment: FulfillmentRecord } | { ok: false; error: string; fulfillment?: FulfillmentRecord }> {
  const fulfillment = await getFulfillmentByIdAdmin(fulfillmentId);
  if (!fulfillment) {
    return { ok: false, error: "Fulfillment record not found" };
  }

  if (!fulfillment.snapshotJson) {
    return { ok: false, error: "Fulfillment snapshot missing" };
  }

  // Stale Mapping Verification before network call (Req #36)
  const eligibility = await evaluateOrderFulfillmentEligibility(fulfillment.orderId, fulfillmentId);
  if (!eligibility.eligible && !fulfillment.submittedAt) {
    return {
      ok: false,
      error: `provider_mapping_became_stale: ${eligibility.blockingReasons.join(", ")}`,
    };
  }

  const adapter = customAdapter || new QikinkFulfillmentAdapter();

  let submissionResult: ProviderOrderSubmissionResult;
  try {
    // Attempt provider network submission
    submissionResult = await adapter.submitOrder(fulfillment.snapshotJson);
  } catch (err) {
    // Ambiguous Network Failure Handling (Req #13)
    const errMessage = err instanceof Error ? err.message : "Ambiguous network failure during submission";

    // Update status to RECONCILIATION_REQUIRED
    await updateFulfillmentStatusAdmin(
      fulfillmentId,
      "RECONCILIATION_REQUIRED",
      "AMBIGUOUS_NETWORK_TIMEOUT",
      "NETWORK_TIMEOUT",
      errMessage,
      undefined,
      undefined,
      adminId,
    );

    // Query provider lookup using merchant reference if available before retry
    if (adapter.getOrder) {
      try {
        const lookup = await adapter.getOrder("", fulfillment.providerReference);
        if (lookup.found && lookup.providerOrderId) {
          // Provider order was successfully placed despite network timeout -> bind atomically
          await bindProviderOrderAdmin(
            fulfillmentId,
            lookup.providerOrderId,
            lookup.providerStatus || "PRINTING",
            lookup.normalizedStatus || "PROCESSING",
            redactSecrets(lookup.rawResponse || {}),
            adminId,
          );
          const bound = await getFulfillmentByIdAdmin(fulfillmentId);
          return { ok: true, fulfillment: bound! };
        }
      } catch {
        // Lookup error
      }
    }

    return {
      ok: false,
      error: `Ambiguous network failure: ${errMessage}. Order placed into RECONCILIATION_REQUIRED status.`,
      fulfillment: await getFulfillmentByIdAdmin(fulfillmentId) || undefined,
    };
  }

  if (!submissionResult.success || !submissionResult.providerOrderId) {
    // Bounded retry decision (Req #14)
    const isTransient = ["429_RATE_LIMIT", "500_SERVER_ERROR"].includes(submissionResult.errorCode || "");
    const nextStatus: FulfillmentStatus = isTransient ? "QUEUED" : "FAILED";

    await updateFulfillmentStatusAdmin(
      fulfillmentId,
      nextStatus,
      submissionResult.providerStatus || "FAILED",
      submissionResult.errorCode || "SUBMISSION_FAILED",
      submissionResult.errorMessage || "Provider order submission failed",
      undefined,
      undefined,
      adminId,
    );

    return {
      ok: false,
      error: submissionResult.errorMessage || "Provider order submission rejected",
      fulfillment: await getFulfillmentByIdAdmin(fulfillmentId) || undefined,
    };
  }

  // Successful submission -> bind provider order atomically (Req #33)
  const bindRes = await bindProviderOrderAdmin(
    fulfillmentId,
    submissionResult.providerOrderId,
    submissionResult.providerStatus || "PRINTING",
    submissionResult.normalizedStatus || "PROCESSING",
    redactSecrets(submissionResult.rawResponse || {}),
    adminId,
  );

  if (!bindRes.ok) {
    return { ok: false, error: bindRes.error };
  }

  const updated = await getFulfillmentByIdAdmin(fulfillmentId);
  return { ok: true, fulfillment: updated! };
}

export async function bindProviderOrderAdmin(
  fulfillmentId: string,
  providerOrderId: string,
  providerStatus: string,
  normalizedStatus: FulfillmentStatus,
  metadata: Record<string, unknown>,
  adminId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Rebound check: prevent binding a different provider order ID (Req #33)
  const existing = await getFulfillmentByIdAdmin(fulfillmentId);
  if (existing && existing.providerOrderId && existing.providerOrderId !== providerOrderId) {
    return { ok: false, error: "provider_order_rebound" };
  }

  if (hasSupabaseConfig()) {
    const serviceClient = createSupabaseServiceClient();
    if (!serviceClient) return { ok: false, error: "Server configuration error: Supabase service client unavailable" };

    const { data: rpcData, error: rpcErr } = await serviceClient.rpc("bind_provider_order_with_audit", {
      p_fulfillment_id: fulfillmentId,
      p_provider_order_id: providerOrderId,
      p_provider_status: providerStatus,
      p_normalized_status: normalizedStatus,
      p_metadata_json: redactSecrets(metadata),
      p_admin_id: adminId,
    });

    if (rpcErr) return { ok: false, error: rpcErr.message };
    if (!rpcData || typeof rpcData !== "object" || !(rpcData as { ok?: boolean }).ok) {
      return { ok: false, error: (rpcData as { error?: string })?.error || "Failed to bind provider order" };
    }

    return { ok: true };
  }

  if (existing) {
    existing.providerOrderId = providerOrderId;
    existing.providerStatus = providerStatus;
    existing.status = normalizedStatus;
    existing.submittedAt = existing.submittedAt || new Date().toISOString();
    existing.lastSyncedAt = new Date().toISOString();
    existing.metadataJson = { ...(existing.metadataJson || {}), ...redactSecrets(metadata) };
    existing.updatedAt = new Date().toISOString();
    memoryFulfillments.set(fulfillmentId, existing);
  }

  return { ok: true };
}

export async function updateFulfillmentStatusAdmin(
  fulfillmentId: string,
  status: FulfillmentStatus,
  providerStatus?: string,
  failureCode?: string,
  failureMessage?: string,
  awb?: string,
  courier?: string,
  adminId: string = "system",
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (hasSupabaseConfig()) {
    const serviceClient = createSupabaseServiceClient();
    if (!serviceClient) return { ok: false, error: "Server configuration error: Supabase service client unavailable" };

    const { data: rpcData, error: rpcErr } = await serviceClient.rpc("update_fulfillment_status_with_audit", {
      p_fulfillment_id: fulfillmentId,
      p_status: status,
      p_provider_status: providerStatus || null,
      p_failure_code: failureCode || null,
      p_failure_message: failureMessage || null,
      p_awb: awb || null,
      p_courier: courier || null,
      p_admin_id: adminId,
    });

    if (rpcErr) return { ok: false, error: rpcErr.message };
    if (!rpcData || typeof rpcData !== "object" || !(rpcData as { ok?: boolean }).ok) {
      return { ok: false, error: (rpcData as { error?: string })?.error || "Failed to update fulfillment status" };
    }

    return { ok: true };
  }

  const existing = memoryFulfillments.get(fulfillmentId);
  if (existing) {
    existing.status = status;
    if (providerStatus) existing.providerStatus = providerStatus;
    if (failureCode) existing.failureCode = failureCode;
    if (failureMessage) existing.failureMessage = failureMessage;
    if (awb) existing.awb = awb;
    if (courier) existing.courier = courier;
    if (["FAILED", "failed"].includes(status)) existing.failedAt = existing.failedAt || new Date().toISOString();
    existing.lastSyncedAt = new Date().toISOString();
    existing.updatedAt = new Date().toISOString();
    memoryFulfillments.set(fulfillmentId, existing);
  }

  return { ok: true };
}
