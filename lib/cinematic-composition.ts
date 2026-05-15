import { ASCEND_IMAGES } from "./cinematic-assets";

export type AscendImageKey = keyof typeof ASCEND_IMAGES;

/** @deprecated Use `AscendImageKey` */
export type CinematicAssetKey = AscendImageKey;

const DEFAULT = "object-cover object-center";

/**
 * Mobile-first `object-cover` + `object-position` for brand stills.
 */
export const ASCEND_IMAGE_CLASS = {
  heroStorefront:
    "object-cover object-[50%_30%] sm:object-[52%_28%] lg:object-[50%_24%]",
  editorialArchitecture:
    "object-cover object-[50%_30%] sm:object-[52%_28%] lg:object-[50%_24%]",
  brotherhoodDining:
    "object-cover object-[48%_44%] sm:object-[50%_40%] lg:object-[48%_38%]",
  teamStudio:
    "object-cover object-[center_45%] sm:object-[48%_42%] lg:object-[center_40%]",
  lifestyleGolf:
    "object-cover object-[50%_40%] sm:object-[48%_36%] lg:object-[50%_32%]",
  lifestyleAirport:
    "object-cover object-[42%_40%] sm:object-[center_38%] lg:object-[48%_35%]",
  lifestyleCoastal:
    "object-cover object-[center_55%] sm:object-[center_48%] lg:object-[center_42%]",
} as const satisfies Record<AscendImageKey, string>;

/** @deprecated Use `ASCEND_IMAGE_CLASS` — includes legacy key aliases. */
export const CINEMATIC_IMAGE_CLASS = {
  ...ASCEND_IMAGE_CLASS,
  heroRooftopSunrise: ASCEND_IMAGE_CLASS.heroStorefront,
  philosophyLibrary: ASCEND_IMAGE_CLASS.editorialArchitecture,
  brotherhoodWalk: ASCEND_IMAGE_CLASS.brotherhoodDining,
  systemsPlanningWall: ASCEND_IMAGE_CLASS.teamStudio,
  leadershipLounge: ASCEND_IMAGE_CLASS.teamStudio,
  lifestyleRooftopStanding: ASCEND_IMAGE_CLASS.lifestyleCoastal,
} as const;

export const ASCEND_THUMB_CLASS: Partial<Record<AscendImageKey, string>> = {
  heroStorefront: "object-cover object-[center_32%]",
  teamStudio: "object-cover object-[center_38%]",
  lifestyleAirport: "object-cover object-[45%_36%]",
};

/** @deprecated Use `ASCEND_THUMB_CLASS` */
export const CINEMATIC_THUMB_CLASS = ASCEND_THUMB_CLASS;

export function ascendImageClassForSrc(src: string): string {
  const key = (Object.keys(ASCEND_IMAGES) as AscendImageKey[]).find(
    (k) => ASCEND_IMAGES[k] === src,
  );
  return key ? ASCEND_IMAGE_CLASS[key] : DEFAULT;
}

export function cinematicImageClassForSrc(src: string): string {
  return ascendImageClassForSrc(src);
}

export function ascendThumbClassForSrc(src: string): string {
  const key = (Object.keys(ASCEND_IMAGES) as AscendImageKey[]).find(
    (k) => ASCEND_IMAGES[k] === src,
  );
  if (!key) return DEFAULT;
  return ASCEND_THUMB_CLASS[key] ?? ascendImageClassForSrc(src);
}

export function cinematicThumbClassForSrc(src: string): string {
  return ascendThumbClassForSrc(src);
}
