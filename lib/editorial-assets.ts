/**
 * Local editorial imagery under `public/images/ascend/`.
 * Weighted toward identity, presence, communication, and structure —
 * `physiqueAnchor` is the single movement/conditioning layer (use sparingly).
 */
export const EDITORIAL_ASSETS = {
  communication: "/images/ascend/communication.jpg",
  structureRoutine: "/images/ascend/structure.jpg",
  presenceComposed: "/images/ascend/presence-editorial.jpg",
  identityReflection: "/images/ascend/reflection.jpg",
  deepWork: "/images/ascend/deep-work.jpg",
  accountabilityReview: "/images/ascend/accountability.jpg",
  /** Movement / conditioning — one layer of the system, not the headline. */
  physiqueAnchor: "/images/ascend/training.jpg",
} as const;

export type EditorialAssetKey = keyof typeof EDITORIAL_ASSETS;
