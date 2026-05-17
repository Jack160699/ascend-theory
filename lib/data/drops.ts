import { STOCK_IMAGES } from "@/lib/stock-media";

export type DropCategory = "apparel" | "eyewear" | "accessories";

export type Drop = {
  slug: string;
  dropName: string;
  productName: string;
  tagline: string;
  description: string;
  category: DropCategory;
  price: {
    display: string;
    currency: string;
    amount: number;
  };
  image: string;
  imageAlt: string;
  hero: {
    image: string;
    alt: string;
  };
  story: {
    headline: string;
    body: string[];
  };
  visuals: readonly {
    src: string;
    alt: string;
    caption: string;
  }[];
  details: readonly string[];
  scarcity: {
    labels: readonly string[];
    stockRemaining: number;
    totalAllocation: number;
  };
};

export const DROPS: readonly Drop[] = [
  {
    slug: "ascend-jacket",
    dropName: "Ascend / 01",
    productName: "The Ascend Jacket",
    tagline: "Identity you wear before you speak.",
    description:
      "Matte shell. Editorial cut. A limited run for people who already live the standard.",
    category: "apparel",
    price: { display: "$480", currency: "USD", amount: 480 },
    image: STOCK_IMAGES.teamStudio,
    imageAlt: "The Ascend Jacket — Ascend / 01",
    hero: {
      image: STOCK_IMAGES.teamStudio,
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
    ],
    details: [
      "Water-resistant matte shell",
      "Hidden interior pocket system",
      "Editorial cut — relaxed shoulder",
      "Unisex sizing · XS–XL",
      "Made in limited run · numbered interior",
    ],
    scarcity: {
      labels: ["Limited Release", "No Restock"],
      stockRemaining: 47,
      totalAllocation: 120,
    },
  },
  {
    slug: "ascend-optics",
    dropName: "Ascend / 02",
    productName: "Ascend Optics I",
    tagline: "Sharp lines. Low light. City and coast.",
    description:
      "Hand-finished acetate. No branding on the lens. Built for focus in motion.",
    category: "eyewear",
    price: { display: "$320", currency: "USD", amount: 320 },
    image: STOCK_IMAGES.lifestyleAirport,
    imageAlt: "Ascend Optics I — Ascend / 02",
    hero: {
      image: STOCK_IMAGES.lifestyleAirport,
      alt: "Ascend Optics I — limited release",
    },
    story: {
      headline: "See the room before you enter it.",
      body: [
        "Eyewear as posture — not accessory theatre. Ascend Optics I is cut for low light, long days, and the quiet confidence of people who do not need to announce themselves.",
        "Matte temple. Hidden hinge. A frame that disappears until someone asks where you got it.",
      ],
    },
    visuals: [
      {
        src: STOCK_IMAGES.lifestyleAirport,
        alt: "Ascend Optics — transit",
        caption: "Transit · 01",
      },
      {
        src: STOCK_IMAGES.editorialArchitecture,
        alt: "Ascend Optics — structure",
        caption: "Lines · 02",
      },
    ],
    details: [
      "Hand-polished acetate frame",
      "UV400 lenses · anti-glare coat",
      "Low-profile hinge system",
      "Includes matte hard case",
      "Limited numbered run",
    ],
    scarcity: {
      labels: ["Limited Release", "No Restock"],
      stockRemaining: 31,
      totalAllocation: 80,
    },
  },
  {
    slug: "ascend-carry",
    dropName: "Ascend / 03",
    productName: "The Carry System",
    tagline: "Restraint as luxury. Details that stay close.",
    description:
      "Modular interior. Matte hardware. Designed to disappear against black.",
    category: "accessories",
    price: { display: "$260", currency: "USD", amount: 260 },
    image: STOCK_IMAGES.lifestyleCoastal,
    imageAlt: "The Carry System — Ascend / 03",
    hero: {
      image: STOCK_IMAGES.lifestyleCoastal,
      alt: "The Carry System — limited release",
    },
    story: {
      headline: "What you carry is what you protect.",
      body: [
        "The Carry System is not a bag — it is a mobile discipline kit. Laptop sleeve, document pocket, and a hidden compartment for the things you do not display.",
        "Built for operators who move between studio, street, and silence without repacking their identity.",
      ],
    },
    visuals: [
      {
        src: STOCK_IMAGES.lifestyleCoastal,
        alt: "The Carry System — coastal",
        caption: "Coast · 01",
      },
      {
        src: STOCK_IMAGES.brotherhoodDining,
        alt: "The Carry System — interior",
        caption: "Interior · 02",
      },
    ],
    details: [
      "Water-resistant matte exterior",
      "Modular interior dividers",
      "Reinforced carry strap",
      "Fits 16\" laptop + tablet",
      "Limited run · embossed serial",
    ],
    scarcity: {
      labels: ["Limited Release", "No Restock"],
      stockRemaining: 22,
      totalAllocation: 60,
    },
  },
] as const;

const dropMap = new Map(DROPS.map((d) => [d.slug, d]));

export function getDropBySlug(slug: string): Drop | undefined {
  return dropMap.get(slug);
}

export function getAllDropSlugs(): string[] {
  return DROPS.map((d) => d.slug);
}

export function getDropsByCategory(category: DropCategory): Drop[] {
  return DROPS.filter((d) => d.category === category);
}

export function getFeaturedDrop(): Drop {
  return DROPS[0]!;
}
