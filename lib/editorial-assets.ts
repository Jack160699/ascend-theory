/**
 * Local editorial imagery under `public/images/ascend/`.
 * Stable paths — no remote image hosts at runtime.
 */
export const EDITORIAL_ASSETS = {
  training: "/images/ascend/training.jpg",
  silhouette: "/images/ascend/silhouette.jpg",
  focus: "/images/ascend/focus.jpg",
  presence: "/images/ascend/presence.jpg",
  lifestyle: "/images/ascend/lifestyle.jpg",
} as const;

export type EditorialAssetKey = keyof typeof EDITORIAL_ASSETS;
