/**
 * Cinematic V2 — layout tokens and DOM contract for scene-based scroll.
 * Visual design passes extend these; this module stays motion/DOM only.
 */

/** CSS custom properties driven by `MasterSceneOrchestrator` (transform-only consumers later). */
export const CINEMATIC_CSS_VARS = {
  scrollProgress: "--ascend-cinematic-scroll-progress",
  activeSceneIndex: "--ascend-cinematic-active-scene-index",
  sceneCount: "--ascend-cinematic-scene-count",
} as const;

/** Ordered narrative scenes on the home experience (index = scroll progression order). */
export const HOME_SCENE_ORDER = [
  "hero",
  "philosophy",
  "brotherhood",
  "programs",
  "pricing",
  "testimonials",
  "final",
] as const;

export type HomeSceneId = (typeof HOME_SCENE_ORDER)[number];

const sceneIndex = Object.fromEntries(
  HOME_SCENE_ORDER.map((id, index) => [id, index]),
) as Record<HomeSceneId, number>;

/**
 * Stable `data-*` contract for scene roots. Use on each top-level scene `<section>`
 * under `#ascend-cinematic-main` so the master orchestrator can query a minimal set.
 */
export function cinematicSceneRootProps(id: HomeSceneId) {
  return {
    "data-cinematic-scene": "",
    "data-scene-id": id,
    "data-scene-index": String(sceneIndex[id]),
  } as const;
}
