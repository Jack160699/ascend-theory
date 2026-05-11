/**
 * Shared spring language for surfaces, cards, and tap feedback.
 */

export const SURFACE_SPRING = {
  type: "spring" as const,
  stiffness: 152,
  damping: 38,
};

export const TAP_SPRING = {
  type: "spring" as const,
  stiffness: 196,
  damping: 34,
};
