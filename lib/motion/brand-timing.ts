/**
 * ASCEND THEORY — global motion rhythm (luxury / cinematic).
 * Transform + opacity only. Durations ≥ 0.6s.
 */

export const BRAND_TIMING = {
  hero: {
    lineDuration: 1.25,
    lineStagger: 0.2,
    pauseAfterLines: 0.2,
    subDuration: 1.05,
    scrollDuration: 1,
    scrollOverlap: 0.35,
    ease: "power3.out" as const,
    delay: 0.15,
  },
  reveal: {
    duration: 1,
    durationMobile: 0.9,
    yHigh: 60,
    yLow: 40,
    yHighMobile: 44,
    yLowMobile: 32,
    ease: "power2.out" as const,
    staggerDelay: 0.2,
    start: "top 85%",
    toggleActions: "play none none none" as const,
  },
  section: {
    duration: 1,
    y: 20,
    yMobile: 14,
    ease: "power2.out" as const,
    start: "top 92%",
    toggleActions: "play none none none" as const,
  },
  depth: {
    scrub: 0.5,
    range: 20,
    ease: "power1.out" as const,
  },
  hover: {
    duration: 0.5,
  },
} as const;
