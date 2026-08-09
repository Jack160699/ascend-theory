/**
 * Phase 7 — Authoritative Partial Advance Payment Integration (Requirement #8)
 * Leverages Phase 3 secure Razorpay payment verification boundary.
 * Advances COD order state to COD_APPROVED strictly upon authoritative signature verification & capture.
 */

import { verifyRazorpayCheckoutSignature } from "@/lib/payments";
import { getOrderAdmin, saveOrder } from "@/lib/orders/store";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type AdvancePaymentVerificationInput = {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  adminId?: string | null;
  secret?: string;
};

export async function processCodAdvanceCaptureAdmin(
  input: AdvancePaymentVerificationInput,
): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, secret } = input;

  const order = await getOrderAdmin(orderId);
  if (!order) {
    return { ok: false, error: "order_not_found" };
  }

  if (order.paymentMethod !== "cod" && !order.isCod) {
    return { ok: false, error: "not_a_cod_order" };
  }

  // Verify Phase 3 Razorpay HMAC signature
  const isValidSig = verifyRazorpayCheckoutSignature(
    {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    },
    secret,
  );
  if (!isValidSig) {
    return { ok: false, error: "invalid_advance_payment_signature" };
  }

  // Update order with advance capture and transition to COD_APPROVED
  const updatedOrder = {
    ...order,
    codStatus: "COD_APPROVED" as const,
    advanceStatus: "captured" as const,
    advancePaymentId: razorpayPaymentId,
  };

  await saveOrder(updatedOrder);

  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServiceClient();
    if (supabase) {
      await supabase
        .from("orders")
        .update({
          cod_status: "COD_APPROVED",
          advance_status: "captured",
          advance_payment_id: razorpayPaymentId,
        })
        .eq("id", orderId);
    }
  }

  return { ok: true, orderId };
}
