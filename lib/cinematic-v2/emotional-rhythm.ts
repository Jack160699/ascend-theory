import { HOME_SCENE_ORDER, type HomeSceneId } from "./cinematic-layout";

/**
 * Cinematic emotional rhythm — pacing and density without “animation theatre”.
 * Each scene has a target emotional posture; scroll geometry blends them early
 * (handoff begins before the next scene fully occupies the frame).
 */

export type SceneEmotionalProfile = {
  /** 0 = open / spacious read, 1 = intimate / compressed pressure */
  density: number;
  /** 0 = tight vertical rhythm, 1 = airy typographic breath */
  breath: number;
  /** −1…1 shifts global cool/warm atmospheric bias while this posture dominates */
  atmosphereBias: number;
  /** Viewport fraction: blend toward the next scene starts this far above scene bottom */
  handoffLeadVh: number;
  /** Viewport fraction: blend completes this far past the next scene’s top */
  handoffLagVh: number;
};

export const HOME_SCENE_EMOTION: Record<HomeSceneId, SceneEmotionalProfile> = {
  interruption: {
    density: 0.28,
    breath: 0.68,
    atmosphereBias: 0.14,
    handoffLeadVh: 0.42,
    handoffLagVh: 0.34,
  },
  mirror: {
    density: 0.82,
    breath: 0.26,
    atmosphereBias: -0.06,
    handoffLeadVh: 0.36,
    handoffLagVh: 0.3,
  },
  realization: {
    density: 0.55,
    breath: 0.48,
    atmosphereBias: -0.02,
    handoffLeadVh: 0.38,
    handoffLagVh: 0.32,
  },
  system: {
    density: 0.74,
    breath: 0.34,
    atmosphereBias: 0.04,
    handoffLeadVh: 0.34,
    handoffLagVh: 0.28,
  },
  brotherhood: {
    density: 0.36,
    breath: 0.64,
    atmosphereBias: 0.22,
    handoffLeadVh: 0.4,
    handoffLagVh: 0.36,
  },
  transformation: {
    density: 0.42,
    breath: 0.68,
    atmosphereBias: 0.1,
    handoffLeadVh: 0.36,
    handoffLagVh: 0.32,
  },
  entry: {
    density: 0.32,
    breath: 0.62,
    atmosphereBias: 0.04,
    handoffLeadVh: 0.38,
    handoffLagVh: 0.34,
  },
};

/** Static spatial posture — drives min-height and vertical padding (not scroll-tweened). */
export type SceneSpatialPosture = "intimate" | "standard" | "open";

export const HOME_SCENE_SPATIAL: Record<HomeSceneId, SceneSpatialPosture> = {
  interruption: "open",
  mirror: "intimate",
  realization: "standard",
  system: "intimate",
  brotherhood: "open",
  transformation: "open",
  entry: "open",
};

export type EmotionalRhythmSnapshot = {
  /** 0–1 arc across the cinematic main (slowed for gradual atmosphere drift) */
  narrativeAtmosphere: number;
  /** Blended target density 0–1 */
  emotionalDensity: number;
  /** Blended typographic breath 0–1 */
  spatialBreath: number;
  /** How deep we are in a subconscious handoff toward the next scene (0–1) */
  emotionalHandoff: number;
  /** Blended atmosphere bias −1…1 */
  atmosphereBias: number;
  /** Immersion pull — rises with narrative depth and active handoff */
  continuityDepth: number;
};

function clamp01(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t;
}

/** Cubic smoothstep for invisible easing of handoff zones */
function smoothstep3(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function dominantSceneIndex(
  metrics: { top: number; bottom: number }[],
  focusDoc: number,
): number {
  const n = metrics.length;
  for (let i = 0; i < n; i++) {
    if (focusDoc >= metrics[i].top && focusDoc < metrics[i].bottom) return i;
  }
  if (focusDoc < metrics[0].top) return 0;
  return n - 1;
}

/**
 * Computes blended emotional state from layout + scroll. Uses document-anchored
 * metrics so Lenis-smoothed scroll still matches visible scene geometry.
 */
export function computeEmotionalRhythmSnapshot(
  scenes: HTMLElement[],
  scrollY: number,
  viewportH: number,
  narrativeProgress: number,
): EmotionalRhythmSnapshot {
  const n = scenes.length;
  const narrativeAtmosphere = smoothstep3(clamp01(narrativeProgress));

  if (n === 0) {
    return {
      narrativeAtmosphere,
      emotionalDensity: 0.5,
      spatialBreath: 0.5,
      emotionalHandoff: 0,
      atmosphereBias: 0,
      continuityDepth: narrativeAtmosphere * 0.5,
    };
  }

  const focusDoc = scrollY + viewportH * 0.52;

  const metrics = scenes.map((el) => {
    const r = el.getBoundingClientRect();
    return {
      top: r.top + scrollY,
      bottom: r.bottom + scrollY,
    };
  });

  let bestBoundary = -1;
  let bestHandoffT = 0;

  for (let i = 0; i < n - 1; i++) {
    const id0 = HOME_SCENE_ORDER[i];
    const id1 = HOME_SCENE_ORDER[i + 1];
    const e0 = HOME_SCENE_EMOTION[id0];
    const e1 = HOME_SCENE_EMOTION[id1];
    const bottomA = metrics[i].bottom;
    const topB = metrics[i + 1].top;
    const lead = Math.max(e0.handoffLeadVh, 0.22) * viewportH;
    const lag = Math.max(e1.handoffLagVh, 0.16) * viewportH;
    const zoneStart = bottomA - lead;
    const zoneEnd = topB + lag;
    if (focusDoc >= zoneStart && focusDoc <= zoneEnd) {
      const rawT = (focusDoc - zoneStart) / Math.max(1, zoneEnd - zoneStart);
      const t = smoothstep3(rawT);
      if (bestBoundary < 0 || t > bestHandoffT) {
        bestBoundary = i;
        bestHandoffT = t;
      }
    }
  }

  let emotionalDensity: number;
  let spatialBreath: number;
  let atmosphereBias: number;
  let emotionalHandoff = 0;

  if (bestBoundary >= 0) {
    const id0 = HOME_SCENE_ORDER[bestBoundary];
    const id1 = HOME_SCENE_ORDER[bestBoundary + 1];
    const e0 = HOME_SCENE_EMOTION[id0];
    const e1 = HOME_SCENE_EMOTION[id1];
    const t = bestHandoffT;
    emotionalHandoff = t;
    emotionalDensity = lerp(e0.density, e1.density, t);
    spatialBreath = lerp(e0.breath, e1.breath, t);
    atmosphereBias = lerp(e0.atmosphereBias, e1.atmosphereBias, t);
  } else {
    const d = dominantSceneIndex(metrics, focusDoc);
    const id = HOME_SCENE_ORDER[d];
    const e = HOME_SCENE_EMOTION[id];
    emotionalDensity = e.density;
    spatialBreath = e.breath;
    atmosphereBias = e.atmosphereBias;
  }

  const continuityDepth = clamp01(
    narrativeAtmosphere * 0.62 + emotionalHandoff * 0.38,
  );

  return {
    narrativeAtmosphere,
    emotionalDensity,
    spatialBreath,
    emotionalHandoff,
    atmosphereBias,
    continuityDepth,
  };
}
