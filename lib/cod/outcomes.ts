/**
 * Phase 7 — Authoritative Delivery Outcome & RTO Idempotency Manager (Requirements #20 & #21)
 * Idempotently records delivery/RTO outcomes and updates risk profiles without double-counting on status replays.
 */

import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getFulfillmentByIdAdmin } from "@/lib/fulfillment/fulfillment-store";
import { getOrderAdmin } from "@/lib/orders/store";
import { normalizePhone } from "./otp";
import type { CodRiskProfile } from "./types";

const memoryOutcomeEvents = new Set<string>(); // key: `fulId_outcomeType`
const memoryRiskProfiles = new Map<string, CodRiskProfile>(); // key: phoneNormalized

export async function recordDeliveryOutcomeAdmin(
  fulfillmentId: string,
  outcomeType: "DELIVERED" | "RTO" | "REFUSED" | "RETURNED",
  outcomeStatus: string = outcomeType,
): Promise<{ ok: true; alreadyProcessed: boolean } | { ok: false; error: string }> {
  const fulfillment = await getFulfillmentByIdAdmin(fulfillmentId);
  if (!fulfillment) {
    return { ok: false, error: "fulfillment_not_found" };
  }

  const order = await getOrderAdmin(fulfillment.orderId);
  const rawPhone = order?.customer?.phone || "";
  const phoneNormalized = normalizePhone(rawPhone);

  const eventKey = `${fulfillmentId}_${outcomeType}`;

  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return { ok: false, error: "Supabase service client unconfigured" };
    }

    const { data: rpcRes, error: rpcErr } = await supabase.rpc("record_delivery_outcome_with_audit", {
      p_fulfillment_id: fulfillmentId,
      p_order_id: fulfillment.orderId,
      p_outcome_type: outcomeType,
      p_outcome_status: outcomeStatus,
      p_phone_normalized: phoneNormalized,
      p_details_json: { provider_status: fulfillment.providerStatus },
    });

    if (rpcErr) {
      return { ok: false, error: `RPC error recording outcome: ${rpcErr.message}` };
    }

    const isAlready = Boolean((rpcRes as { already_processed?: boolean })?.already_processed);
    return { ok: true, alreadyProcessed: isAlready };
  }

  // Memory fallback for dev/testing
  if (memoryOutcomeEvents.has(eventKey)) {
    return { ok: true, alreadyProcessed: true };
  }

  memoryOutcomeEvents.add(eventKey);

  if (phoneNormalized) {
    const profile = memoryRiskProfiles.get(phoneNormalized) || {
      id: `prof-${Date.now()}`,
      phoneNormalized,
      successfulCodDeliveries: 0,
      successfulPrepaidDeliveries: 0,
      codOrders: 0,
      codConfirmedOrders: 0,
      rtoCount: 0,
      refusedCount: 0,
      cancelledAfterConfirmationCount: 0,
      riskScore: 0,
      riskBand: "NEW_CUSTOMER" as const,
      prepaidOnly: false,
      manualHold: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (outcomeType === "DELIVERED") {
      profile.successfulCodDeliveries += 1;
      profile.lastSuccessfulDeliveryAt = new Date().toISOString();
      if (profile.successfulCodDeliveries >= 2 && profile.rtoCount === 0) {
        profile.riskBand = "TRUSTED_REPEAT";
      }
    } else if (["RTO", "RETURNED", "REFUSED"].includes(outcomeType)) {
      profile.rtoCount += 1;
      profile.lastRtoAt = new Date().toISOString();
      if (profile.rtoCount >= 2) {
        profile.riskBand = "PREPAID_ONLY";
        profile.prepaidOnly = true;
      }
    }

    profile.updatedAt = new Date().toISOString();
    memoryRiskProfiles.set(phoneNormalized, profile);
  }

  return { ok: true, alreadyProcessed: false };
}

/**
 * Direct lookup helper for risk profile by phone.
 */
export async function getRiskProfileByPhoneAdmin(rawPhone: string): Promise<CodRiskProfile | null> {
  const phoneNormalized = normalizePhone(rawPhone);
  if (!phoneNormalized) return null;

  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (supabase) {
      const { data } = await supabase
        .from("cod_risk_profiles")
        .select("*")
        .eq("phone_normalized", phoneNormalized)
        .maybeSingle();

      if (data) {
        return {
          id: data.id,
          customerId: data.customer_id,
          phoneNormalized: data.phone_normalized,
          successfulCodDeliveries: data.successful_cod_deliveries,
          successfulPrepaidDeliveries: data.successful_prepaid_deliveries,
          codOrders: data.cod_orders,
          codConfirmedOrders: data.cod_confirmed_orders,
          rtoCount: data.rto_count,
          refusedCount: data.refused_count,
          cancelledAfterConfirmationCount: data.cancelled_after_confirmation_count,
          lastRtoAt: data.last_rto_at,
          lastSuccessfulDeliveryAt: data.last_successful_delivery_at,
          riskScore: data.risk_score,
          riskBand: data.risk_band,
          prepaidOnly: data.prepaid_only,
          manualHold: data.manual_hold,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }
  }

  return memoryRiskProfiles.get(phoneNormalized) || null;
}

/**
 * Updates/saves risk profile manually (for HQ admin override).
 */
export async function saveRiskProfileAdmin(profile: CodRiskProfile): Promise<void> {
  const phoneNormalized = normalizePhone(profile.phoneNormalized);
  const updatedProfile = { ...profile, phoneNormalized, updatedAt: new Date().toISOString() };

  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (supabase) {
      await supabase.from("cod_risk_profiles").upsert({
        id: updatedProfile.id,
        phone_normalized: phoneNormalized,
        successful_cod_deliveries: updatedProfile.successfulCodDeliveries,
        successful_prepaid_deliveries: updatedProfile.successfulPrepaidDeliveries,
        cod_orders: updatedProfile.codOrders,
        cod_confirmed_orders: updatedProfile.codConfirmedOrders,
        rto_count: updatedProfile.rtoCount,
        refused_count: updatedProfile.refusedCount,
        cancelled_after_confirmation_count: updatedProfile.cancelledAfterConfirmationCount,
        last_rto_at: updatedProfile.lastRtoAt,
        last_successful_delivery_at: updatedProfile.lastSuccessfulDeliveryAt,
        risk_score: updatedProfile.riskScore,
        risk_band: updatedProfile.riskBand,
        prepaid_only: updatedProfile.prepaidOnly,
        manual_hold: updatedProfile.manualHold,
        notes: updatedProfile.notes,
        updated_at: updatedProfile.updatedAt,
      });
    }
  }

  memoryRiskProfiles.set(phoneNormalized, updatedProfile);
}
