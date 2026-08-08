import type { Order } from "@/lib/orders/types";
import { getOrder } from "@/lib/orders/store";
import {
  verifyRazorpayCheckoutSignature,
  verifyRazorpayWebhookSignature,
} from "./crypto";
import {
  capturePaymentAuthoritatively,
  recordPaymentEvent,
} from "./store-payments";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export function getRazorpayKeyId(): string | null {
  return (
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    null
  );
}

export function getRazorpayKeySecret(): string | null {
  return process.env.RAZORPAY_KEY_SECRET || null;
}

export function getRazorpayWebhookSecret(): string | null {
  return process.env.RAZORPAY_WEBHOOK_SECRET || null;
}

export function isRazorpayEnabled(): boolean {
  return Boolean(getRazorpayKeyId() && getRazorpayKeySecret());
}

function getAuthHeader(): string | null {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();
  if (!keyId || !keySecret) return null;
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export type RazorpayCheckoutResult = {
  orderId: string;
  razorpayKeyId: string;
  amountPaise: number;
  currency: string;
  paymentUrl: string;
};

/**
 * Creates an authoritative server-side Razorpay order.
 * Fails closed in production mode if Razorpay credentials are missing.
 */
export async function createRazorpayCheckout(
  order: Order,
  origin: string
): Promise<RazorpayCheckoutResult | null> {
  const isProduction = process.env.NODE_ENV === "production";
  const keyId = getRazorpayKeyId();
  const auth = getAuthHeader();

  if (!auth || !keyId) {
    if (isProduction) {
      throw new Error("Razorpay secret credentials missing in production mode.");
    }
    return null;
  }

  const amountPaise = Math.round(order.subtotal * 100);
  const currency = (order.currency === "USD" ? "USD" : "INR").toUpperCase();

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency,
      receipt: order.id,
      notes: {
        ascendOrderId: order.id,
        customerEmail: order.customer.email,
      },
    }),
  });

  if (!res.ok) {
    console.error("[razorpay] order create failed", await res.text());
    return null;
  }

  const data = (await res.json()) as { id: string };

  // Persist initial payment record in Supabase payments table
  const serviceClient = createSupabaseServiceClient();
  if (serviceClient) {
    await serviceClient.from("payments").insert({
      order_id: order.id,
      provider: "razorpay",
      provider_order_id: data.id,
      amount_paise: amountPaise,
      currency,
      status: "created",
    });
  }

  await recordPaymentEvent({
    orderId: order.id,
    eventType: "razorpay_order_created",
    details: {
      razorpayOrderId: data.id,
      amountPaise,
      currency,
    },
  });

  const paymentUrl = `${origin}/checkout/confirmation?orderId=${encodeURIComponent(
    order.id
  )}&razorpay_order_id=${encodeURIComponent(data.id)}&razorpay_key=${encodeURIComponent(keyId)}`;

  return {
    orderId: data.id,
    razorpayKeyId: keyId,
    amountPaise,
    currency,
    paymentUrl,
  };
}

/**
 * Cryptographically verifies a server-side checkout callback and authoritatively updates payment state.
 */
export async function verifyRazorpayCheckoutCallback(params: {
  ascendOrderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { ascendOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  // 1. Verify HMAC SHA-256 signature
  const isSignatureValid = verifyRazorpayCheckoutSignature({
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  });

  if (!isSignatureValid) {
    await recordPaymentEvent({
      orderId: ascendOrderId,
      eventType: "signature_invalid",
      details: { razorpayOrderId, razorpayPaymentId },
    });
    return { ok: false, error: "Invalid payment signature", status: 400 };
  }

  // 2. Fetch target Ascend Order
  const order = await getOrder(ascendOrderId);
  if (!order) {
    return { ok: false, error: "Order not found", status: 404 };
  }

  // Check Razorpay Order ID mapping
  if (order.paymentReference && order.paymentReference !== razorpayOrderId) {
    await recordPaymentEvent({
      orderId: ascendOrderId,
      eventType: "razorpay_order_mismatch",
      details: { expected: order.paymentReference, received: razorpayOrderId },
    });
    return { ok: false, error: "Razorpay order ID mismatch", status: 400 };
  }

  const amountPaise = Math.round(order.subtotal * 100);

  // 3. Authoritatively capture payment
  const captureResult = await capturePaymentAuthoritatively({
    ascendOrderId,
    razorpayOrderId,
    razorpayPaymentId,
    amountPaise,
    currency: order.currency,
    eventType: "payment_captured",
    payload: { source: "checkout_callback" },
  });

  if (!captureResult.ok) {
    return { ok: false, error: captureResult.error, status: 400 };
  }

  return { ok: true, alreadyPaid: captureResult.alreadyPaid, orderId: ascendOrderId };
}

/**
 * Handles incoming Razorpay Webhooks with HMAC signature verification & idempotency.
 */
export async function handleRazorpayWebhook(
  rawBody: string | Buffer,
  signatureHeader: string | null
) {
  // 1. Verify HMAC SHA-256 Webhook signature
  const isValid = verifyRazorpayWebhookSignature(rawBody, signatureHeader);
  if (!isValid) {
    await recordPaymentEvent({
      eventType: "signature_invalid",
      details: { header: signatureHeader },
    });
    return { ok: false, error: "Invalid webhook signature", status: 400 };
  }

  const bodyString = typeof rawBody === "string" ? rawBody : rawBody.toString("utf-8");
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(bodyString) as Record<string, unknown>;
  } catch {
    return { ok: false, error: "Invalid JSON body", status: 400 };
  }

  const event = payload.event as string;
  const eventId = payload.account_id ? `${payload.event}_${payload.created_at}` : undefined;

  await recordPaymentEvent({
    eventType: "webhook_received",
    providerEventId: eventId,
    details: { event },
  });

  const payloadContainer = payload.payload as
    | {
        payment?: { entity?: Record<string, unknown> };
        order?: { entity?: Record<string, unknown> };
      }
    | undefined;

  if (event === "payment.captured" || event === "order.paid") {
    const entity = payloadContainer?.payment?.entity || payloadContainer?.order?.entity;
    if (!entity) {
      return { ok: true, message: "No entity payload to process" };
    }

    const razorpayOrderId = (entity.order_id || entity.id) as string;
    const razorpayPaymentId = entity.id as string;
    const amountPaise = entity.amount as number;
    const currency = entity.currency as string;
    const notes = entity.notes as { ascendOrderId?: string } | undefined;
    const ascendOrderId = (notes?.ascendOrderId || entity.receipt) as string;

    if (!ascendOrderId) {
      return { ok: true, message: "No Ascend Order ID found in notes or receipt" };
    }

    const captureResult = await capturePaymentAuthoritatively({
      ascendOrderId,
      razorpayOrderId,
      razorpayPaymentId,
      amountPaise,
      currency,
      providerEventId: eventId,
      eventType: "payment_captured",
      payload: { webhookEvent: event },
    });

    return captureResult;
  }

  if (event === "payment.failed") {
    const entity = payloadContainer?.payment?.entity;
    const notes = entity?.notes as { ascendOrderId?: string } | undefined;
    const ascendOrderId = (notes?.ascendOrderId || entity?.receipt) as string | undefined;

    if (ascendOrderId) {
      await recordPaymentEvent({
        orderId: ascendOrderId,
        eventType: "payment_failed",
        providerEventId: eventId,
        details: {
          error_code: entity?.error_code,
          error_description: entity?.error_description,
        },
      });
    }
    return { ok: true, message: "Payment failure recorded" };
  }

  return { ok: true, message: "Webhook event ignored" };
}
