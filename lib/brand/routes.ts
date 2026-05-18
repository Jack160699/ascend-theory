import { getFeaturedDrop } from "@/lib/data/drops";

const featuredSlug = getFeaturedDrop().slug;

/** Multi-page brand routes — single source for nav and links. */
export const BRAND_ROUTES = {
  home: "/",
  philosophy: "/philosophy",
  wearables: "/wearables",
  drops: "/drops",
  journal: "/journal",
  drop: (slug: string) => `/drop/${slug}` as const,
  journalArticle: (slug: string) => `/journal/${slug}` as const,
  dropFeatured: `/drop/${featuredSlug}` as const,
  checkout: "/checkout",
} as const;

export type BrandNavItem = {
  href: string;
  label: string;
};

export const BRAND_NAV: readonly BrandNavItem[] = [
  { href: BRAND_ROUTES.philosophy, label: "Philosophy" },
  { href: BRAND_ROUTES.wearables, label: "Wearables" },
  { href: BRAND_ROUTES.drops, label: "Drops" },
  { href: BRAND_ROUTES.journal, label: "Journal" },
] as const;

/** Homepage portal — spatial cinematic directions */
export const PORTAL_DIRECTIONS = [
  {
    href: BRAND_ROUTES.wearables,
    label: "Wearables",
    placement: "top",
    stagger: "0.2s",
  },
  {
    href: BRAND_ROUTES.journal,
    label: "Journal",
    placement: "left",
    stagger: "0.4s",
  },
  {
    href: BRAND_ROUTES.drops,
    label: "Drops",
    placement: "right",
    stagger: "0.6s",
  },
  {
    href: BRAND_ROUTES.philosophy,
    label: "Philosophy",
    placement: "bottom",
    stagger: "0.8s",
  },
] as const;

/** @deprecated Use PORTAL_DIRECTIONS */
export const PORTAL_LINKS = PORTAL_DIRECTIONS;

export function isCommercePath(pathname: string): boolean {
  return (
    pathname === BRAND_ROUTES.checkout ||
    pathname === BRAND_ROUTES.drops ||
    pathname.startsWith("/drop/")
  );
}

export function isActiveBrandRoute(pathname: string, href: string): boolean {
  if (href === BRAND_ROUTES.home) return pathname === "/";
  if (href === BRAND_ROUTES.drops) {
    return pathname === href || pathname.startsWith("/drop/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
