/**
 * Shared spring language for surfaces, cards, and tap feedback.
 */

export const SURFACE_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
};

export const TAP_SPRING = {
  type: "spring" as const,
  stiffness: 340,
  damping: 26,
};
