import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getOrderAdmin } from "@/lib/orders/store";
import { createOtpChallengeAdmin } from "@/lib/cod/otp";
import { getOTPTransportProvider } from "@/lib/cod/otp-transport";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, confirmationToken } = body;

    if (!orderId || !confirmationToken) {
      return NextResponse.json(
        { ok: false, error: "Missing orderId or confirmationToken" },
        { status: 400 },
      );
    }

    const order = await getOrderAdmin(orderId);
    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    if (order.paymentMethod !== "cod" && !order.isCod) {
      return NextResponse.json({ ok: false, error: "Not a COD order" }, { status: 400 });
    }

    // Validate confirmation token hash (Requirement #13)
    if (order.codConfirmationTokenHash) {
      const submittedHash = crypto.createHash("sha256").update(confirmationToken).digest("hex");
      try {
        const matches = crypto.timingSafeEqual(
          Buffer.from(submittedHash, "hex"),
          Buffer.from(order.codConfirmationTokenHash, "hex"),
        );
        if (!matches) {
          return NextResponse.json({ ok: false, error: "Invalid confirmation token" }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ ok: false, error: "Invalid confirmation token" }, { status: 403 });
      }
    }

    const challengeRes = await createOtpChallengeAdmin(order.id, order.customer.phone);
    if (!challengeRes.ok) {
      return NextResponse.json({ ok: false, error: challengeRes.error }, { status: 400 });
    }

    // Deliver via abstract OTP transport
    const transport = getOTPTransportProvider();
    const deliveryRes = await transport.sendOtp(
      challengeRes.challenge.phoneNormalized,
      challengeRes.otpText,
    );

    // Requirement #16: Return failure when transport fails
    if (!deliveryRes.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "otp_transport_delivery_failed",
          details: deliveryRes.error,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "OTP sent successfully",
      expiresAt: challengeRes.challenge.expiresAt,
      transportName: transport.providerName,
      deliverySuccess: true,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
