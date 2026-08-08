import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { getOrder } from "./store";
import type { Order, OrderItem, OrderStatus, PaymentMethod, PaymentProvider } from "./types";

export type AuthoritativeOrderDetails = {
  id: string;
  status: string;
  paymentStatus: string;
  totalPaise: number;
  currency: string;
  paymentReference?: string;
  paymentProvider?: string;
};

export type AuthoritativeOrderResult =
  | { ok: true; data: AuthoritativeOrderDetails }
  | { ok: false; error: string; dbError?: boolean };

/**
 * Maps an Ascend Theory Order domain entity to the Supabase database table format.
 */
export async function saveSupabaseOrder(order: Order): Promise<void> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    throw new Error("[OrderStore] Supabase service role client is unconfigured.");
  }

  const subtotalPaise = Math.round((order.subtotal || 0) * 100);
  const totalPaise = subtotalPaise;

  let dbStatus = "pending";
  if (order.status === "created") dbStatus = "created";
  else if (order.status === "paid") dbStatus = "paid";
  else if (order.status === "cancelled") dbStatus = "cancelled";
  else if (order.status === "refunded") dbStatus = "refunded";

  const dbPaymentStatus =
    order.status === "paid"
      ? "captured"
      : order.status === "refunded"
      ? "refunded"
      : "unpaid";

  const dbFulfillmentStatus =
    order.status === "pending_fulfillment" ? "processing" : "unfulfilled";

  // Upsert master order record
  const { error: orderError } = await supabase.from("orders").upsert({
    id: order.id,
    status: dbStatus,
    payment_status: dbPaymentStatus,
    fulfillment_status: dbFulfillmentStatus,
    subtotal_paise: subtotalPaise,
    total_paise: totalPaise,
    currency: order.currency || "INR",
    shipping_address: order.customer as unknown as Record<string, unknown>,
    created_at: order.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (orderError) {
    console.error("[OrderStore] Supabase order upsert error:", orderError);
    throw new Error(`Failed to persist order to Supabase: ${orderError.message}`);
  }

  // Persist order items with immutable purchased snapshot
  if (order.items && order.items.length > 0) {
    const itemRecords = order.items.map((item) => ({
      order_id: order.id,
      sku: item.slug,
      title: item.name,
      size: "STD",
      color: "DEFAULT",
      unit_price_paise: Math.round(item.price * 100),
      quantity: item.quantity,
      total_price_paise: Math.round(item.lineTotal * 100),
      snapshot_json: (item as unknown) as Record<string, unknown>,
    }));

    const { error: itemsError } = await supabase.from("order_items").upsert(itemRecords, {
      onConflict: "order_id,sku",
    });

    if (itemsError) {
      console.error("[OrderStore] Order items upsert error:", itemsError);
      throw new Error(`Failed to persist order items to Supabase: ${itemsError.message}`);
    }
  }

  // Persist initial payment mapping if paymentReference is present
  if (order.paymentReference) {
    const { error: paymentError } = await supabase.from("payments").upsert(
      {
        order_id: order.id,
        provider: order.paymentProvider || "razorpay",
        provider_order_id: order.paymentReference,
        amount_paise: totalPaise,
        currency: order.currency || "INR",
        status: order.status === "paid" ? "captured" : "created",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider_order_id" }
    );

    if (paymentError) {
      console.error("[OrderStore] Payment record upsert error:", paymentError);
      throw new Error(`Failed to persist payment mapping to Supabase: ${paymentError.message}`);
    }
  }
}

/**
 * Retrieves authoritative order details directly from DB for payment calculation and verification.
 * Fails closed on database errors.
 */
export async function getAuthoritativeOrderDetails(
  orderId: string
): Promise<AuthoritativeOrderResult> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    const isProduction = process.env.NODE_ENV === "production";
    const hasConfig = hasSupabaseConfig();
    if (isProduction || hasConfig) {
      return { ok: false, error: "Supabase service client unconfigured", dbError: true };
    }
    // Dev/Test memory fallback
    const localOrder = await getOrder(orderId);
    if (!localOrder) return { ok: false, error: "Order not found" };
    return {
      ok: true,
      data: {
        id: localOrder.id,
        status: localOrder.status,
        paymentStatus: localOrder.status === "paid" ? "captured" : "unpaid",
        totalPaise: Math.round(localOrder.subtotal * 100),
        currency: localOrder.currency || "INR",
        paymentReference: localOrder.paymentReference,
        paymentProvider: localOrder.paymentProvider,
      },
    };
  }

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("id, status, payment_status, total_paise, subtotal_paise, currency")
    .eq("id", orderId)
    .single();

  if (orderError) {
    if (orderError.code === "PGRST116") {
      return { ok: false, error: "Order not found" };
    }
    console.error("[OrderStore] Order query error:", orderError);
    return { ok: false, error: `Database error querying order: ${orderError.message}`, dbError: true };
  }

  if (!orderRow) {
    return { ok: false, error: "Order not found" };
  }

  const { data: paymentRow, error: paymentError } = await supabase
    .from("payments")
    .select("provider_order_id, provider, amount_paise, currency, status")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentError) {
    console.error("[OrderStore] Payment row query error:", paymentError);
    return { ok: false, error: `Database error querying payment mapping: ${paymentError.message}`, dbError: true };
  }

  const totalPaise = Number(orderRow.total_paise || orderRow.subtotal_paise || 0);

  return {
    ok: true,
    data: {
      id: orderRow.id,
      status: orderRow.status,
      paymentStatus: orderRow.payment_status,
      totalPaise,
      currency: orderRow.currency || "INR",
      paymentReference: paymentRow?.provider_order_id || undefined,
      paymentProvider: paymentRow?.provider || undefined,
    },
  };
}

/**
 * Retrieves an order from Supabase database.
 */
export async function getSupabaseOrder(orderId: string): Promise<Order | null> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) return null;

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !orderRow) return null;

  const { data: itemRows, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) {
    console.error("[OrderStore] Order items fetch error:", itemsError);
    return null;
  }

  const { data: paymentRow, error: paymentError } = await supabase
    .from("payments")
    .select("provider_order_id, provider, status")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentError) {
    console.error("[OrderStore] Payment row query error:", paymentError);
    return null;
  }

  const items: OrderItem[] = (itemRows || []).map((row) => {
    const snap = (row.snapshot_json || {}) as Partial<OrderItem>;
    return {
      slug: row.sku || snap.slug || "",
      name: row.title || snap.name || "",
      dropName: snap.dropName || "Ascend Drop",
      price: Number(row.unit_price_paise || 0) / 100,
      priceDisplay: snap.priceDisplay || `₹${Number(row.unit_price_paise || 0) / 100}`,
      quantity: row.quantity,
      lineTotal: Number(row.total_price_paise || 0) / 100,
    };
  });

  const customerObj = (orderRow.shipping_address || {}) as unknown as Order["customer"];

  let domainStatus: OrderStatus = "pending_payment";
  if (orderRow.status === "paid" || orderRow.payment_status === "captured") {
    domainStatus = "paid";
  } else if (orderRow.status === "cancelled") {
    domainStatus = "cancelled";
  } else if (orderRow.status === "refunded" || orderRow.payment_status === "refunded") {
    domainStatus = "refunded";
  } else if (orderRow.status === "created") {
    domainStatus = "created";
  } else if (orderRow.fulfillment_status === "processing" || orderRow.fulfillment_status === "fulfilled") {
    domainStatus = "pending_fulfillment";
  }

  const paymentMethod: PaymentMethod =
    paymentRow?.provider === "cod" ? "cod" : "online";
  const paymentProvider: PaymentProvider =
    (paymentRow?.provider as PaymentProvider) || "razorpay";

  return {
    id: orderRow.id,
    createdAt: orderRow.created_at,
    status: domainStatus,
    paymentMethod,
    paymentProvider,
    currency: orderRow.currency || "INR",
    subtotal: Number(orderRow.subtotal_paise || orderRow.total_paise || 0) / 100,
    items,
    customer: customerObj,
    paymentReference: paymentRow?.provider_order_id || undefined,
  };
}
