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

  const { codConfirmationTokenHash: _h, ...sanitizedOrder } = order;
  const sanitizedItems = (sanitizedOrder.items || []).map((item) => {
    const { manufacturingSnapshotJson: _s, ...sanitizedItem } = item;
    return sanitizedItem;
  });

  return NextResponse.json({
    order: {
      ...sanitizedOrder,
      items: sanitizedItems,
    },
  });
}
