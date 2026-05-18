/** Philosophy page — slow editorial reveals (opacity + translateY only). */

export const PHILOSOPHY_EASE = [0.22, 1, 0.36, 1] as const;

export const PHILOSOPHY_DURATION = 0.95;
export const PHILOSOPHY_DURATION_SLOW = 1.15;

export const PHILOSOPHY_STAGGER_LINE = 0.2;
export const PHILOSOPHY_HERO_ECHO_DELAY = 0.3;
export const PHILOSOPHY_AUTHORITY_PAUSE = 0.8;
export const PHILOSOPHY_CTA_DELAY = 0.3;

export const PHILOSOPHY_RISE_HERO = 20;
export const PHILOSOPHY_RISE_LINE = 16;
export const PHILOSOPHY_RISE_PILLAR = 30;

export const PHILOSOPHY_VIEWPORT = {
  once: true,
  amount: 0.35,
  margin: "0px 0px -10% 0px",
} as const;

export const PHILOSOPHY_VIEWPORT_DEEP = {
  once: true,
  amount: 0.25,
  margin: "0px 0px -12% 0px",
} as const;

/** CTA — fires when user nears page bottom */
export const PHILOSOPHY_VIEWPORT_CTA = {
  once: true,
  amount: 0.45,
  margin: "0px 0px -6% 0px",
} as const;
