import { NextRequest, NextResponse } from "next/server";
import { getOrderAdmin } from "@/lib/orders/store";
import { createOtpChallengeAdmin } from "@/lib/cod/otp";
import { getOTPTransportProvider } from "@/lib/cod/otp-transport";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ ok: false, error: "Missing orderId" }, { status: 400 });
    }

    const order = await getOrderAdmin(orderId);
    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    if (order.paymentMethod !== "cod" && !order.isCod) {
      return NextResponse.json({ ok: false, error: "Not a COD order" }, { status: 400 });
    }

    const challengeRes = await createOtpChallengeAdmin(order.id, order.customer.phone);
    if (!challengeRes.ok) {
      return NextResponse.json({ ok: false, error: challengeRes.error }, { status: 400 });
    }

    // Deliver via abstract OTP transport
    const transport = getOTPTransportProvider();
    const deliveryRes = await transport.sendOtp(challengeRes.challenge.phoneNormalized, challengeRes.otpText);

    return NextResponse.json({
      ok: true,
      message: "OTP sent successfully",
      expiresAt: challengeRes.challenge.expiresAt,
      transportName: transport.providerName,
      deliverySuccess: deliveryRes.success,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
