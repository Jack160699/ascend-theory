/**
 * Phase 7 — Daily COD Exposure Calculation (Requirement #14)
 */

import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { Order } from "@/lib/orders/types";
import { getAllOrdersAdmin } from "@/lib/orders/store";

export const DEFAULT_MAX_DAILY_COD_EXPOSURE_PAISE = 5000000; // ₹50,000 default daily COD liability cap

/**
 * Calculates current outstanding active COD liability placed today.
 */
export async function getDailyCodExposureAdmin(): Promise<number> {
  const today = new Date().toISOString().split("T")[0]!;

  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("orders")
        .select("total_paise, subtotal_paise, created_at, cod_status, payment_method")
        .eq("payment_method", "cod")
        .in("cod_status", ["COD_APPROVED", "COD_CONFIRMED", "COD_ADVANCE_PENDING"]);

      if (!error && data) {
        return data
          .filter((row: { created_at: string }) => String(row.created_at).startsWith(today))
          .reduce((sum: number, row: { total_paise?: number; subtotal_paise?: number }) => sum + Number(row.total_paise || row.subtotal_paise || 0), 0);
      }
    }
  }

  // Memory fallback for dev/testing
  const allOrders = await getAllOrdersAdmin();
  return allOrders
    .filter(
      (o: Order) =>
        (o.paymentMethod === "cod" || o.isCod) &&
        ["COD_APPROVED", "COD_CONFIRMED", "COD_ADVANCE_PENDING"].includes(o.codStatus || "") &&
        (o.createdAt || "").startsWith(today),
    )
    .reduce((sum: number, o: Order) => sum + Math.round((o.subtotal || 0) * 100), 0);
}
