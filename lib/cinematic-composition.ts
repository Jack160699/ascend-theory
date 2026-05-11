import { CINEMATIC_ASSETS } from "./cinematic-assets";

export type CinematicAssetKey = keyof typeof CINEMATIC_ASSETS;

/**
 * Mobile-first `object-cover` + `object-position` for each cinematic master.
 * Defaults favor faces / readable focal points on narrow viewports; desktop
 * relaxes toward wider framing.
 */
export const CINEMATIC_IMAGE_CLASS = {
  heroRooftopSunrise:
    "object-cover object-[78%_28%] sm:object-[74%_30%] md:object-[68%_34%] lg:object-[62%_35%]",
  philosophyLibrary:
    "object-cover object-[54%_24%] sm:object-[52%_26%] lg:object-[50%_30%]",
  brotherhoodWalk:
    "object-cover object-[42%_30%] sm:object-[48%_36%] lg:object-[center_40%]",
  systemsPlanningWall:
    "object-cover object-[46%_42%] sm:object-[50%_40%] lg:object-[center_44%]",
  leadershipLounge:
    "object-cover object-[52%_22%] sm:object-[51%_24%] lg:object-[center_28%]",
  lifestyleRooftopStanding:
    "object-cover object-[50%_18%] sm:object-[center_22%] lg:object-[center_28%]",
} as const satisfies Record<CinematicAssetKey, string>;

/** Tight horizontal strips / small thumbs — bias toward faces or legible wall band. */
export const CINEMATIC_THUMB_CLASS: Partial<Record<CinematicAssetKey, string>> = {
  philosophyLibrary: "object-cover object-[52%_16%]",
  systemsPlanningWall: "object-cover object-[40%_52%]",
};

const DEFAULT = "object-cover object-center";

export function cinematicImageClassForSrc(src: string): string {
  const key = (Object.keys(CINEMATIC_ASSETS) as CinematicAssetKey[]).find(
    (k) => CINEMATIC_ASSETS[k] === src,
  );
  return key ? CINEMATIC_IMAGE_CLASS[key] : DEFAULT;
}

export function cinematicThumbClassForSrc(src: string): string {
  const key = (Object.keys(CINEMATIC_ASSETS) as CinematicAssetKey[]).find(
    (k) => CINEMATIC_ASSETS[k] === src,
  );
  if (!key) return DEFAULT;
  return CINEMATIC_THUMB_CLASS[key] ?? cinematicImageClassForSrc(src);
}
