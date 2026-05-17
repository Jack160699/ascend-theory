/**
 * ASCEND THEORY — global motion rhythm (luxury / cinematic).
 * Section-specific profiles override generic reveal timing.
 */

export const BRAND_TIMING = {
  hero: {
    lineDuration: 1.2,
    bgZoomDuration: 7,
    bgZoomScale: 1.05,
    lineStagger: 0.2,
    pauseAfterLines: 0.2,
    subDuration: 1.05,
    scrollDuration: 1,
    scrollOverlap: 0.35,
    ease: "power3.out" as const,
    delay: 0.15,
  },
  philosophy: {
    duration: 0.85,
    ease: "power1.out" as const,
    start: "top 88%",
    toggleActions: "play none none none" as const,
  },
  cinematic: {
    duration: 1.2,
    scale: 0.96,
    ease: "power2.out" as const,
    start: "top 78%",
    toggleActions: "play none none none" as const,
  },
  fade: {
    duration: 0.9,
    durationMobile: 0.75,
    ease: "power1.out" as const,
    start: "top 90%",
    toggleActions: "play none none none" as const,
  },
  depth: {
    scrub: 0.5,
    range: 20,
    ease: "power1.out" as const,
  },
  wearables: {
    hoverScale: 1.015,
    hoverDuration: 0.55,
  },
} as const;
