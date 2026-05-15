import type { TierKey } from "@/lib/lead-context";
import { ASCEND_IMAGES } from "@/lib/cinematic-assets";
import { ASCEND_IMAGE_CLASS } from "@/lib/cinematic-composition";
import { FIGMA_SCENE_SCROLL, type SceneScrollSpec } from "@/lib/world-scene-metrics";

export const WORLD_BG = "#0d0d0d";

/** Figma copy anchor — matches absolute positioning in published bundle. */
export type CopyPlacement =
  | "hero-split"
  | "bottom-16"
  | "bottom-20-left"
  | "center-left";

/** Overlay stack keys — see `.world-scene-gradient--*` in figma-world.css */
export type SceneGradient =
  | "hero-br"
  | "story-b"
  | "story-br-env"
  | "solution-br"
  | "story-b-flat"
  | "story-bl"
  | "brotherhood-tr";

export type SceneAccent = "momentum-cool" | "warm-55" | "warm-40" | "brotherhood-warm" | "none";

export type WorldSceneConfig = {
  image: string;
  imageClass: string;
  imageAlt: string;
  imagePosition: string;
  scroll: SceneScrollSpec;
  /** Solid scrim — Figma `bg-[#0d0d0d]/XX` */
  scrimOpacity: number;
  gradient: SceneGradient;
  accent: SceneAccent;
  warmGlow?: boolean;
  copyPlacement: CopyPlacement;
};

/**
 * Scene order + visuals from Figma WORLD SYSTEM bundle.
 * Images: brand WebPs mapped to Figma Unsplash sequence.
 */
export const HERO_SCENES = {
  hero: {
    image: ASCEND_IMAGES.editorialArchitecture,
    imageClass: ASCEND_IMAGE_CLASS.editorialArchitecture,
    imageAlt: "Ascend Theory — architectural editorial hero",
    imagePosition: "center center",
    scroll: FIGMA_SCENE_SCROLL.hero,
    scrimOpacity: 0.72,
    gradient: "hero-br",
    accent: "none",
    warmGlow: true,
    copyPlacement: "hero-split",
  },
  momentum: {
    image: ASCEND_IMAGES.lifestyleAirport,
    imageClass: ASCEND_IMAGE_CLASS.lifestyleAirport,
    imageAlt: "Ascend Theory — man in transit",
    imagePosition: "center center",
    scroll: FIGMA_SCENE_SCROLL.story130,
    scrimOpacity: 0.85,
    gradient: "story-b",
    accent: "momentum-cool",
    copyPlacement: "bottom-16",
  },
  distraction: {
    image: ASCEND_IMAGES.lifestyleCoastal,
    imageClass: ASCEND_IMAGE_CLASS.lifestyleCoastal,
    imageAlt: "Ascend Theory — coastal walk",
    imagePosition: "center center",
    scroll: FIGMA_SCENE_SCROLL.story120,
    scrimOpacity: 0.88,
    gradient: "story-b",
    accent: "none",
    copyPlacement: "bottom-16",
  },
  environment: {
    image: ASCEND_IMAGES.lifestyleGolf,
    imageClass: ASCEND_IMAGE_CLASS.lifestyleGolf,
    imageAlt: "Ascend Theory — private environment",
    imagePosition: "center center",
    scroll: FIGMA_SCENE_SCROLL.story135,
    scrimOpacity: 0.8,
    gradient: "story-br-env",
    accent: "none",
    copyPlacement: "bottom-16",
  },
  solution: {
    image: ASCEND_IMAGES.teamStudio,
    imageClass: ASCEND_IMAGE_CLASS.teamStudio,
    imageAlt: "Ascend Theory — structured environment",
    imagePosition: "center center",
    scroll: FIGMA_SCENE_SCROLL.story125,
    scrimOpacity: 0.82,
    gradient: "solution-br",
    accent: "warm-55",
    copyPlacement: "center-left",
  },
  howItWorks: {
    image: ASCEND_IMAGES.editorialArchitecture,
    imageClass: ASCEND_IMAGE_CLASS.editorialArchitecture,
    imageAlt: "Ascend Theory — discipline and systems",
    imagePosition: "center center",
    scroll: FIGMA_SCENE_SCROLL.story120,
    scrimOpacity: 0.82,
    gradient: "story-b-flat",
    accent: "none",
    copyPlacement: "center-left",
  },
  whatYouBuild: {
    image: ASCEND_IMAGES.teamStudio,
    imageClass: ASCEND_IMAGE_CLASS.teamStudio,
    imageAlt: "Ascend Theory — what you build",
    imagePosition: "center center",
    scroll: FIGMA_SCENE_SCROLL.story125,
    scrimOpacity: 0.78,
    gradient: "story-bl",
    accent: "warm-55",
    copyPlacement: "center-left",
  },
  brotherhood: {
    image: ASCEND_IMAGES.brotherhoodDining,
    imageClass: ASCEND_IMAGE_CLASS.brotherhoodDining,
    imageAlt: "Ascend Theory — brotherhood",
    imagePosition: "center center",
    scroll: FIGMA_SCENE_SCROLL.story130,
    scrimOpacity: 0.76,
    gradient: "brotherhood-tr",
    accent: "brotherhood-warm",
    copyPlacement: "bottom-20-left",
  },
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
