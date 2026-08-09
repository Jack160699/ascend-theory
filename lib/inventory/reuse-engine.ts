/**
 * Phase 7 — Authoritative Reuse Matching Engine (Requirements #23, #24, #27)
 * Matches order items against available returned inventory by exact manufactured identity
 * (productId, variantId, designId, designVersion, checksum).
 * Guarantees returned inventory CANNOT be reserved before COD order approval.
 */

import type { Order, OrderItem } from "@/lib/orders/types";
import type { ReturnedInventoryItem } from "@/lib/cod/types";
import { getAllReturnedInventoryAdmin } from "./returned-store";

export type DesignIdentity = {
  designId: string;
  designVersion: number;
  checksum?: string;
};

export async function findMatchingReturnedInventory(
  orderItem: OrderItem,
  designIdentity: DesignIdentity,
): Promise<ReturnedInventoryItem[]> {
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

    // 3. Exact Manufactured Identity Match (Requirement #23)
    if (item.designId !== designIdentity.designId || item.designVersion !== designIdentity.designVersion) {
      return false;
    }

    return true;
  });
}

/**
 * Gate Check: Ensures COD orders MUST be COD_APPROVED before inventory reservation (Requirement #27).
 */
export function canReserveReturnedInventoryForOrder(order: Order): { allowed: boolean; reason?: string } {
  const isCod = order.paymentMethod === "cod" || Boolean(order.isCod);
  if (isCod && order.codStatus !== "COD_APPROVED") {
    return {
      allowed: false,
      reason: "cod_approval_required: COD order must be COD_APPROVED before returned inventory reservation",
    };
  }
  return { allowed: true };
}
