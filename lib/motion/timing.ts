/**
 * Global cinematic motion tokens — one rhythm site-wide.
 * Pair with `reveal.ts` / `spring.ts`; keep CSS transitions aligned to `HOVER_MS`.
 */

export const EASE_CINEMATIC = [0.14, 0.88, 0.32, 1] as const;

/** Scroll reveals: later trigger — calmer descent, more silence before motion. */
export const VIEWPORT_CALM = { once: true, margin: "-152px" } as const;

/**
 * Narrow viewports: slightly stricter in-view box than the old `-64px` shorthand
 * so reveals commit when blocks are a bit further into the viewport — calmer
 * compositing during fast thumb scrolls (same easing/durations elsewhere).
 */
export const VIEWPORT_CALM_MOBILE = { once: true, margin: "-80px" } as const;

export const DURATION_REVEAL = 0.88;
export const DURATION_OPACITY = 0.72;
export const DURATION_LINE = 0.92;
export const DURATION_OVERLAY = 0.44;
export const DURATION_OVERLAY_SLOW = 0.52;

export const STAGGER_CHILD = 0.165;
export const STAGGER_LIST = 0.145;

export const DELAY_HEADER = 0.12;
export const DELAY_LIST = 0.16;

/** Vertical travel for scroll fades — slightly shorter for grounded landings. */
export const RISE_Y = 18;
export const RISE_Y_CARD = 20;

/** Table / dense row cadence (stagger multiplier). */
export const STAGGER_TABLE_ROW = 0.07;

/** Match `premium.css` `--ascend-hover-duration` (desktop default). */
export const HOVER_MS = 440;
