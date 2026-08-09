import { NextRequest, NextResponse } from "next/server";
import { getOrderAdmin, saveOrder } from "@/lib/orders/store";
import { verifyOtpChallengeAdmin } from "@/lib/cod/otp";
import { evaluateCodOrderDecision } from "@/lib/cod/decision-engine";
import { getRiskProfileByPhoneAdmin } from "@/lib/cod/outcomes";
import { getDailyCodExposureAdmin } from "@/lib/cod/exposure";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, otp } = body;

    if (!orderId || !otp) {
      return NextResponse.json({ ok: false, error: "Missing orderId or otp" }, { status: 400 });
    }

    const order = await getOrderAdmin(orderId);
    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    const verifyRes = await verifyOtpChallengeAdmin(orderId, otp);
    if (!verifyRes.ok) {
      return NextResponse.json({ ok: false, error: verifyRes.error }, { status: 400 });
    }

    // OTP verified -> re-evaluate decision engine or progress order
    const riskProfile = await getRiskProfileByPhoneAdmin(order.customer.phone);
    const currentExposure = await getDailyCodExposureAdmin();

    const decisionResult = evaluateCodOrderDecision(order, riskProfile, currentExposure);

    // If decision after OTP is FULL_COD, transition to COD_APPROVED, else COD_CONFIRMED / ADVANCE_REQUIRED
    let finalCodStatus = decisionResult.codStatus;
    if (decisionResult.decision === "OTP_REQUIRED" || decisionResult.codStatus === "COD_OTP_PENDING") {
      finalCodStatus = "COD_APPROVED"; // Successfully verified OTP promotes normal order to COD_APPROVED
    }

    const updatedOrder = {
      ...order,
      codStatus: finalCodStatus,
      advanceRequired: decisionResult.decision === "ADVANCE_REQUIRED",
      advanceAmountPaise: decisionResult.advanceAmountPaise || 0,
    };

    await saveOrder(updatedOrder);

    if (hasSupabaseConfig()) {
      const supabase = createSupabaseServiceClient();
      if (supabase) {
        await supabase
          .from("orders")
          .update({
            cod_status: finalCodStatus,
            advance_required: decisionResult.decision === "ADVANCE_REQUIRED",
            advance_amount_paise: decisionResult.advanceAmountPaise || 0,
          })
          .eq("id", orderId);
      }
    }

    return NextResponse.json({
      ok: true,
      codStatus: finalCodStatus,
      advanceRequired: decisionResult.decision === "ADVANCE_REQUIRED",
      advanceAmountPaise: decisionResult.advanceAmountPaise,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
