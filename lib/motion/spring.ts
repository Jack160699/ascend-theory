/**
 * Shared spring language for surfaces, cards, and tap feedback.
 */

export const SURFACE_SPRING = {
  type: "spring" as const,
  stiffness: 100,
  damping: 48,
};

export const TAP_SPRING = {
  type: "spring" as const,
  stiffness: 128,
  damping: 40,
};
