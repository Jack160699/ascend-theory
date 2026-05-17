import { confirmOrderPaid } from "@/lib/orders/create-order";
import { getOrder } from "@/lib/orders/store";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { orderId } = (await request.json()) as { orderId?: string };
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
    }

    const existing = await getOrder(orderId);
    if (!existing) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (existing.status !== "paid") {
      await confirmOrderPaid(orderId);
    }

    const order = await getOrder(orderId);
    return NextResponse.json({ order });
  } catch (err) {
    console.error("[api/orders/confirm]", err);
    return NextResponse.json({ error: "Confirmation failed." }, { status: 500 });
  }
}
