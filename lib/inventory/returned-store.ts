/**
 * Phase 7 — Authoritative Returned Inventory Store & Concurrency Manager (Requirements #22, #23, #25, #26)
 * Tracks physical returned items with exact manufactured identity (designId, designVersion, checksum).
 * Provides atomic row-locking reservation via FOR UPDATE SKIP LOCKED.
 */

import crypto from "node:crypto";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { ReturnedInventoryItem, ReuseStatus, GarmentCondition } from "@/lib/cod/types";

const memoryReturnedInventory = new Map<string, ReturnedInventoryItem>();

/**
 * Calculates current inventory item age in days.
 */
export function calculateAgeDays(receivedAt: string): number {
  const receivedMs = new Date(receivedAt).getTime();
  const nowMs = new Date().getTime();
  const diffDays = Math.floor((nowMs - receivedMs) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays : 0;
}

/**
 * Ageing bucket classification (Requirement #26)
 */
export function getAgeingBucket(ageDays: number): "0-7 days" | "8-30 days" | "31-60 days" | "60+ days" {
  if (ageDays <= 7) return "0-7 days";
  if (ageDays <= 30) return "8-30 days";
  if (ageDays <= 60) return "31-60 days";
  return "60+ days";
}

export async function saveReturnedInventoryItemAdmin(
  item: Partial<ReturnedInventoryItem> & {
    productId: string;
    variantId: string;
    designId: string;
    designVersion: number;
    sku: string;
  },
  adminId?: string | null,
): Promise<ReturnedInventoryItem> {
  const id = item.id || crypto.randomUUID();
  const nowIso = new Date().toISOString();
  const receivedAt = item.receivedAt || nowIso;
  const ageDays = calculateAgeDays(receivedAt);

  const fullRecord: ReturnedInventoryItem = {
    id,
    sourceOrderId: item.sourceOrderId,
    sourceOrderItemId: item.sourceOrderItemId,
    fulfillmentId: item.fulfillmentId,
    productId: item.productId,
    variantId: item.variantId,
    designId: item.designId,
    designVersion: item.designVersion,
    sku: item.sku,
    size: item.size,
    color: item.color,
    condition: item.condition || "NEW_UNWORN",
    receivedAt,
    ageDays,
    reuseStatus: item.reuseStatus || "REUSABLE",
    reuseEligible: item.reuseEligible ?? true,
    notes: item.notes,
    disposedAt: item.disposedAt,
    reusedAt: item.reusedAt,
    replacementOrderId: item.replacementOrderId,
    createdAt: item.createdAt || nowIso,
    updatedAt: nowIso,
  };

  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (supabase) {
      await supabase.from("returned_inventory").upsert({
        id: fullRecord.id,
        source_order_id: fullRecord.sourceOrderId,
        source_order_item_id: fullRecord.sourceOrderItemId,
        fulfillment_id: fullRecord.fulfillmentId,
        product_id: fullRecord.productId,
        variant_id: fullRecord.variantId,
        design_id: fullRecord.designId,
        design_version: fullRecord.designVersion,
        sku: fullRecord.sku,
        size: fullRecord.size,
        color: fullRecord.color,
        condition: fullRecord.condition,
        received_at: fullRecord.receivedAt,
        age_days: fullRecord.ageDays,
        reuse_status: fullRecord.reuseStatus,
        reuse_eligible: fullRecord.reuseEligible,
        notes: fullRecord.notes,
        disposed_at: fullRecord.disposedAt,
        reused_at: fullRecord.reusedAt,
        replacement_order_id: fullRecord.replacementOrderId,
        created_at: fullRecord.createdAt,
        updated_at: fullRecord.updatedAt,
      });

      if (adminId) {
        await supabase.from("audit_logs").insert({
          admin_id: adminId,
          action: "returned_inventory_saved",
          entity_type: "returned_inventory",
          entity_id: fullRecord.id,
          details_json: { sku: fullRecord.sku, reuse_status: fullRecord.reuseStatus },
        });
      }
    }
  }

  memoryReturnedInventory.set(id, fullRecord);
  return fullRecord;
}

export async function getAllReturnedInventoryAdmin(): Promise<ReturnedInventoryItem[]> {
  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (supabase) {
      const { data, error } = await supabase.from("returned_inventory").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        return data.map((d) => ({
          id: d.id,
          sourceOrderId: d.source_order_id,
          sourceOrderItemId: d.source_order_item_id,
          fulfillmentId: d.fulfillment_id,
          productId: d.product_id,
          variantId: d.variant_id,
          designId: d.design_id,
          designVersion: d.design_version,
          sku: d.sku,
          size: d.size,
          color: d.color,
          condition: d.condition as GarmentCondition,
          receivedAt: d.received_at,
          ageDays: calculateAgeDays(d.received_at),
          reuseStatus: d.reuse_status as ReuseStatus,
          reuseEligible: d.reuse_eligible,
          notes: d.notes,
          disposedAt: d.disposed_at,
          reusedAt: d.reused_at,
          replacementOrderId: d.replacement_order_id,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    }
  }

  return Array.from(memoryReturnedInventory.values()).map((item) => ({
    ...item,
    ageDays: calculateAgeDays(item.receivedAt),
  }));
}

/**
 * Atomic Returned Inventory Reservation with FOR UPDATE SKIP LOCKED (Requirement #25)
 */
export async function reserveReturnedInventoryAdmin(
  inventoryId: string,
  replacementOrderId: string,
  adminId?: string | null,
): Promise<{ ok: true; item: ReturnedInventoryItem } | { ok: false; error: string }> {
  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return { ok: false, error: "Supabase service client unconfigured" };
    }

    const { data: rpcData, error: rpcErr } = await supabase.rpc("reserve_returned_inventory_with_audit", {
      p_inventory_id: inventoryId,
      p_replacement_order_id: replacementOrderId,
      p_admin_id: adminId || null,
    });

    if (rpcErr || !rpcData || !(rpcData as { ok?: boolean }).ok) {
      const errStr = (rpcData as { error?: string })?.error || rpcErr?.message || "Reservation failed";
      return { ok: false, error: errStr };
    }

    const all = await getAllReturnedInventoryAdmin();
    const updated = all.find((i) => i.id === inventoryId);
    return updated ? { ok: true, item: updated } : { ok: false, error: "Item not found after reservation" };
  }

  // Memory fallback with atomic check
  const existing = memoryReturnedInventory.get(inventoryId);
  if (!existing) {
    return { ok: false, error: "inventory_unit_locked_or_not_found" };
  }

  if (existing.reuseStatus !== "REUSABLE" || !existing.reuseEligible) {
    return { ok: false, error: `inventory_not_reusable: current status is ${existing.reuseStatus}` };
  }

  existing.reuseStatus = "RESERVED";
  existing.replacementOrderId = replacementOrderId;
  existing.updatedAt = new Date().toISOString();
  memoryReturnedInventory.set(inventoryId, existing);

  return { ok: true, item: existing };
}
