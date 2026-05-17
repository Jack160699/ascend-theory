import { STOCK_IMAGES } from "@/lib/stock-media";
import type { DropCategory } from "./drops";

export type WearableCollection = {
  id: DropCategory;
  title: string;
  line: string;
  cta: string;
  image: string;
  dropSlug: string;
};

export const WEARABLE_COLLECTIONS: readonly WearableCollection[] = [
  {
    id: "apparel",
    title: "Apparel",
    line: "Matte silhouettes. Editorial cuts. No logos shouting.",
    cta: "View Drop →",
    image: STOCK_IMAGES.lifestyleGolf,
    dropSlug: "ascend-jacket",
  },
  {
    id: "eyewear",
    title: "Eyewear",
    line: "Sharp lines. Low light. City and coast.",
    cta: "View Drop →",
    image: STOCK_IMAGES.lifestyleAirport,
    dropSlug: "ascend-optics",
  },
  {
    id: "accessories",
    title: "Accessories",
    line: "Restraint as luxury. Details that stay close.",
    cta: "View Drop →",
    image: STOCK_IMAGES.lifestyleCoastal,
    dropSlug: "ascend-carry",
  },
] as const;

export const WEARABLES_INDEX = {
  eyebrow: "Wearables",
  headline: "Objects for the focused life.",
  description:
    "Three collections. One visual language. Each piece is a limited drop — not a catalog.",
} as const;
