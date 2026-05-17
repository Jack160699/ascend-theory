import { getOrder } from "@/lib/orders/store";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { orderId } = await context.params;
  const order = await getOrder(orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ order });
}
