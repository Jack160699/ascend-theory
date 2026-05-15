import type { TierKey } from "@/lib/lead-context";
import { ASCEND_IMAGES } from "@/lib/cinematic-assets";
import { ASCEND_IMAGE_CLASS } from "@/lib/cinematic-composition";

export const WORLD_BG = "#0d0d0d";

export const HERO_SCENES = {
  hero: {
    image: ASCEND_IMAGES.editorialArchitecture,
    imageClass: ASCEND_IMAGE_CLASS.editorialArchitecture,
    imageAlt: "Ascend Theory — cinematic architectural space",
  },
  momentum: {
    image: ASCEND_IMAGES.lifestyleAirport,
    imageClass: ASCEND_IMAGE_CLASS.lifestyleAirport,
    imageAlt: "Ascend Theory — composed professional in motion",
  },
  distraction: {
    image: ASCEND_IMAGES.lifestyleCoastal,
    imageClass: ASCEND_IMAGE_CLASS.lifestyleCoastal,
    imageAlt: "Ascend Theory — man on a coastal promenade at golden hour",
  },
  environment: {
    image: ASCEND_IMAGES.lifestyleGolf,
    imageClass: ASCEND_IMAGE_CLASS.lifestyleGolf,
    imageAlt: "Ascend Theory — members at a private club",
  },
  solution: {
    image: ASCEND_IMAGES.teamStudio,
    imageClass: ASCEND_IMAGE_CLASS.teamStudio,
    imageAlt: "Ascend Theory — structured environment for men",
  },
  howItWorks: {
    image: ASCEND_IMAGES.editorialArchitecture,
    imageClass: ASCEND_IMAGE_CLASS.editorialArchitecture,
    imageAlt: "Ascend Theory — architectural discipline",
  },
  whatYouBuild: {
    image: ASCEND_IMAGES.heroStorefront,
    imageClass: ASCEND_IMAGE_CLASS.heroStorefront,
    imageAlt: "Ascend Theory — identity in motion",
  },
  brotherhood: {
    image: ASCEND_IMAGES.brotherhoodDining,
    imageClass: ASCEND_IMAGE_CLASS.brotherhoodDining,
    imageAlt: "Ascend Theory — private brotherhood",
  },
} as const;

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
