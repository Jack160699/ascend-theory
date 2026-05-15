import type { TierKey } from "@/lib/lead-context";
import { ASCEND_IMAGES } from "@/lib/cinematic-assets";
import { ASCEND_IMAGE_CLASS } from "@/lib/cinematic-composition";
import { FIGMA_SCENE_SCROLL, type SceneScrollSpec } from "@/lib/world-scene-metrics";

export const WORLD_BG = "#0d0d0d";

export type WorldSceneConfig = {
  image: string;
  imageClass: string;
  imageAlt: string;
  imagePosition?: string;
  scroll: SceneScrollSpec;
  /** Solid scrim over photo */
  scrimClass: string;
  /** Gradient stack on top of scrim */
  gradientClass: string;
  warmGlow?: boolean;
};

/** Scene order + visuals aligned to published Figma Make site bundle. */
export const HERO_SCENES = {
  hero: {
    image: ASCEND_IMAGES.editorialArchitecture,
    imageClass: ASCEND_IMAGE_CLASS.editorialArchitecture,
    imageAlt: "Ascend Theory — architectural editorial hero",
    imagePosition: "center 35%",
    scroll: FIGMA_SCENE_SCROLL.hero,
    scrimClass: "bg-[#0d0d0d]/70",
    gradientClass:
      "bg-gradient-to-br from-transparent via-[#0d0d0d]/60 to-[#0d0d0d]/90",
    warmGlow: true,
  },
  momentum: {
    image: ASCEND_IMAGES.lifestyleAirport,
    imageClass: ASCEND_IMAGE_CLASS.lifestyleAirport,
    imageAlt: "Ascend Theory — man in transit",
    imagePosition: "center 40%",
    scroll: FIGMA_SCENE_SCROLL.story130,
    scrimClass: "bg-[#0d0d0d]/85",
    gradientClass:
      "bg-gradient-to-b from-[#0d0d0d]/70 via-[#0d0d0d]/80 to-[#0d0d0d]",
  },
  distraction: {
    image: ASCEND_IMAGES.lifestyleCoastal,
    imageClass: ASCEND_IMAGE_CLASS.lifestyleCoastal,
    imageAlt: "Ascend Theory — coastal walk",
    scroll: FIGMA_SCENE_SCROLL.story120,
    scrimClass: "bg-[#0d0d0d]/88",
    gradientClass:
      "bg-gradient-to-b from-[#0d0d0d]/75 via-[#0d0d0d]/85 to-[#0d0d0d]",
  },
  environment: {
    image: ASCEND_IMAGES.lifestyleGolf,
    imageClass: ASCEND_IMAGE_CLASS.lifestyleGolf,
    imageAlt: "Ascend Theory — private environment",
    scroll: FIGMA_SCENE_SCROLL.story135,
    scrimClass: "bg-[#0d0d0d]/80",
    gradientClass:
      "bg-gradient-to-br from-[#0d0d0d]/60 via-[#0d0d0d]/75 to-[#0d0d0d]/95",
  },
  solution: {
    image: ASCEND_IMAGES.teamStudio,
    imageClass: ASCEND_IMAGE_CLASS.teamStudio,
    imageAlt: "Ascend Theory — structured environment",
    scroll: FIGMA_SCENE_SCROLL.story125,
    scrimClass: "bg-[#0d0d0d]/82",
    gradientClass:
      "bg-gradient-to-br from-[#0d0d0d]/70 via-[#0d0d0d]/80 to-[#0d0d0d]/90",
  },
  howItWorks: {
    image: ASCEND_IMAGES.editorialArchitecture,
    imageClass: ASCEND_IMAGE_CLASS.editorialArchitecture,
    imageAlt: "Ascend Theory — discipline and systems",
    imagePosition: "52% 40%",
    scroll: FIGMA_SCENE_SCROLL.story120,
    scrimClass: "bg-[#0d0d0d]/82",
    gradientClass:
      "bg-gradient-to-b from-[#0d0d0d]/70 via-[#0d0d0d]/80 to-[#0d0d0d]/90",
  },
  whatYouBuild: {
    image: ASCEND_IMAGES.heroStorefront,
    imageClass: ASCEND_IMAGE_CLASS.heroStorefront,
    imageAlt: "Ascend Theory — identity in the world",
    imagePosition: "center 30%",
    scroll: FIGMA_SCENE_SCROLL.story125,
    scrimClass: "bg-[#0d0d0d]/78",
    gradientClass:
      "bg-gradient-to-bl from-[#0d0d0d]/65 via-[#0d0d0d]/80 to-[#0d0d0d]/90",
  },
  brotherhood: {
    image: ASCEND_IMAGES.brotherhoodDining,
    imageClass: ASCEND_IMAGE_CLASS.brotherhoodDining,
    imageAlt: "Ascend Theory — brotherhood",
    scroll: FIGMA_SCENE_SCROLL.story130,
    scrimClass: "bg-[#0d0d0d]/76",
    gradientClass:
      "bg-gradient-to-tr from-[#0d0d0d]/85 via-[#0d0d0d]/70 to-[#0d0d0d]/85",
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
