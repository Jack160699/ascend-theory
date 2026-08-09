import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getAllOrdersAdmin, getOrderAdmin } from "@/lib/orders/store";
import { getDailyCodExposureAdmin } from "@/lib/cod/exposure";
import { getAllReturnedInventoryAdmin } from "@/lib/inventory/returned-store";
import { applyCodDecisionAdmin, overrideCodStatusAdmin } from "@/lib/cod/decision-engine";
import type { Order } from "@/lib/orders/types";

export async function GET(_req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized operational access" }, { status: 401 });
  }

  // GET RBAC lockdown: owner, admin, support allowed (Editor 403)
  if (!["owner", "admin", "support"].includes(session.role)) {
    return NextResponse.json(
      { ok: false, error: "Forbidden: Operational role permissions insufficient for COD management access" },
      { status: 403 },
    );
  }

  try {
    const allOrders = await getAllOrdersAdmin();
    const codOrders = allOrders
      .filter((o: Order) => o.paymentMethod === "cod" || o.isCod || Boolean(o.codStatus))
      .map((o) => {
        const { codConfirmationTokenHash: _h, ...sanitized } = o;
        return sanitized;
      });

    const dailyExposurePaise = await getDailyCodExposureAdmin();
    const returnedInventory = await getAllReturnedInventoryAdmin();

    // Support role sees sanitized returned inventory without full snapshot (Requirement #29)
    const sanitizedInventory = returnedInventory.map((item) => {
      if (session.role === "support") {
        const { manufacturingSnapshotJson: _s, ...supportItem } = item;
        return supportItem;
      }
      return item;
    });

    // HQ summary: risk, OTP, RTO fields
    const rtoItems = returnedInventory.filter((i) => i.reuseStatus === "REUSABLE" || i.reuseStatus === "RESERVED");
    const inspectionItems = returnedInventory.filter((i) => i.reuseStatus === "INSPECTION_REQUIRED");
    const disposedItems = returnedInventory.filter((i) => i.reuseStatus === "DISPOSED");
    const totalCodOrders = codOrders.length;
    const pendingCodOrders = codOrders.filter((o) => ["COD_PENDING_CONFIRMATION", "COD_OTP_PENDING"].includes(o.codStatus || "")).length;
    const heldCodOrders = codOrders.filter((o) => o.codStatus === "COD_HELD").length;
    const approvedCodOrders = codOrders.filter((o) => o.codStatus === "COD_APPROVED").length;
    const advanceRequiredOrders = codOrders.filter((o) => o.codStatus === "COD_ADVANCE_REQUIRED" || o.codStatus === "COD_ADVANCE_PENDING").length;

    return NextResponse.json({
      ok: true,
      codOrders,
      dailyExposurePaise,
      returnedInventory: sanitizedInventory,
      hqSummary: {
        totalCodOrders,
        pendingCodOrders,
        heldCodOrders,
        approvedCodOrders,
        advanceRequiredOrders,
        rtoReusableCount: rtoItems.length,
        inspectionRequiredCount: inspectionItems.length,
        disposedCount: disposedItems.length,
        totalReturnedInventory: returnedInventory.length,
      },
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

  // RBAC lockdown: manual decision overrides restricted to owner & admin ONLY (support & editor return 403)
  if (!["owner", "admin"].includes(session.role)) {
    return NextResponse.json(
      { ok: false, error: "Forbidden: Manual COD decision override requires owner or admin permissions" },
      { status: 403 },
    );
  }

  // Real Admin UUID Enforcement (Requirement #22: NEVER fabricate admin UUID)
  const adminId = session.id;
  if (!adminId || !adminId.trim()) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: Admin session missing valid staff UUID" },
      { status: 401 },
    );
  }

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

    let decisionRes: { ok: boolean; error?: string };

    if (action === "approve_cod") {
      decisionRes = await applyCodDecisionAdmin(orderId, "COD_APPROVED", reason || "Admin manual approval", false, 0, adminId);
    } else if (action === "reject_cod") {
      decisionRes = await applyCodDecisionAdmin(orderId, "COD_REJECTED", reason || "Admin manual rejection", false, 0, adminId);
    } else if (action === "hold_cod") {
      decisionRes = await applyCodDecisionAdmin(orderId, "COD_HELD", reason || "Admin manual hold", false, 0, adminId);
    } else if (action === "require_advance") {
      const advanceAmt = body.advanceAmountPaise || 20000;
      decisionRes = await applyCodDecisionAdmin(orderId, "COD_ADVANCE_REQUIRED", reason || "Admin require advance", true, advanceAmt, adminId);
    } else if (action === "set_prepaid_only") {
      // Atomic set_prepaid_only inside decision RPC (Requirement #24)
      decisionRes = await applyCodDecisionAdmin(orderId, "COD_PREPAID_ONLY", reason || "Admin set prepaid only", false, 0, adminId);
    } else if (action === "override_status") {
      if (!reason || !reason.trim()) {
        return NextResponse.json({ ok: false, error: "Mandatory override reason is required" }, { status: 400 });
      }
      decisionRes = await overrideCodStatusAdmin(orderId, body.targetStatus, reason, adminId);
    } else {
      return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
    }

    if (!decisionRes.ok) {
      return NextResponse.json({ ok: false, error: decisionRes.error }, { status: 500 });
    }

    const updatedOrder = await getOrderAdmin(orderId);
    return NextResponse.json({ ok: true, order: updatedOrder });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
