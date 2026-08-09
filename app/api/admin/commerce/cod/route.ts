import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getAllOrdersAdmin, getOrderAdmin, saveOrder } from "@/lib/orders/store";
import { getRiskProfileByPhoneAdmin, saveRiskProfileAdmin } from "@/lib/cod/outcomes";
import { getDailyCodExposureAdmin } from "@/lib/cod/exposure";
import { getAllReturnedInventoryAdmin } from "@/lib/inventory/returned-store";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { CodStatus } from "@/lib/cod/types";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized operational access" }, { status: 401 });
  }

  // Requirement #13: GET RBAC lockdown (owner, admin, support ONLY - block editor with 403)
  if (!["owner", "admin", "support"].includes(session.role)) {
    return NextResponse.json(
      { ok: false, error: "Forbidden: Operational role permissions insufficient for COD management access" },
      { status: 403 },
    );
  }

  try {
    const allOrders = await getAllOrdersAdmin();
    const codOrders = allOrders.filter((o: import("@/lib/orders/types").Order) => o.paymentMethod === "cod" || o.isCod || o.codStatus);
    const dailyExposurePaise = await getDailyCodExposureAdmin();
    const returnedInventory = await getAllReturnedInventoryAdmin();

    return NextResponse.json({
      ok: true,
      codOrders,
      dailyExposurePaise,
      returnedInventory,
      userRole: session.role,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to fetch COD management data" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized operational access" }, { status: 401 });
  }

  // Requirement #13: Manufacturing/Manual COD overrides restricted to owner & admin ONLY (support & editor return 403)
  if (!["owner", "admin"].includes(session.role)) {
    return NextResponse.json(
      { ok: false, error: "Forbidden: Manual COD decision override requires owner or admin permissions" },
      { status: 403 },
    );
  }

  const adminId = session.id || null;

  try {
    const body = await req.json();
    const { action, orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json({ ok: false, error: "Missing orderId" }, { status: 400 });
    }

    const order = await getOrderAdmin(orderId);
    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    let targetStatus: CodStatus | null = null;
    let advanceReq = order.advanceRequired ?? false;
    let advanceAmt = order.advanceAmountPaise ?? 0;

    if (action === "approve_cod") {
      targetStatus = "COD_APPROVED";
    } else if (action === "reject_cod") {
      targetStatus = "COD_REJECTED";
    } else if (action === "hold_cod") {
      targetStatus = "COD_HELD";
    } else if (action === "require_advance") {
      targetStatus = "COD_ADVANCE_REQUIRED";
      advanceReq = true;
      advanceAmt = body.advanceAmountPaise || 20000;
    } else if (action === "set_prepaid_only") {
      targetStatus = "COD_PREPAID_ONLY";
      // Update risk profile prepaidOnly flag
      const profile = await getRiskProfileByPhoneAdmin(order.customer.phone);
      if (profile) {
        profile.prepaidOnly = true;
        profile.riskBand = "PREPAID_ONLY";
        await saveRiskProfileAdmin(profile);
      }
    } else {
      return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
    }

    const updatedOrder = {
      ...order,
      codStatus: targetStatus,
      advanceRequired: advanceReq,
      advanceAmountPaise: advanceAmt,
    };

    await saveOrder(updatedOrder);

    if (hasSupabaseConfig()) {
      const supabase = createSupabaseServiceClient();
      if (supabase) {
        await supabase
          .from("orders")
          .update({
            cod_status: targetStatus,
            advance_required: advanceReq,
            advance_amount_paise: advanceAmt,
          })
          .eq("id", orderId);

        if (adminId) {
          await supabase.from("audit_logs").insert({
            admin_id: adminId,
            action: `cod_manual_${action}`,
            entity_type: "order",
            entity_id: orderId,
            details_json: { target_status: targetStatus, reason: reason || "Manual admin action" },
          });
        }
      }
    }

    return NextResponse.json({ ok: true, order: updatedOrder });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
