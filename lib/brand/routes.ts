/** Multi-page brand routes — single source for nav and links. */

export const DROP_SLUG_DEFAULT = "ascend-01" as const;

export const BRAND_ROUTES = {
  home: "/",
  philosophy: "/philosophy",
  wearables: "/wearables",
  journal: "/journal",
  drop: (slug: string) => `/drop/${slug}` as const,
  dropFeatured: `/drop/${DROP_SLUG_DEFAULT}` as const,
  checkout: "/checkout",
} as const;

export type BrandNavItem = {
  href: string;
  label: string;
};

export const BRAND_NAV: readonly BrandNavItem[] = [
  { href: BRAND_ROUTES.philosophy, label: "Philosophy" },
  { href: BRAND_ROUTES.wearables, label: "Wearables" },
  { href: BRAND_ROUTES.dropFeatured, label: "Drops" },
  { href: BRAND_ROUTES.journal, label: "Journal" },
] as const;

/** Homepage portal — large typographic entry links only */
export const PORTAL_LINKS = [
  { href: BRAND_ROUTES.wearables, label: "Wearables" },
  { href: BRAND_ROUTES.dropFeatured, label: "Drops" },
  { href: BRAND_ROUTES.journal, label: "Journal" },
  { href: BRAND_ROUTES.philosophy, label: "Philosophy" },
] as const;
