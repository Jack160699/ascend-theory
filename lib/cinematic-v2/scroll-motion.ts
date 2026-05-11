/**
 * ASCEND THEORY V2 — scroll-linked motion language.
 * Restrained, single-rig timing: one scrub lag site-wide, transform-only.
 */

/** One ScrollTrigger scrub lag (seconds) — higher = heavier, calmer settle. */
export const CINEMATIC_SCROLL_SCRUB = 1.72;

/** Global fixed atmosphere — even slower, barely perceptible drift. */
export const CINEMATIC_ATMOS_SCRUB = 2.35;

/** Pull parallax dataset amplitudes down — avoids “demo parallax”. */
export const CINEMATIC_DEPTH_ATTENUATION = 0.46;

/** Vertical travel for the camera column (% of self) — architectural, not flashy. */
export const CINEMATIC_CAMERA_Y = {
  mobile: 1.05,
  desktop: 1.55,
} as const;

/** Subtle perspective drift on the camera rig (deg). Keep near-flat. */
export const CINEMATIC_CAMERA_ROTATE_X = {
  enter: 0.42,
  exit: -0.36,
} as const;

/** Global atmosphere plane (px) — single-digit only. */
export const CINEMATIC_ATMOS_Y = 5;

/** Non–scroll-linked eases (modals, etc.) — slow in/out, no bounce. */
export const CINEMATIC_EASE_SOFT = "power2.inOut";
export const CINEMATIC_EASE_OUT = "power3.out";
