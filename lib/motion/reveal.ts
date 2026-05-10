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
    transition: txReveal(DURATION_REVEAL * 0.96),
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
    transition: txReveal(0.9),
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

/** Hero typography / CTAs — wider cadence for cinematic orchestration. */
export const heroStaggerCinematic: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.205,
      delayChildren: 0.38,
    },
  },
};

/** Hero headline — first line (orchestrated lead-in). */
export const heroLine1: Variants = {
  hidden: { opacity: 0, y: RISE_Y * 0.55 },
  visible: {
    opacity: 1,
    y: 0,
    transition: txReveal(DURATION_REVEAL * 1.02, 0.4),
  },
};

/** Hero headline — second line (slightly delayed for cinematic read). */
export const heroLine2: Variants = {
  hidden: { opacity: 0, y: RISE_Y * 0.45 },
  visible: {
    opacity: 1,
    y: 0,
    transition: txReveal(DURATION_REVEAL * 1.02, 0.64),
  },
};

const HERO_MOBILE_FACTOR = 0.82;

/** Shorter hero orchestration on mobile — cold traffic hooks faster, desktop unchanged. */
export function getHeroStaggerCinematic(isMobile: boolean): Variants {
  const k = isMobile ? HERO_MOBILE_FACTOR : 1;
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.205 * k,
        delayChildren: 0.38 * k,
      },
    },
  };
}

export function getHeroLine1(isMobile: boolean): Variants {
  const k = isMobile ? HERO_MOBILE_FACTOR : 1;
  const rise = isMobile ? RISE_Y * 0.48 : RISE_Y * 0.55;
  return {
    hidden: { opacity: 0, y: rise },
    visible: {
      opacity: 1,
      y: 0,
      transition: txReveal(DURATION_REVEAL * 1.02 * k, 0.4 * k),
    },
  };
}

export function getHeroLine2(isMobile: boolean): Variants {
  const k = isMobile ? HERO_MOBILE_FACTOR : 1;
  const rise = isMobile ? RISE_Y * 0.4 : RISE_Y * 0.45;
  return {
    hidden: { opacity: 0, y: rise },
    visible: {
      opacity: 1,
      y: 0,
      transition: txReveal(DURATION_REVEAL * 1.02 * k, 0.64 * k),
    },
  };
}

export function getFadeUpReveal(isMobile: boolean): Variants {
  const k = isMobile ? 0.86 : 1;
  return {
    hidden: { opacity: 0, y: RISE_Y * (isMobile ? 0.88 : 1) },
    visible: {
      opacity: 1,
      y: 0,
      transition: txReveal(DURATION_REVEAL * k),
    },
  };
}
