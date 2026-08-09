/**
 * Phase 7 — Authoritative Returned Inventory Store & Concurrency Manager (Requirements #23, #24, #25, #26)
 * Tracks physical returned items with exact manufactured identity hash and snapshot.
 * Provides atomic row-locking reservation via FOR UPDATE SKIP LOCKED.
 * Fails closed on database errors when Supabase is configured.
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
  const nowMs = Date.now();
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
    manufacturingIdentityHash?: string;
  },
  adminId?: string | null,
): Promise<ReturnedInventoryItem> {
  const id = item.id || crypto.randomUUID();
  const nowIso = new Date().toISOString();
  const receivedAt = item.receivedAt || nowIso;
  const ageDays = calculateAgeDays(receivedAt);

  const defaultHash =
    item.manufacturingIdentityHash ||
    crypto
      .createHash("sha256")
      .update(`${item.productId}:${item.variantId}:${item.sku}:${item.designId}:${item.designVersion}`)
      .digest("hex");

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
    manufacturingIdentityHash: defaultHash,
    manufacturingSnapshotJson: item.manufacturingSnapshotJson || {},
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
    if (!supabase) {
      throw new Error("[ReturnedInventory] Supabase service role client unconfigured.");
    }

    const { error: upsertErr } = await supabase.from("returned_inventory").upsert({
      id: fullRecord.id,
      source_order_id: fullRecord.sourceOrderId || null,
      source_order_item_id: fullRecord.sourceOrderItemId || null,
      fulfillment_id: fullRecord.fulfillmentId || null,
      product_id: fullRecord.productId,
      variant_id: fullRecord.variantId,
      design_id: fullRecord.designId,
      design_version: fullRecord.designVersion,
      sku: fullRecord.sku,
      size: fullRecord.size || null,
      color: fullRecord.color || null,
      condition: fullRecord.condition,
      manufacturing_identity_hash: fullRecord.manufacturingIdentityHash,
      manufacturing_snapshot_json: fullRecord.manufacturingSnapshotJson || {},
      received_at: fullRecord.receivedAt,
      reuse_status: fullRecord.reuseStatus,
      reuse_eligible: fullRecord.reuseEligible,
      notes: fullRecord.notes || null,
      disposed_at: fullRecord.disposedAt || null,
      reused_at: fullRecord.reusedAt || null,
      replacement_order_id: fullRecord.replacementOrderId || null,
      created_at: fullRecord.createdAt,
      updated_at: fullRecord.updatedAt,
    });

    if (upsertErr) {
      console.error("[ReturnedInventory] DB error saving inventory item:", upsertErr);
      throw new Error(`Failed to save returned inventory to Supabase: ${upsertErr.message}`);
    }

    if (adminId) {
      const { error: auditErr } = await supabase.from("audit_logs").insert({
        admin_id: adminId,
        action: "returned_inventory_saved",
        entity_type: "returned_inventory",
        entity_id: fullRecord.id,
        details_json: { sku: fullRecord.sku, reuse_status: fullRecord.reuseStatus },
      });

      if (auditErr) {
        console.error("[ReturnedInventory] DB audit log insert error:", auditErr);
        throw new Error(`Failed to insert audit log to Supabase: ${auditErr.message}`);
      }
    }
  }

  memoryReturnedInventory.set(id, fullRecord);
  return fullRecord;
}

export async function getAllReturnedInventoryAdmin(): Promise<ReturnedInventoryItem[]> {
  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      throw new Error("[ReturnedInventory] Supabase service role client unconfigured.");
    }
    const { data, error } = await supabase
      .from("returned_inventory")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ReturnedInventory] DB error querying returned inventory:", error);
      throw new Error(`Failed to read returned inventory from Supabase: ${error.message}`);
    }

    return (data || []).map((d) => ({
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
      manufacturingIdentityHash: d.manufacturing_identity_hash || "",
      manufacturingSnapshotJson: d.manufacturing_snapshot_json || {},
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

  return Array.from(memoryReturnedInventory.values()).map((item) => ({
    ...item,
    ageDays: calculateAgeDays(item.receivedAt),
  }));
}

/**
 * Atomic Returned Inventory Reservation with FOR UPDATE SKIP LOCKED (Requirements #25 & #26)
 */
export async function reserveReturnedInventoryAdmin(
  inventoryId: string,
  replacementOrderId: string,
  adminId?: string | null,
  manufacturingHash?: string,
  orderItemId?: string,
): Promise<{ ok: true; item: ReturnedInventoryItem } | { ok: false; error: string }> {
  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (!supabase) {
      return { ok: false, error: "Supabase service client unconfigured" };
    }

    if (manufacturingHash && orderItemId) {
      const { data: rpcData, error: rpcErr } = await supabase.rpc(
        "reserve_matching_returned_inventory_with_audit",
        {
          p_order_id: replacementOrderId,
          p_order_item_id: orderItemId,
          p_manufacturing_hash: manufacturingHash,
          p_admin_id: adminId || null,
        },
      );

      if (rpcErr || !rpcData || !(rpcData as { ok?: boolean }).ok) {
        const errStr =
          (rpcData as { error?: string })?.error || rpcErr?.message || "Reservation failed";
        return { ok: false, error: errStr };
      }
    } else {
      // Direct ID fallback for admin manual allocation
      const { data: invRow, error: invErr } = await supabase
        .from("returned_inventory")
        .select("*")
        .eq("id", inventoryId)
        .single();

      if (invErr || !invRow) return { ok: false, error: "inventory_unit_not_found" };
      if (invRow.reuse_status !== "REUSABLE" || !invRow.reuse_eligible) {
        return { ok: false, error: `inventory_not_reusable: current status is ${invRow.reuse_status}` };
      }

      const { error: updateErr } = await supabase
        .from("returned_inventory")
        .update({
          reuse_status: "RESERVED",
          replacement_order_id: replacementOrderId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", inventoryId);

      if (updateErr) return { ok: false, error: updateErr.message };
    }

    const all = await getAllReturnedInventoryAdmin();
    const updated = all.find((i) => i.id === inventoryId || i.replacementOrderId === replacementOrderId);
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
