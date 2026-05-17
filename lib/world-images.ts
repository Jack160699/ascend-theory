/**
 * WORLD SYSTEM imagery — stock stills (Unsplash via unified stock-media).
 */

import { WORLD_STOCK_IMAGES, stockPhoto } from "@/lib/stock-media";

export type WorldSceneImageKey =
  | "hero"
  | "momentum"
  | "distraction"
  | "environment"
  | "solution"
  | "howItWorks"
  | "whatYouBuild"
  | "brotherhood";

export type WorldSceneObjectFit = "cover" | "contain";

export type WorldSceneMedia = {
  src: string;
  alt: string;
  objectPosition: string;
  objectFit?: WorldSceneObjectFit;
};

export const WORLD_SCENE_MEDIA: Record<WorldSceneImageKey, WorldSceneMedia> = {
  hero: {
    src: WORLD_STOCK_IMAGES.hero,
    alt: "Architectural interior — Ascend Theory hero",
    objectPosition: "center center",
    objectFit: "cover",
  },
  momentum: {
    src: WORLD_STOCK_IMAGES.momentum,
    alt: "Man in transit — momentum scene",
    objectPosition: "center 40%",
    objectFit: "contain",
  },
  distraction: {
    src: WORLD_STOCK_IMAGES.distraction,
    alt: "Coastal walk — distraction scene",
    objectPosition: "center center",
    objectFit: "contain",
  },
  environment: {
    src: WORLD_STOCK_IMAGES.environment,
    alt: "Private golf environment",
    objectPosition: "center center",
    objectFit: "contain",
  },
  solution: {
    src: WORLD_STOCK_IMAGES.solution,
    alt: "Structured studio environment",
    objectPosition: "center center",
    objectFit: "contain",
  },
  howItWorks: {
    src: WORLD_STOCK_IMAGES.howItWorks,
    alt: "Architecture — systems scene",
    objectPosition: "center center",
    objectFit: "contain",
  },
  whatYouBuild: {
    src: WORLD_STOCK_IMAGES.solution,
    alt: "Structured studio — what you build",
    objectPosition: "center center",
    objectFit: "contain",
  },
  brotherhood: {
    src: WORLD_STOCK_IMAGES.brotherhood,
    alt: "Brotherhood dining scene",
    objectPosition: "center center",
    objectFit: "contain",
  },
};

/** @deprecated Legacy helper — prefer `WORLD_STOCK_IMAGES` */
export const unsplash = (id: string) => stockPhoto(id, 1920);
