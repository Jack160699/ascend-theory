import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Order } from "./types";
import { hasSupabaseServiceConfig } from "@/lib/supabase/env";
import { saveSupabaseOrder, getSupabaseOrder } from "./supabase-store";

const memoryOrders = new Map<string, Order>();

function ordersDirectory(): string {
  if (process.env.ORDERS_DATA_DIR) {
    return process.env.ORDERS_DATA_DIR;
  }
  return path.join(process.cwd(), "data", "orders");
}

function orderFilePath(orderId: string): string {
  const safe = orderId.replace(/[^a-zA-Z0-9-]/g, "");
  return path.join(ordersDirectory(), `${safe}.json`);
}

/**
 * Persists an order. Enforces Supabase database persistence in production.
 * Refuses insecure /tmp file fallback in production if Supabase is missing.
 */
export async function saveOrder(order: Order): Promise<void> {
  const isProduction = process.env.NODE_ENV === "production";
  const hasSupabase = hasSupabaseServiceConfig();

  if (isProduction && !hasSupabase) {
    throw new Error(
      "[OrderStore FATAL] Insecure file/memory fallback is prohibited in production. Configure SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL."
    );
  }

  if (hasSupabase) {
    try {
      await saveSupabaseOrder(order);
      memoryOrders.set(order.id, order);
      return;
    } catch (err) {
      if (isProduction) {
        throw err;
      }
      console.warn("[OrderStore] Supabase save failed, using dev fallback:", err);
    }
  }

  // Dev/local testing storage fallback
  memoryOrders.set(order.id, order);
  try {
    const dir = ordersDirectory();
    await mkdir(dir, { recursive: true });
    await writeFile(orderFilePath(order.id), JSON.stringify(order, null, 2), "utf8");
  } catch (err) {
    console.warn("[OrderStore] Local dev file store notice:", err);
  }

  console.info("[OrderStore] Order saved (dev mode):", order.id, order.status);
}

/**
 * Retrieves an order by ID.
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  const isProduction = process.env.NODE_ENV === "production";
  const hasSupabase = hasSupabaseServiceConfig();

  if (isProduction && !hasSupabase) {
    throw new Error(
      "[OrderStore FATAL] Insecure file/memory fallback is prohibited in production."
    );
  }

  if (hasSupabase) {
    try {
      const dbOrder = await getSupabaseOrder(orderId);
      if (dbOrder) {
        memoryOrders.set(dbOrder.id, dbOrder);
        return dbOrder;
      }
    } catch (err) {
      if (isProduction) throw err;
    }
  }

  const cached = memoryOrders.get(orderId);
  if (cached) return cached;

  try {
    const raw = await readFile(orderFilePath(orderId), "utf8");
    const order = JSON.parse(raw) as Order;
    memoryOrders.set(order.id, order);
    return order;
  } catch {
    return null;
  }
}

/**
 * Patches and updates an existing order.
 */
export async function updateOrder(
  orderId: string,
  patch: Partial<Order>
): Promise<Order | null> {
  const existing = await getOrder(orderId);
  if (!existing) return null;
  const next = { ...existing, ...patch };
  await saveOrder(next);
  return next;
}

export const getOrderAdmin = getOrder;
export const saveOrderAdmin = saveOrder;

