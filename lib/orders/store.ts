import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Order } from "./types";

const memoryOrders = new Map<string, Order>();

function ordersDirectory(): string {
  if (process.env.ORDERS_DATA_DIR) {
    return process.env.ORDERS_DATA_DIR;
  }
  if (process.env.VERCEL) {
    return path.join("/tmp", "ascend-orders");
  }
  return path.join(process.cwd(), "data", "orders");
}

function orderFilePath(orderId: string): string {
  const safe = orderId.replace(/[^a-zA-Z0-9-]/g, "");
  return path.join(ordersDirectory(), `${safe}.json`);
}

export async function saveOrder(order: Order): Promise<void> {
  memoryOrders.set(order.id, order);

  try {
    const dir = ordersDirectory();
    await mkdir(dir, { recursive: true });
    await writeFile(orderFilePath(order.id), JSON.stringify(order, null, 2), "utf8");
  } catch (err) {
    console.warn("[orders] File store unavailable:", err);
  }

  console.info("[orders] saved", order.id, order.status, order.subtotal, order.currency);
}

export async function getOrder(orderId: string): Promise<Order | null> {
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

export async function updateOrder(
  orderId: string,
  patch: Partial<Order>,
): Promise<Order | null> {
  const existing = await getOrder(orderId);
  if (!existing) return null;
  const next = { ...existing, ...patch };
  await saveOrder(next);
  return next;
}
