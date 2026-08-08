import { NextResponse } from "next/server";
import { getAdminSession, hasMinimumRole } from "@/lib/admin/auth";
import { getAllProductsAdmin, saveProductAdmin } from "@/lib/wearables/store";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await getAllProductsAdmin();
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Support role is prohibited from mutating catalogue
  if (session.role === "support" || !hasMinimumRole(session.role, "editor")) {
    return NextResponse.json(
      { error: "Forbidden: Support role cannot create or edit products" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const result = await saveProductAdmin(body, session.id);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, errors: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ product: result.product });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
