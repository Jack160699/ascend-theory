import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getOrderAdmin } from "@/lib/orders/store";
import { verifyOtpChallengeAdmin } from "@/lib/cod/otp";
import { evaluateCodOrderDecision, applyCodDecisionAdmin } from "@/lib/cod/decision-engine";
import { getRiskProfileByPhoneAdmin } from "@/lib/cod/outcomes";
import { getDailyCodExposureAdmin } from "@/lib/cod/exposure";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, confirmationToken, otp } = body;

    if (!orderId || !confirmationToken || !otp) {
      return NextResponse.json(
        { ok: false, error: "Missing orderId, confirmationToken, or otp" },
        { status: 400 },
      );
    }

    const order = await getOrderAdmin(orderId);
    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
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

    const verifyRes = await verifyOtpChallengeAdmin(orderId, otp, confirmationToken);
    if (!verifyRes.ok) {
      return NextResponse.json({ ok: false, error: verifyRes.error }, { status: 400 });
    }

    // Requirement #18: Re-evaluate decision engine after successful OTP verification
    const riskProfile = await getRiskProfileByPhoneAdmin(order.customer.phone);
    const currentExposure = await getDailyCodExposureAdmin();

    const decisionResult = evaluateCodOrderDecision(order, riskProfile, currentExposure);

    // Determine target COD status post-OTP
    let targetCodStatus = decisionResult.codStatus;
    if (decisionResult.decision === "OTP_REQUIRED" || targetCodStatus === "COD_OTP_PENDING") {
      targetCodStatus = "COD_APPROVED"; // Normal order after OTP verified promotes to COD_APPROVED
    }

    const applyRes = await applyCodDecisionAdmin(
      order.id,
      targetCodStatus,
      `OTP Verified: ${decisionResult.reasons.join(", ")}`,
      decisionResult.decision === "ADVANCE_REQUIRED",
      decisionResult.advanceAmountPaise || 0,
      null,
    );

    if (!applyRes.ok) {
      return NextResponse.json({ ok: false, error: applyRes.error }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      codStatus: targetCodStatus,
      advanceRequired: decisionResult.decision === "ADVANCE_REQUIRED",
      advanceAmountPaise: decisionResult.advanceAmountPaise || 0,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
