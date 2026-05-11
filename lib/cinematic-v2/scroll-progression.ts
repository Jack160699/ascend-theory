import { CINEMATIC_CSS_VARS } from "./cinematic-layout";

const { scrollProgress, activeSceneIndex, sceneCount } = CINEMATIC_CSS_VARS;

export type ScrollProgressionSnapshot = {
  globalProgress: number;
  activeSceneIndex: number;
  sceneCount: number;
};

export function applyScrollProgressionVars(
  root: HTMLElement,
  snapshot: Partial<ScrollProgressionSnapshot>,
) {
  if (snapshot.globalProgress !== undefined) {
    root.style.setProperty(scrollProgress, snapshot.globalProgress.toFixed(5));
  }
  if (snapshot.activeSceneIndex !== undefined) {
    root.style.setProperty(
      activeSceneIndex,
      String(Math.max(0, snapshot.activeSceneIndex)),
    );
  }
  if (snapshot.sceneCount !== undefined) {
    root.style.setProperty(sceneCount, String(snapshot.sceneCount));
  }
}

export function clearScrollProgressionVars(root: HTMLElement) {
  root.style.removeProperty(scrollProgress);
  root.style.removeProperty(activeSceneIndex);
  root.style.removeProperty(sceneCount);
}
