import type { Order } from "@/lib/orders/types";

function getAuthHeader(): string | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export function isRazorpayEnabled(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/** Creates a Razorpay order; returns payment page URL when configured. */
export async function createRazorpayCheckout(
  order: Order,
  origin: string,
): Promise<{ orderId: string; paymentUrl: string } | null> {
  const auth = getAuthHeader();
  if (!auth) return null;

  const amountPaise = Math.round(order.subtotal * 100);
  const currency = order.currency === "USD" ? "USD" : "INR";

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: currency === "INR" ? amountPaise : amountPaise,
      currency,
      receipt: order.id,
      notes: {
        orderId: order.id,
        customerEmail: order.customer.email,
      },
    }),
  });

  if (!res.ok) {
    console.error("[razorpay] order create failed", await res.text());
    return null;
  }

  const data = (await res.json()) as { id: string };
  const keyId = process.env.RAZORPAY_KEY_ID!;

  const paymentUrl = `${origin}/checkout/confirmation?orderId=${encodeURIComponent(order.id)}&razorpay_order_id=${encodeURIComponent(data.id)}&razorpay_key=${encodeURIComponent(keyId)}`;

  return { orderId: data.id, paymentUrl };
}
