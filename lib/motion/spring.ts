/**
 * Shared spring language for surfaces, cards, and tap feedback.
 */

export const SURFACE_SPRING = {
  type: "spring" as const,
  stiffness: 198,
  damping: 36,
};

export const TAP_SPRING = {
  type: "spring" as const,
  stiffness: 238,
  damping: 32,
};
