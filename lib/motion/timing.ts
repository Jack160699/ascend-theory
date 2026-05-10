/**
 * Global cinematic motion tokens — one rhythm site-wide.
 * Pair with `reveal.ts` / `spring.ts`; keep CSS transitions aligned to `HOVER_MS`.
 */

export const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const;

/** Scroll reveals: calm, slightly delayed trigger. */
export const VIEWPORT_CALM = { once: true, margin: "-120px" } as const;

export const DURATION_REVEAL = 0.94;
export const DURATION_OPACITY = 0.82;
export const DURATION_LINE = 1.02;
export const DURATION_OVERLAY = 0.42;
export const DURATION_OVERLAY_SLOW = 0.48;

export const STAGGER_CHILD = 0.15;
export const STAGGER_LIST = 0.13;

export const DELAY_HEADER = 0.1;
export const DELAY_LIST = 0.14;

/** Vertical travel for scroll fades — restrained, unified. */
export const RISE_Y = 22;
export const RISE_Y_CARD = 24;

/** Table / dense row cadence (stagger multiplier). */
export const STAGGER_TABLE_ROW = 0.07;

/** Match `premium.css` button transitions. */
export const HOVER_MS = 320;
