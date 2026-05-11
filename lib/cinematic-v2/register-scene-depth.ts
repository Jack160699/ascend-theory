import gsap from "gsap";
import {
  CINEMATIC_ATMOS_Y,
  CINEMATIC_ATMOS_SCRUB,
  CINEMATIC_CAMERA_ROTATE_X,
  CINEMATIC_CAMERA_Y,
  CINEMATIC_DEPTH_ATTENUATION,
  CINEMATIC_SCROLL_SCRUB,
} from "./scroll-motion";

function parseAmp(raw: string | undefined, fallback: number): number {
  const n = parseFloat(raw ?? "");
  return Number.isFinite(n) ? n : fallback;
}

/**
 * One timeline per scene: parallax layers, fog, and camera rig share one scrub —
 * a single architectural move, not stacked independent parallax.
 */
export function registerSceneDepthTimeline(
  scene: HTMLElement,
  options: { mobile: boolean },
): gsap.core.Timeline | null {
  const { mobile } = options;

  const layers = scene.querySelectorAll<HTMLElement>("[data-cinematic-parallax]");
  const fogs = scene.querySelectorAll<HTMLElement>("[data-cinematic-fog]");
  const camera = scene.querySelector<HTMLElement>("[data-scene-camera]");

  if (!layers.length && !fogs.length && !camera) return null;

  const ampPx = (raw: string | undefined, fallback: number) => {
    const base = parseAmp(raw, fallback) * CINEMATIC_DEPTH_ATTENUATION;
    return mobile ? base * 0.62 : base;
  };

  const nL = layers.length;
  const denom = Math.max(nL - 1, 1);

  const tl = gsap.timeline({
    defaults: { ease: "none", force3D: true },
    scrollTrigger: {
      trigger: scene,
      start: "top bottom",
      end: "bottom top",
      scrub: CINEMATIC_SCROLL_SCRUB,
      invalidateOnRefresh: true,
    },
  });

  layers.forEach((layer, idx) => {
    const raw = ampPx(layer.dataset.cinematicParallax, 9);
    const depthWeight = 0.4 + (idx / denom) * 0.48;
    const range = raw * depthWeight * 0.5;
    tl.fromTo(layer, { y: -range }, { y: range, duration: 1 }, 0);
  });

  fogs.forEach((fog) => {
    const drift = ampPx(fog.dataset.cinematicFog, 5) * 0.32;
    tl.fromTo(fog, { y: -drift * 0.5 }, { y: drift * 0.5, duration: 1 }, 0);
  });

  if (camera) {
    const yPct = mobile ? CINEMATIC_CAMERA_Y.mobile : CINEMATIC_CAMERA_Y.desktop;
    tl.fromTo(
      camera,
      {
        y: `${yPct}%`,
        rotateX: CINEMATIC_CAMERA_ROTATE_X.enter,
        transformOrigin: "50% 45%",
      },
      {
        y: `-${yPct}%`,
        rotateX: CINEMATIC_CAMERA_ROTATE_X.exit,
        duration: 1,
      },
      0,
    );
  }

  return tl;
}

/** Fixed atmosphere — very slow vertical drift tied to document scroll. */
export function registerGlobalAtmosphereDrift(
  main: HTMLElement,
  atmosDepth: HTMLElement | null,
): gsap.core.Timeline | null {
  if (!atmosDepth) return null;

  return gsap
    .timeline({
      defaults: { ease: "none", force3D: true },
      scrollTrigger: {
        trigger: main,
        start: "top top",
        end: "bottom bottom",
        scrub: CINEMATIC_ATMOS_SCRUB,
        invalidateOnRefresh: true,
      },
    })
    .fromTo(
      atmosDepth,
      { y: -CINEMATIC_ATMOS_Y },
      { y: CINEMATIC_ATMOS_Y, duration: 1 },
      0,
    );
}
