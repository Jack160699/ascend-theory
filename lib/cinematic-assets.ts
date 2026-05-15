/**
 * Ascend Theory — brand lifestyle stills (`public/images/ascend/`).
 */
export const ASCEND_IMAGES = {
  heroStorefront: "/images/ascend/hero-storefront.webp",
  editorialArchitecture: "/images/ascend/editorial-architecture.webp",
  brotherhoodDining: "/images/ascend/brotherhood-dining.webp",
  teamStudio: "/images/ascend/team-studio.webp",
  lifestyleGolf: "/images/ascend/lifestyle-golf.webp",
  lifestyleAirport: "/images/ascend/lifestyle-airport.webp",
  lifestyleCoastal: "/images/ascend/lifestyle-coastal.webp",
} as const;

/** @deprecated Use `ASCEND_IMAGES` — aliases for legacy section imports. */
export const CINEMATIC_ASSETS = {
  heroRooftopSunrise: ASCEND_IMAGES.heroStorefront,
  philosophyLibrary: ASCEND_IMAGES.editorialArchitecture,
  brotherhoodWalk: ASCEND_IMAGES.brotherhoodDining,
  systemsPlanningWall: ASCEND_IMAGES.teamStudio,
  leadershipLounge: ASCEND_IMAGES.teamStudio,
  lifestyleRooftopStanding: ASCEND_IMAGES.lifestyleCoastal,
} as const;
