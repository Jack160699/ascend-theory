/** @deprecated Section anchors — homepage is now a gateway; use `BRAND_ROUTES` for navigation. */
export const BRAND_SECTION_IDS = {
  hero: "hero",
  philosophy: "philosophy",
  wearables: "wearables",
  drop: "drop",
  journal: "journal",
  mentorship: "mentorship",
} as const;

export type BrandSectionId =
  (typeof BRAND_SECTION_IDS)[keyof typeof BRAND_SECTION_IDS];

export { BRAND_NAV, BRAND_ROUTES } from "@/lib/brand/routes";
