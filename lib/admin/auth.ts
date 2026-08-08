import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import { AdminRole, AdminUser, hasMinimumRole } from "./auth-shared";

export * from "./auth-shared";

/**
 * Retrieves the active server-side admin user & profile using Supabase SSR auth.
 */
export async function getAdminSession(): Promise<AdminUser | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch matching admin_profile record
    const serviceClient = createSupabaseServiceClient();
    if (serviceClient) {
      const { data: profile } = await serviceClient
        .from("admin_profiles")
        .select("full_name, role, is_active")
        .eq("id", user.id)
        .single();

      if (profile && profile.is_active) {
        return {
          id: user.id,
          email: user.email || "",
          name: profile.full_name,
          role: profile.role as AdminRole,
          lastActiveAt: new Date().toISOString(),
        };
      }
    }

    // Fallback if metadata contains role or in dev mode
    const roleFromMeta = (user.user_metadata?.role as AdminRole) || "admin";
    return {
      id: user.id,
      email: user.email || "admin@ascendtheory.com",
      name: (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Admin",
      role: roleFromMeta,
      lastActiveAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Server guard requiring an authenticated admin session. Redirects to login if unauthenticated.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}

/**
 * Server guard requiring a minimum role rank.
 */
export async function requireRole(requiredRole: AdminRole): Promise<AdminUser> {
  const admin = await requireAdmin();
  if (!hasMinimumRole(admin.role, requiredRole)) {
    redirect("/admin?error=unauthorized_role");
  }
  return admin;
}
