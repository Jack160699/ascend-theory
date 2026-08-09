import { getOrder } from "@/lib/orders/store";
import { NextResponse } from "next/server";
import crypto from "node:crypto";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { orderId } = await context.params;
  const order = await getOrder(orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const isCod = order.paymentMethod === "cod" || Boolean(order.isCod);
  if (isCod) {
    const authHeader = request.headers.get("authorization");
    const customHeader = request.headers.get("x-ascend-confirmation-token");
    let token = customHeader || "";
    if (!token && authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }

    if (!token) {
      return NextResponse.json({ error: "Forbidden: Confirmation token missing for COD order" }, { status: 403 });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    if (!order.codConfirmationTokenHash || order.codConfirmationTokenHash !== tokenHash) {
      return NextResponse.json({ error: "Forbidden: Invalid confirmation token" }, { status: 403 });
    }
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
