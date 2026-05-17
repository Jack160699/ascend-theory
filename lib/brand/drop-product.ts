import { BRAND_IMAGES } from "@/lib/brand/images";
import { STOCK_IMAGES } from "@/lib/stock-media";

/** Ascend / 01 — limited release product experience. */
export const DROP_PRODUCT = {
  slug: "ascend-01",
  dropName: "Ascend / 01",
  productName: "The Ascend Jacket",
  tagline: "Identity you wear before you speak.",
  price: {
    display: "$480",
    currency: "USD",
    amount: 480,
  },
  hero: {
    image: BRAND_IMAGES.drop,
    alt: "The Ascend Jacket — Ascend / 01 limited release",
  },
  story: {
    headline: "Not outerwear. A standard.",
    body: [
      "Cut for people who already live with intention — founders, creators, operators who move through cities and silence with the same discipline.",
      "Matte black. No logo theatre. A silhouette that reads before you introduce yourself.",
    ],
  },
  visuals: [
    {
      src: STOCK_IMAGES.teamStudio,
      alt: "Editorial studio portrait — Ascend / 01",
      caption: "Studio · 01",
    },
    {
      src: STOCK_IMAGES.lifestyleGolf,
      alt: "Field movement — Ascend / 01",
      caption: "Field · 02",
    },
    {
      src: STOCK_IMAGES.editorialArchitecture,
      alt: "Architectural lines — Ascend / 01",
      caption: "Structure · 03",
    },
  ] as const,
  details: [
    "Water-resistant matte shell",
    "Hidden interior pocket system",
    "Editorial cut — relaxed shoulder",
    "Unisex sizing · XS–XL",
    "Made in limited run · numbered interior",
  ],
  scarcity: {
    labels: ["Limited Release", "No Restock"] as const,
    stockRemaining: 47,
    totalAllocation: 120,
  },
} as const;

export type DropProduct = typeof DROP_PRODUCT;
