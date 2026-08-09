import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, hasPermission } from "@/lib/admin/auth";
import {
  getAllFulfillmentsAdmin,
  createOrClaimFulfillmentAdmin,
  submitFulfillmentToProviderAdmin,
  updateFulfillmentStatusAdmin,
} from "@/lib/fulfillment/fulfillment-store";
import { evaluateOrderFulfillmentEligibility } from "@/lib/fulfillment/eligibility";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized operational access" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (orderId) {
    const eligibility = await evaluateOrderFulfillmentEligibility(orderId);
    return NextResponse.json({ ok: true, eligibility });
  }

  const fulfillments = await getAllFulfillmentsAdmin();
  return NextResponse.json({ ok: true, fulfillments });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized operational access" }, { status: 401 });
  }

  // RBAC Requirement #31: Support & Editor roles cannot claim/submit provider manufacturing orders
  if (!hasPermission(session.role, "wearables", "write")) {
    return NextResponse.json(
      { ok: false, error: "Forbidden: Operational role permissions insufficient for manufacturing submission" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { action, orderId, fulfillmentId, status } = body;

    if (action === "claim_and_submit" && orderId) {
      const claimRes = await createOrClaimFulfillmentAdmin(orderId, session.id || "admin-1");
      if (!claimRes.ok) {
        return NextResponse.json({ ok: false, error: claimRes.error, fulfillmentId: claimRes.fulfillmentId }, { status: 400 });
      }

      const submitRes = await submitFulfillmentToProviderAdmin(claimRes.fulfillment.id, session.id || "admin-1");
      if (!submitRes.ok) {
        return NextResponse.json({ ok: false, error: submitRes.error, fulfillment: submitRes.fulfillment }, { status: 400 });
      }

      return NextResponse.json({ ok: true, fulfillment: submitRes.fulfillment });
    }

    if (action === "retry_submission" && fulfillmentId) {
      const submitRes = await submitFulfillmentToProviderAdmin(fulfillmentId, session.id || "admin-1");
      if (!submitRes.ok) {
        return NextResponse.json({ ok: false, error: submitRes.error, fulfillment: submitRes.fulfillment }, { status: 400 });
      }
      return NextResponse.json({ ok: true, fulfillment: submitRes.fulfillment });
    }

    if (action === "update_status" && fulfillmentId && status) {
      const updateRes = await updateFulfillmentStatusAdmin(fulfillmentId, status, undefined, undefined, undefined, undefined, undefined, session.id || "admin-1");
      if (!updateRes.ok) {
        return NextResponse.json({ ok: false, error: updateRes.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Invalid action or parameters" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
