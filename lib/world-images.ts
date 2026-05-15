/**
 * WORLD SYSTEM imagery — extracted from published Figma Make bundle
 * https://evade-ruby-43345898.figma.site
 *
 * Local WebPs mirror Figma Unsplash sources (see scripts/download-world-images.mjs).
 */

export type WorldSceneImageKey =
  | "hero"
  | "momentum"
  | "distraction"
  | "environment"
  | "solution"
  | "howItWorks"
  | "whatYouBuild"
  | "brotherhood";

/** Story plates use contain to preserve composition on mobile; hero / cinematic plate uses cover. */
export type WorldSceneObjectFit = "cover" | "contain";

export type WorldSceneMedia = {
  /** Optimized local asset (preferred for production). */
  src: string;
  /** Figma bundle source URL — reference only. */
  figmaSource: string;
  alt: string;
  /** Matches Figma `backgroundPosition`. */
  objectPosition: string;
  /** Default framing for this asset. Sections may override e.g. final CTA cover. */
  objectFit?: WorldSceneObjectFit;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=85`;

export const WORLD_SCENE_MEDIA: Record<WorldSceneImageKey, WorldSceneMedia> = {
  hero: {
    src: "/images/world/hero.webp",
    figmaSource: unsplash("photo-1610899632923-3751bc4b427a"),
    alt: "Architectural interior — Ascend Theory hero",
    objectPosition: "center center",
    objectFit: "cover",
  },
  momentum: {
    src: "/images/world/momentum.webp",
    figmaSource: unsplash("photo-1633070374521-b45f91ea5cec"),
    alt: "Man in transit — momentum scene",
    objectPosition: "center 40%",
    objectFit: "contain",
  },
  distraction: {
    src: "/images/world/distraction.webp",
    figmaSource: unsplash("photo-1590501949668-2442efd4d3d7"),
    alt: "Coastal walk — distraction scene",
    objectPosition: "center center",
    objectFit: "contain",
  },
  environment: {
    src: "/images/world/environment.webp",
    figmaSource: unsplash("photo-1599718100450-8c59eed42a40"),
    alt: "Private golf environment",
    objectPosition: "center center",
    objectFit: "contain",
  },
  solution: {
    src: "/images/world/solution.webp",
    figmaSource: unsplash("photo-1738748444676-113d30c9a25b"),
    alt: "Structured studio environment",
    objectPosition: "center center",
    objectFit: "contain",
  },
  howItWorks: {
    src: "/images/world/how-it-works.webp",
    figmaSource: unsplash("photo-1699766868222-56056eb963ab"),
    alt: "Architecture — systems scene",
    objectPosition: "center center",
    objectFit: "contain",
  },
  whatYouBuild: {
    src: "/images/world/solution.webp",
    figmaSource: unsplash("photo-1738748444676-113d30c9a25b"),
    alt: "Structured studio — what you build",
    objectPosition: "center center",
    objectFit: "contain",
  },
  brotherhood: {
    src: "/images/world/brotherhood.webp",
    figmaSource: unsplash("photo-1771408662069-7a78b1942801"),
    alt: "Brotherhood dining scene",
    objectPosition: "center center",
    objectFit: "contain",
  },
};
