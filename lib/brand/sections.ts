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

export const BRAND_NAV = [
  { id: BRAND_SECTION_IDS.philosophy, label: "Philosophy" },
  { id: BRAND_SECTION_IDS.wearables, label: "Wearables" },
  { id: BRAND_SECTION_IDS.drop, label: "Drop" },
  { id: BRAND_SECTION_IDS.journal, label: "Journal" },
  { id: BRAND_SECTION_IDS.mentorship, label: "Sessions" },
] as const;
