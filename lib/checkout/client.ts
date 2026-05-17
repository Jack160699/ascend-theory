import type { CreateOrderInput } from "@/lib/orders/types";
import type { Order } from "@/lib/orders/types";

const ORDER_SNAPSHOT_KEY = "ascend-order-snapshot";

export type CreateOrderResponse = {
  order: Order;
  paymentUrl: string | null;
};

export async function submitCreateOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResponse> {
  const res = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = (await res.json()) as CreateOrderResponse & { error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? "Order could not be created.");
  }

  saveOrderSnapshot(data.order);
  return data;
}

export function saveOrderSnapshot(order: Order): void {
  try {
    sessionStorage.setItem(ORDER_SNAPSHOT_KEY, JSON.stringify(order));
  } catch {
    /* private mode */
  }
}

export function readOrderSnapshot(): Order | null {
  try {
    const raw = sessionStorage.getItem(ORDER_SNAPSHOT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Order;
  } catch {
    return null;
  }
}

export function clearOrderSnapshot(): void {
  try {
    sessionStorage.removeItem(ORDER_SNAPSHOT_KEY);
  } catch {
    /* noop */
  }
}

export async function fetchOrder(orderId: string): Promise<Order | null> {
  const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
  if (!res.ok) return readOrderSnapshot();
  const data = (await res.json()) as { order: Order };
  return data.order;
}
