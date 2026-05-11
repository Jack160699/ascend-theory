/**
 * @deprecated Prefer `CINEMATIC_ASSETS` from `@/lib/cinematic-assets` for new work.
 * Aliases preserved for incremental refactors.
 */
import { CINEMATIC_ASSETS } from "@/lib/cinematic-assets";

export { CINEMATIC_ASSETS } from "@/lib/cinematic-assets";

/** Legacy keys → new cinematic stills */
export const EDITORIAL_ASSETS = {
  communication: CINEMATIC_ASSETS.brotherhoodWalk,
  structureRoutine: CINEMATIC_ASSETS.systemsPlanningWall,
  presenceComposed: CINEMATIC_ASSETS.leadershipLounge,
  identityReflection: CINEMATIC_ASSETS.philosophyLibrary,
  deepWork: CINEMATIC_ASSETS.systemsPlanningWall,
  accountabilityReview: CINEMATIC_ASSETS.leadershipLounge,
  physiqueAnchor: CINEMATIC_ASSETS.lifestyleRooftopStanding,
} as const;

export type EditorialAssetKey = keyof typeof EDITORIAL_ASSETS;
