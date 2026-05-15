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
  | "warm-55"
  | "warm-40"
  | "brotherhood-warm"
  | "how-it-works-film"
  | "none";

export type WorldSceneConfig = {
  media: WorldSceneMedia;
  scroll: SceneScrollSpec;
  /** Solid scrim — Figma `bg-[#0d0d0d]/XX` */
  scrimOpacity: number;
  gradient: SceneGradient;
  accent: SceneAccent;
  warmGlow?: boolean;
  copyPlacement: CopyPlacement;
};

function scene(
  imageKey: WorldSceneImageKey,
  config: Omit<WorldSceneConfig, "media">,
): WorldSceneConfig {
  return { media: WORLD_SCENE_MEDIA[imageKey], ...config };
}

/**
 * Scene order + visuals from Figma WORLD SYSTEM published bundle.
 */
export const HERO_SCENES = {
  hero: scene("hero", {
    scroll: FIGMA_SCENE_SCROLL.hero,
    scrimOpacity: 0.78,
    gradient: "hero-br",
    accent: "none",
    warmGlow: true,
    copyPlacement: "hero-split",
  }),
  momentum: scene("momentum", {
    scroll: FIGMA_SCENE_SCROLL.story130,
    scrimOpacity: 0.85,
    gradient: "story-b",
    accent: "momentum-cool",
    copyPlacement: "bottom-16",
  }),
  distraction: scene("distraction", {
    scroll: FIGMA_SCENE_SCROLL.story120,
    scrimOpacity: 0.88,
    gradient: "story-b-distraction",
    accent: "distraction-cool",
    copyPlacement: "bottom-20",
  }),
  environment: scene("environment", {
    scroll: FIGMA_SCENE_SCROLL.story135,
    scrimOpacity: 0.8,
    gradient: "story-br-env",
    accent: "environment-warm",
    copyPlacement: "bottom-20-left",
  }),
  solution: scene("solution", {
    scroll: FIGMA_SCENE_SCROLL.story125,
    scrimOpacity: 0.82,
    gradient: "solution-br",
    accent: "warm-55",
    copyPlacement: "center-left",
  }),
  howItWorks: scene("howItWorks", {
    scroll: FIGMA_SCENE_SCROLL.story120,
    scrimOpacity: 0.82,
    gradient: "story-b-flat",
    accent: "how-it-works-film",
    copyPlacement: "center-left",
  }),
  whatYouBuild: scene("whatYouBuild", {
    scroll: FIGMA_SCENE_SCROLL.story125,
    scrimOpacity: 0.78,
    gradient: "story-bl",
    accent: "warm-40",
    copyPlacement: "center-left",
  }),
  brotherhood: scene("brotherhood", {
    scroll: FIGMA_SCENE_SCROLL.story130,
    scrimOpacity: 0.76,
    gradient: "brotherhood-tr",
    accent: "brotherhood-warm",
    copyPlacement: "bottom-20-left",
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
  cta: string;
  ctaVariant: "outline" | "solid";
  recommended?: boolean;
  secondaryCta?: string;
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
    cta: "BEGIN",
    ctaVariant: "outline",
  },
  {
    key: "pro",
    name: "IMMERSION",
    tagline:
      "Build discipline, execution, communication, and consistency inside a stronger environment",
    price: "₹15K",
    features: [
      "Weekly accountability calls with your group",
      "Communication and confidence recalibration",
      "Execution pressure and structured routines",
      "Access to curated brotherhood environment",
    ],
    cta: "ENTER",
    ctaVariant: "solid",
    recommended: true,
  },
  {
    key: "black",
    name: "INNER CIRCLE",
    tagline: "Private high-standard transformation environment",
    price: "₹35K",
    priceAlt: "or ₹55K",
    features: [
      "Everything in Immersion",
      "Private ecosystem access with elevated standards",
      "Identity-level environmental transformation",
      "Selective brotherhood of serious men",
    ],
    cta: "APPLY FOR ₹35K",
    ctaVariant: "outline",
    secondaryCta: "APPLY FOR ₹55K",
    footnote: "Selective acceptance · Application required",
  },
];
