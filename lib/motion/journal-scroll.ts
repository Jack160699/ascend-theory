/** Lenis profiles — editorial heaviness for Journal */

export const LENIS_EDITORIAL = {
  duration: 1.72,
  wheelMultiplier: 0.68,
  touchMultiplier: 0.82,
  smoothWheel: true,
  syncTouch: false,
} as const;

export const LENIS_DEFAULT = {
  duration: 1.25,
  wheelMultiplier: 0.9,
  touchMultiplier: 1,
  smoothWheel: true,
  syncTouch: false,
} as const;

export const LENIS_EASING = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
