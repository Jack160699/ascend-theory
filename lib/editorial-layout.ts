/**
 * Phase 2 — shared editorial canvas + lead alignment.
 * Asymmetric horizontal padding and alternating lead blocks reduce
 * “centered template” cadence while preserving section order and copy.
 */

/** Default section shell (~72rem) with slight optical left weight */
export const shellStandard =
  "relative z-10 mx-auto w-full max-w-6xl px-6 sm:px-10 lg:pl-[4.5rem] lg:pr-10 xl:pl-[4.75rem] xl:pr-12";

/** Wide shell for pricing grid, comparison table, proof collage */
export const shellWide =
  "relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10 lg:pl-14 lg:pr-11 xl:pl-16 xl:pr-12";

/** Mentorship depth stack — narrower measure */
export const shellNarrow =
  "relative z-10 mx-auto w-full max-w-3xl px-6 sm:px-10 lg:max-w-4xl lg:pl-14 lg:pr-11 xl:pl-16 xl:pr-12";

/** Hero / full-bleed narrative column */
export const shellHero =
  "relative z-10 mx-auto flex w-full max-w-[min(80rem,100%)] flex-1 flex-col justify-center px-6 pb-[max(5rem,env(safe-area-inset-bottom)+4.5rem)] pt-[5.75rem] sm:px-10 sm:pb-36 sm:pt-[6.75rem] lg:pl-[4.25rem] lg:pr-[5.5rem] lg:pb-40 lg:pt-[7.5rem]";

/** Long-form reading width — assessment, calibration blocks */
export const shellReading =
  "relative z-10 mx-auto w-full max-w-[min(40rem,100%)] px-6 sm:px-10 lg:max-w-[42rem] lg:pl-[4.25rem] lg:pr-14";

/** Legal / trust documents — narrow editorial measure */
export const shellLegal =
  "relative z-10 mx-auto w-full max-w-[min(36rem,100%)] px-6 pt-12 pb-24 sm:px-10 sm:pt-16 sm:pb-28 lg:max-w-[38rem] lg:pl-[4.25rem] lg:pr-14";

/** Left-anchored section lead (eyebrow + title + dek) */
export const leadLeft =
  "w-full text-left max-w-[min(42rem,100%)] lg:max-w-[41rem]";

/** Right-anchored on large screens for editorial alternation */
export const leadRight =
  "w-full text-left lg:ml-auto lg:mr-0 lg:max-w-[min(42rem,100%)] lg:pl-4 xl:pl-8";

/** Comfortable body measure under a lead */
export const measureProse = "max-w-[34rem] text-pretty";
