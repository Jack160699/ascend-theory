import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { Order, OrderItem, OrderStatus, PaymentMethod, PaymentProvider } from "./types";

/**
 * Maps an Ascend Theory Order domain entity to the Supabase database table format.
 */
export async function saveSupabaseOrder(order: Order): Promise<void> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    throw new Error("[OrderStore] Supabase service role client is unconfigured.");
  }

  const subtotalPaise = Math.round((order.subtotal || 0) * 100);
  const totalPaise = subtotalPaise; // Extendable for tax/shipping when added

  // Map domain status to database constraint status: ('created', 'pending', 'paid', 'fulfilled', 'cancelled', 'refunded')
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

  // Persist payment mapping if paymentReference is present
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

  const { data: itemRows } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

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

  // Query associated payments record for durable paymentReference & provider
  const { data: paymentRow } = await supabase
    .from("payments")
    .select("provider_order_id, provider, status")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const customerObj = (orderRow.shipping_address || {}) as unknown as Order["customer"];

  // Normalize database status to domain OrderStatus
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
