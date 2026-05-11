import type { HomeSceneId } from "./cinematic-layout";

/**
 * Narrative “world” tokens — drive continuity rails, `data-scene-environment`,
 * and copy tone in design passes. Not user-facing strings.
 */
export type SceneNarrativeKind =
  | "drift"
  | "intimate"
  | "geometric"
  | "order"
  | "human"
  | "clear"
  | "minimal";

export const HOME_SCENE_NARRATIVE_KIND: Record<HomeSceneId, SceneNarrativeKind> =
  {
    interruption: "drift",
    mirror: "intimate",
    realization: "geometric",
    system: "order",
    brotherhood: "human",
    transformation: "clear",
    entry: "minimal",
  };

/** Continuity rail modifier class suffix (see `globals.css` `.ascend-scene-rail--*`). */
export function sceneRailClass(scene: HomeSceneId): string {
  return `ascend-scene-rail--${HOME_SCENE_NARRATIVE_KIND[scene]}`;
}
