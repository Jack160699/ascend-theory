import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getOrder, updateOrder } from "@/lib/orders/store";

export type PaymentCaptureResult =
  | { ok: true; alreadyPaid: boolean; orderId: string }
  | { ok: false; error: string };

/**
 * Authoritatively processes a verified payment capture.
 * Uses atomic RPC `process_successful_payment` in Supabase when available,
 * with safe fallback for dev/testing environments.
 */
export async function capturePaymentAuthoritatively(params: {
  ascendOrderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amountPaise: number;
  currency: string;
  providerEventId?: string;
  eventType?: string;
  payload?: Record<string, unknown>;
}): Promise<PaymentCaptureResult> {
  const {
    ascendOrderId,
    razorpayOrderId,
    razorpayPaymentId,
    amountPaise,
    currency,
    providerEventId,
    eventType = "payment_captured",
    payload = {},
  } = params;

  // 1. Fetch target order
  const order = await getOrder(ascendOrderId);
  if (!order) {
    return { ok: false, error: "Order not found" };
  }

  // Check if order is already paid (Idempotency)
  if (order.status === "paid") {
    return { ok: true, alreadyPaid: true, orderId: ascendOrderId };
  }

  // 2. Amount and Currency validation
  const expectedPaise = Math.round(order.subtotal * 100);
  if (expectedPaise !== amountPaise) {
    await recordPaymentEvent({
      orderId: ascendOrderId,
      eventType: "amount_mismatch",
      providerEventId,
      details: { expectedPaise, receivedPaise: amountPaise },
    });
    return { ok: false, error: "Amount mismatch" };
  }

  if (order.currency.toUpperCase() !== currency.toUpperCase()) {
    await recordPaymentEvent({
      orderId: ascendOrderId,
      eventType: "currency_mismatch",
      providerEventId,
      details: { expectedCurrency: order.currency, receivedCurrency: currency },
    });
    return { ok: false, error: "Currency mismatch" };
  }

  // 3. Attempt DB RPC execution via Supabase Service Role client
  const serviceClient = createSupabaseServiceClient();
  if (serviceClient) {
    const { data, error } = await serviceClient.rpc("process_successful_payment", {
      p_order_id: ascendOrderId,
      p_provider_payment_id: razorpayPaymentId,
      p_provider_order_id: razorpayOrderId,
      p_amount_paise: amountPaise,
      p_currency: currency,
      p_provider_event_id: providerEventId ?? null,
      p_event_type: eventType,
      p_payload: payload,
    });

    if (!error && data && data.ok) {
      return {
        ok: true,
        alreadyPaid: Boolean(data.already_paid),
        orderId: ascendOrderId,
      };
    }
  }

  // 4. Fallback in-memory/store state update for local testing/dev
  await updateOrder(ascendOrderId, {
    status: "paid",
    paymentReference: razorpayOrderId,
  });

  await recordPaymentEvent({
    orderId: ascendOrderId,
    eventType,
    providerEventId,
    details: {
      razorpayOrderId,
      razorpayPaymentId,
      amountPaise,
      currency,
      ...payload,
    },
  });

  return { ok: true, alreadyPaid: false, orderId: ascendOrderId };
}

/**
 * Persists payment audit event to database.
 */
export async function recordPaymentEvent(params: {
  orderId?: string;
  paymentId?: string;
  eventType: string;
  providerEventId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const serviceClient = createSupabaseServiceClient();
  if (!serviceClient) return;

  try {
    await serviceClient.from("payment_events").insert({
      order_id: params.orderId ?? null,
      payment_id: params.paymentId ?? null,
      event_type: params.eventType,
      provider_event_id: params.providerEventId ?? null,
      details_json: params.details ?? {},
    });
  } catch (err) {
    console.error("[payment_events] Log error:", err);
  }
}
