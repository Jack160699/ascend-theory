/**
 * Ascend Theory — brand lifestyle stills (remote stock, optimized via next/image).
 */
import { STOCK_IMAGES } from "@/lib/stock-media";

export const ASCEND_IMAGES = { ...STOCK_IMAGES } as const;

/** @deprecated Use `ASCEND_IMAGES` — aliases for legacy section imports. */
export const CINEMATIC_ASSETS = {
  heroRooftopSunrise: ASCEND_IMAGES.heroStorefront,
  philosophyLibrary: ASCEND_IMAGES.editorialArchitecture,
  brotherhoodWalk: ASCEND_IMAGES.brotherhoodDining,
  systemsPlanningWall: ASCEND_IMAGES.teamStudio,
  leadershipLounge: ASCEND_IMAGES.teamStudio,
  lifestyleRooftopStanding: ASCEND_IMAGES.lifestyleCoastal,
} as const;
