import type { TierKey } from "@/lib/lead-context";
import {
  WORLD_SCENE_MEDIA,
  type WorldSceneImageKey,
  type WorldSceneMedia,
} from "@/lib/world-images";
import { FIGMA_SCENE_SCROLL, type SceneScrollSpec } from "@/lib/world-scene-metrics";

export const WORLD_BG = "#0d0d0d";

/** Figma copy anchor — matches absolute positioning in published bundle. */
export type CopyPlacement =
  | "hero-split"
  | "bottom-16"
  | "bottom-20"
  | "bottom-20-left"
  | "center-left";

/** Figma headline scale per scene */
export type StoryDisplayScale = "lg" | "md" | "env" | "sm";

/** Overlay stack keys — see `.world-scene-gradient--*` in figma-world.css */
export type SceneGradient =
  | "hero-br"
  | "story-b"
  | "story-b-distraction"
  | "story-br-env"
  | "solution-br"
  | "story-b-flat"
  | "story-bl"
  | "brotherhood-tr";

export type SceneAccent =
  | "momentum-cool"
  | "distraction-cool"
  | "environment-warm"
  | "environment-lift"
  | "warm-55"
  | "warm-40"
  | "brotherhood-warm"
  | "brotherhood-fade"
  | "how-it-works-film"
  | "none";

export type WorldSceneConfig = {
  media: WorldSceneMedia;
  scroll: SceneScrollSpec;
  /** Figma `bg-[#0d0d0d]/XX` film plate */
  filmOpacity: number;
  gradient: SceneGradient;
  accent: SceneAccent;
  /** Second atmospheric layer (environment / brotherhood) */
  accent2?: SceneAccent;
  /** Gentle opacity breathing on accent only */
  accentBreath?: boolean;
  copyPlacement: CopyPlacement;
  display: StoryDisplayScale;
  /** Eyebrow margin — Figma mb-4 / mb-5 / mb-6 */
  eyebrowMb?: "mb-4" | "mb-5" | "mb-6";
};

function scene(
  imageKey: WorldSceneImageKey,
  config: Omit<WorldSceneConfig, "media">,
): WorldSceneConfig {
  return { media: WORLD_SCENE_MEDIA[imageKey], ...config };
}

/**
 * Story scene visuals — published Figma WORLD SYSTEM bundle.
 */
export const HERO_SCENES = {
  hero: scene("hero", {
    scroll: FIGMA_SCENE_SCROLL.hero,
    filmOpacity: 0.78,
    gradient: "hero-br",
    accent: "none",
    copyPlacement: "hero-split",
    display: "lg",
  }),
  momentum: scene("momentum", {
    scroll: FIGMA_SCENE_SCROLL.story130,
    filmOpacity: 0.85,
    gradient: "story-b",
    accent: "momentum-cool",
    accentBreath: true,
    copyPlacement: "bottom-16",
    display: "lg",
  }),
  distraction: scene("distraction", {
    scroll: FIGMA_SCENE_SCROLL.story120,
    filmOpacity: 0.88,
    gradient: "story-b-distraction",
    accent: "distraction-cool",
    accentBreath: true,
    copyPlacement: "bottom-20",
    display: "md",
  }),
  environment: scene("environment", {
    scroll: FIGMA_SCENE_SCROLL.story135,
    filmOpacity: 0.8,
    gradient: "story-br-env",
    accent: "environment-warm",
    accent2: "environment-lift",
    accentBreath: true,
    copyPlacement: "bottom-20-left",
    display: "env",
  }),
  solution: scene("solution", {
    scroll: FIGMA_SCENE_SCROLL.story125,
    filmOpacity: 0.82,
    gradient: "solution-br",
    accent: "warm-55",
    accentBreath: true,
    copyPlacement: "center-left",
    display: "sm",
    eyebrowMb: "mb-5",
  }),
  howItWorks: scene("howItWorks", {
    scroll: FIGMA_SCENE_SCROLL.story120,
    filmOpacity: 0.82,
    gradient: "story-b-flat",
    accent: "how-it-works-film",
    copyPlacement: "center-left",
    display: "sm",
    eyebrowMb: "mb-5",
  }),
  whatYouBuild: scene("whatYouBuild", {
    scroll: FIGMA_SCENE_SCROLL.story125,
    filmOpacity: 0.78,
    gradient: "story-bl",
    accent: "warm-40",
    accentBreath: true,
    copyPlacement: "center-left",
    display: "sm",
    eyebrowMb: "mb-5",
  }),
  brotherhood: scene("brotherhood", {
    scroll: FIGMA_SCENE_SCROLL.story130,
    filmOpacity: 0.76,
    gradient: "brotherhood-tr",
    accent: "brotherhood-warm",
    accent2: "brotherhood-fade",
    accentBreath: true,
    copyPlacement: "bottom-20-left",
    display: "md",
    eyebrowMb: "mb-4",
  }),
} as const satisfies Record<string, WorldSceneConfig>;

export type WorldPricingTier = {
  key: TierKey;
  name: string;
  tagline: string;
  price: string;
  priceAlt?: string;
  description?: string;
  features: string[];
  recommended?: boolean;
  footnote?: string;
};

export const WORLD_PRICING_TIERS: WorldPricingTier[] = [
  {
    key: "core",
    name: "ENTRY",
    tagline: "Reset your structure",
    price: "₹7K",
    description:
      "Foundation systems. Daily discipline frameworks. Structured accountability to rebuild consistency.",
    features: [],
  },
  {
    key: "pro",
    name: "IMMERSION",
    tagline:
      "Discipline, execution, and communication inside a higher-standard environment",
    price: "₹15K",
    features: [
      "Weekly accountability with your cohort",
      "Communication and presence recalibration",
      "Execution pressure with structured routines",
      "Access to curated operator environment",
    ],
    recommended: true,
  },
  {
    key: "black",
    name: "INNER CIRCLE",
    tagline: "Private high-trust transformation environment",
    price: "₹35K",
    priceAlt: "or ₹55K",
    features: [
      "Everything in Immersion",
      "Private ecosystem — elevated standards",
      "Identity-level environmental design",
      "Selective peer set of serious operators",
    ],
    footnote: "Selective acceptance · Application required",
  },
];
