/**
 * Global cinematic motion tokens — one rhythm site-wide.
 * Pair with `reveal.ts` / `spring.ts`; keep CSS transitions aligned to `HOVER_MS`.
 */

/** Smooth deceleration — editorial landings, not snappy product-demo easing. */
export const EASE_CINEMATIC = [0.33, 1, 0.68, 1] as const;

/** Scroll reveals: later trigger — calmer descent, more silence before motion. */
export const VIEWPORT_CALM = { once: true, margin: "-152px" } as const;

/**
 * Narrow viewports: slightly stricter in-view box than the old `-64px` shorthand
 * so reveals commit when blocks are a bit further into the viewport — calmer
 * compositing during fast thumb scrolls (same easing/durations elsewhere).
 */
export const VIEWPORT_CALM_MOBILE = { once: true, margin: "-80px" } as const;

export const DURATION_REVEAL = 1.08;
export const DURATION_OPACITY = 0.92;
export const DURATION_LINE = 1.12;
export const DURATION_OVERLAY = 0.56;
export const DURATION_OVERLAY_SLOW = 0.68;

export const STAGGER_CHILD = 0.2;
export const STAGGER_LIST = 0.18;

export const DELAY_HEADER = 0.16;
export const DELAY_LIST = 0.2;

/** Vertical travel for scroll fades — slight lift, mostly opacity-led. */
export const RISE_Y = 12;
export const RISE_Y_CARD = 14;

/** Table / dense row cadence (stagger multiplier). */
export const STAGGER_TABLE_ROW = 0.085;

/** Match `premium.css` `--ascend-hover-duration` (desktop default). */
export const HOVER_MS = 520;

/** Imperceptible-to-soft scale — avoids SaaS “bounce” language. */
export const CTA_HOVER_SCALE = 1.004;
export const CTA_TAP_SCALE = 0.996;
export const NAV_INLINE_HOVER_SCALE = 1.006;
export const NAV_INLINE_TAP_SCALE = 0.994;
export const MODAL_ICON_HOVER_SCALE = 1.02;
export const MODAL_ICON_TAP_SCALE = 0.985;
