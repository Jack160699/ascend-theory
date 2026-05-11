import type { EmotionalRhythmSnapshot } from "./emotional-rhythm";

/** CSS surface for emotional rhythm — consumers use transform/opacity only upstream. */
export const EMOTIONAL_RHYTHM_CSS_VARS = {
  narrativeAtmosphere: "--ascend-narrative-atmosphere",
  emotionalDensity: "--ascend-emotional-density",
  spatialBreath: "--ascend-spatial-breath",
  emotionalHandoff: "--ascend-emotional-handoff",
  atmosphereBias: "--ascend-atmosphere-bias",
  continuityDepth: "--ascend-continuity-depth",
} as const;

export function applyEmotionalRhythmVars(
  root: HTMLElement,
  snapshot: EmotionalRhythmSnapshot,
) {
  const v = EMOTIONAL_RHYTHM_CSS_VARS;
  root.style.setProperty(
    v.narrativeAtmosphere,
    snapshot.narrativeAtmosphere.toFixed(5),
  );
  root.style.setProperty(v.emotionalDensity, snapshot.emotionalDensity.toFixed(5));
  root.style.setProperty(v.spatialBreath, snapshot.spatialBreath.toFixed(5));
  root.style.setProperty(v.emotionalHandoff, snapshot.emotionalHandoff.toFixed(5));
  root.style.setProperty(v.atmosphereBias, snapshot.atmosphereBias.toFixed(5));
  root.style.setProperty(v.continuityDepth, snapshot.continuityDepth.toFixed(5));
}

export function clearEmotionalRhythmVars(root: HTMLElement) {
  Object.values(EMOTIONAL_RHYTHM_CSS_VARS).forEach((key) => {
    root.style.removeProperty(key);
  });
}
