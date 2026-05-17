/** Per-section motion profile — drives GSAP registration in `brand-reveal.ts`. */
export const BRAND_MOTION = {
  hero: "hero",
  philosophy: "philosophy",
  wearables: "wearables",
  cinematic: "cinematic",
  static: "static",
  fade: "fade",
} as const;

export type BrandMotionProfile =
  (typeof BRAND_MOTION)[keyof typeof BRAND_MOTION];

export function brandMotionAttr(profile: BrandMotionProfile) {
  return { "data-brand-motion": profile } as const;
}
