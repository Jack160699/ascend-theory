import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { Order, OrderItem } from "./types";

/**
 * Maps an Ascend Theory Order domain entity to the Supabase database table format.
 */
export async function saveSupabaseOrder(order: Order): Promise<void> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    throw new Error("[OrderStore] Supabase service role client is unconfigured.");
  }

  const subtotalPaise = Math.round((order.subtotal || 0) * 100);

  // Upsert master order record
  const { error: orderError } = await supabase.from("orders").upsert({
    id: order.id,
    status: order.status,
    payment_status: order.status === "paid" ? "captured" : "unpaid",
    fulfillment_status: order.status === "pending_fulfillment" ? "processing" : "unfulfilled",
    subtotal_paise: subtotalPaise,
    total_paise: subtotalPaise,
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
      console.warn("[OrderStore] Order items upsert notice:", itemsError.message);
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

  const customerObj = (orderRow.shipping_address || {}) as unknown as Order["customer"];

  return {
    id: orderRow.id,
    createdAt: orderRow.created_at,
    status: orderRow.status,
    paymentMethod: "online",
    paymentProvider: "razorpay",
    currency: orderRow.currency || "INR",
    subtotal: Number(orderRow.subtotal_paise || 0) / 100,
    items,
    customer: customerObj,
  };
}
