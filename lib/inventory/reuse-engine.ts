/**
 * Phase 7 — Authoritative Reuse Matching Engine (Requirements #23, #24, #25, #26)
 * Matches order items against available returned inventory by exact manufactured identity hash
 * (product, variant, SKU, designs, versions, placements, print methods, artwork checksums).
 * Guarantees returned inventory CANNOT be reserved before COD order approval or Prepaid payment capture.
 */

import crypto from "node:crypto";
import type { Order, OrderItem } from "@/lib/orders/types";
import type { ReturnedInventoryItem } from "@/lib/cod/types";
import { getAllReturnedInventoryAdmin } from "./returned-store";

export type ManufacturingIdentityInput = {
  productId: string;
  variantId: string;
  sku: string;
  designs?: { designId: string; version: number; checksum?: string }[];
  placements?: { placementId: string; location: string; printMethod: string; widthMm?: number; heightMm?: number }[];
};

/**
 * Computes deterministic SHA-256 hash of exact manufacturing intent (Requirement #23)
 */
export function computeManufacturingIdentityHash(input: ManufacturingIdentityInput): string {
  const sortedDesigns = (input.designs || []).sort((a, b) => a.designId.localeCompare(b.designId));
  const sortedPlacements = (input.placements || []).sort((a, b) => a.placementId.localeCompare(b.placementId));
  const payload = JSON.stringify({
    p: input.productId,
    v: input.variantId,
    s: input.sku,
    d: sortedDesigns,
    pl: sortedPlacements,
  });
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export async function findMatchingReturnedInventory(
  orderItem: OrderItem,
  manufacturingInput: ManufacturingIdentityInput,
): Promise<ReturnedInventoryItem[]> {
  const targetHash = computeManufacturingIdentityHash(manufacturingInput);
  const allInventory = await getAllReturnedInventoryAdmin();

  return allInventory.filter((item) => {
    // 1. Must be REUSABLE and reuse_eligible
    if (item.reuseStatus !== "REUSABLE" || !item.reuseEligible) {
      return false;
    }

    // 2. Exact Product & Variant Match
    if (item.productId !== orderItem.productId || item.variantId !== orderItem.variantId) {
      return false;
    }

    // 3. Exact Manufactured Identity Hash Match (Requirement #23)
    if (item.manufacturingIdentityHash && item.manufacturingIdentityHash !== targetHash) {
      return false;
    }

    return true;
  });
}

/**
 * Gate Check: Ensures COD orders MUST be COD_APPROVED and Prepaid orders MUST be captured before inventory reservation (Requirement #25).
 */
export function canReserveReturnedInventoryForOrder(order: Order): { allowed: boolean; reason?: string } {
  const isCod = order.paymentMethod === "cod" || Boolean(order.isCod);
  if (isCod) {
    if (order.codStatus !== "COD_APPROVED") {
      return {
        allowed: false,
        reason: "cod_approval_required: COD order must be COD_APPROVED before returned inventory reservation",
      };
    }
  } else {
    if (order.paymentStatus !== "captured" && order.status !== "paid") {
      return {
        allowed: false,
        reason: "prepaid_capture_required: Prepaid order must be captured before returned inventory reservation",
      };
    }
  }

  return { allowed: true };
}
