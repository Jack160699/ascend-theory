export type AdminRole = "owner" | "admin" | "editor" | "support";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  lastActiveAt?: string;
};

export const ADMIN_ROLE_DETAILS: Record<
  AdminRole,
  { label: string; description: string; badgeColor: string }
> = {
  owner: {
    label: "Owner",
    description: "Unrestricted root platform administration & API key governance.",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  admin: {
    label: "Admin",
    description: "Full operational access to store, content, users, and fulfillment.",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  editor: {
    label: "Editor",
    description: "Content, journal, website pages, and community moderation rights.",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  support: {
    label: "Support",
    description: "Read-only orders, customer service tickets, and delivery tracking.",
    badgeColor: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
};

export const ROLE_HIERARCHY: Record<AdminRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  support: 1,
};

export const DEFAULT_ADMIN_USER: AdminUser = {
  id: "usr_apex_01",
  name: "Apex HQ Admin",
  email: "admin@ascendtheory.com",
  role: "owner",
  lastActiveAt: new Date().toISOString(),
};

/**
 * Validates a redirect URL to prevent open redirect vulnerabilities.
 * Only relative URLs starting with /admin (and not starting with //) are permitted.
 */
export function validateRedirectUrl(url: string | null | undefined, fallback: string = "/admin"): string {
  if (!url || typeof url !== "string") return fallback;

  const trimmed = url.trim();

  // Rejects absolute URLs, protocol relative URLs (//), or non-admin paths
  if (
    trimmed.startsWith("//") ||
    trimmed.includes(":") ||
    !trimmed.startsWith("/admin")
  ) {
    return fallback;
  }

  return trimmed;
}

/**
 * Checks if a given role meets the required role rank or minimum permission.
 */
export function hasMinimumRole(currentRole: AdminRole, requiredRole: AdminRole): boolean {
  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Granular RBAC permission check for domains and sub-actions.
 */
export function hasPermission(
  role: AdminRole,
  domainId: string,
  action: "read" | "write" | "delete" | "admin" = "read"
): boolean {
  if (role === "owner") return true;

  if (domainId === "system") {
    if (action === "admin" || action === "delete") return false;
    return role === "admin";
  }

  if (role === "admin") return true;

  if (role === "editor") {
    const editorDomains = ["overview", "website", "journal", "community", "marketing"];
    return editorDomains.includes(domainId);
  }

  if (role === "support") {
    const supportDomains = ["overview", "community", "wearables", "commerce", "fulfilment"];
    return supportDomains.includes(domainId);
  }

  return false;
}
