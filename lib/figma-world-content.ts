import type { TierKey } from "@/lib/lead-context";
import { ASCEND_IMAGES } from "@/lib/cinematic-assets";
import { ASCEND_IMAGE_CLASS } from "@/lib/cinematic-composition";
import { FIGMA_SCENE_SCROLL, type SceneScrollSpec } from "@/lib/world-scene-metrics";

export const WORLD_BG = "#0d0d0d";

/** Atmospheric grade — CSS-only overlays (see `figma-world.css`). */
export type AtmosphereGrade =
  | "hero"
  | "story-bottom"
  | "story-bottom-env"
  | "story-center"
  | "brotherhood";

export type WorldSceneConfig = {
  image: string;
  imageClass: string;
  imageAlt: string;
  /** Figma-aligned crop; preserves negative space for type. */
  imagePosition: string;
  scroll: SceneScrollSpec;
  grade: AtmosphereGrade;
  warmGlow?: boolean;
};

/** Scene order + visuals aligned to published Figma WORLD SYSTEM. */
export const HERO_SCENES = {
  hero: {
    image: ASCEND_IMAGES.editorialArchitecture,
    imageClass: ASCEND_IMAGE_CLASS.editorialArchitecture,
    imageAlt: "Ascend Theory — architectural editorial hero",
    imagePosition: "50% 28%",
    scroll: FIGMA_SCENE_SCROLL.hero,
    grade: "hero",
    warmGlow: true,
  },
  momentum: {
    image: ASCEND_IMAGES.lifestyleAirport,
    imageClass: ASCEND_IMAGE_CLASS.lifestyleAirport,
    imageAlt: "Ascend Theory — man in transit",
    imagePosition: "42% 38%",
    scroll: FIGMA_SCENE_SCROLL.story130,
    grade: "story-bottom",
  },
  distraction: {
    image: ASCEND_IMAGES.lifestyleCoastal,
    imageClass: ASCEND_IMAGE_CLASS.lifestyleCoastal,
    imageAlt: "Ascend Theory — coastal walk",
    imagePosition: "50% 48%",
    scroll: FIGMA_SCENE_SCROLL.story120,
    grade: "story-bottom",
  },
  environment: {
    image: ASCEND_IMAGES.lifestyleGolf,
    imageClass: ASCEND_IMAGE_CLASS.lifestyleGolf,
    imageAlt: "Ascend Theory — private environment",
    imagePosition: "50% 36%",
    scroll: FIGMA_SCENE_SCROLL.story135,
    grade: "story-bottom-env",
  },
  solution: {
    image: ASCEND_IMAGES.teamStudio,
    imageClass: ASCEND_IMAGE_CLASS.teamStudio,
    imageAlt: "Ascend Theory — structured environment",
    imagePosition: "48% 40%",
    scroll: FIGMA_SCENE_SCROLL.story125,
    grade: "story-center",
  },
  howItWorks: {
    image: ASCEND_IMAGES.editorialArchitecture,
    imageClass: ASCEND_IMAGE_CLASS.editorialArchitecture,
    imageAlt: "Ascend Theory — discipline and systems",
    imagePosition: "52% 38%",
    scroll: FIGMA_SCENE_SCROLL.story120,
    grade: "story-center",
  },
  whatYouBuild: {
    image: ASCEND_IMAGES.heroStorefront,
    imageClass: ASCEND_IMAGE_CLASS.heroStorefront,
    imageAlt: "Ascend Theory — identity in the world",
    imagePosition: "50% 26%",
    scroll: FIGMA_SCENE_SCROLL.story125,
    grade: "story-center",
  },
  brotherhood: {
    image: ASCEND_IMAGES.brotherhoodDining,
    imageClass: ASCEND_IMAGE_CLASS.brotherhoodDining,
    imageAlt: "Ascend Theory — brotherhood",
    imagePosition: "48% 40%",
    scroll: FIGMA_SCENE_SCROLL.story130,
    grade: "brotherhood",
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
