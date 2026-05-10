import type { Transition, Variants } from "framer-motion";
import {
  DELAY_HEADER,
  DELAY_LIST,
  DURATION_LINE,
  DURATION_OPACITY,
  DURATION_REVEAL,
  EASE_CINEMATIC,
  RISE_Y,
  RISE_Y_CARD,
  STAGGER_CHILD,
  STAGGER_LIST,
} from "./timing";

export function txReveal(duration: number, delay = 0): Transition {
  return { duration, delay, ease: EASE_CINEMATIC };
}

export const headerStaggerParent: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER_CHILD,
      delayChildren: DELAY_HEADER,
    },
  },
};

/** Stagger container without opacity flash (e.g. timeline children). */
export const listStaggerParent: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_LIST,
      delayChildren: DELAY_LIST,
    },
  },
};

/** Grids / two-column rows that should fade the parent in. */
export const gridStaggerParent: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER_LIST,
      delayChildren: DELAY_HEADER,
    },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: RISE_Y },
  visible: {
    opacity: 1,
    y: 0,
    transition: txReveal(DURATION_REVEAL),
  },
};

export const fadeUpChild: Variants = {
  hidden: { opacity: 0, y: RISE_Y_CARD },
  visible: {
    opacity: 1,
    y: 0,
    transition: txReveal(DURATION_REVEAL * 0.98),
  },
};

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: RISE_Y_CARD },
  visible: {
    opacity: 1,
    y: 0,
    transition: txReveal(DURATION_REVEAL),
  },
};

/** Timeline / node marks — minimal scale, no “pop”. */
export const nodeRevealSoft: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: txReveal(0.82),
  },
};

export const lineDrawHorizontal: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { ...txReveal(DURATION_LINE), delay: 0.18 },
  },
};

export const opacityIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: txReveal(DURATION_OPACITY),
  },
};

/** Hero load: same stagger language, slightly longer lead-in. */
export const heroStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER_CHILD,
      delayChildren: 0.22,
    },
  },
};
