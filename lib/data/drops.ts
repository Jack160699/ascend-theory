import { ASCEND_PRODUCT_IMAGES } from "@/lib/product-images";

export type DropCategory = "apparel" | "eyewear" | "accessories";

export type DropPrice = {
  amount: number;
  currency: string;
  display: string;
};

export type Drop = {
  slug: string;
  name: string;
  price: DropPrice;
  description: string;
  image: string;
  imageAlt: string;
  category: DropCategory;
  dropName: string;
  tagline: string;
  hero: {
    image: string;
    alt: string;
  };
  story: {
    headline: string;
    body: readonly string[];
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

const DROP_IMAGES = {
  jacket: ASCEND_PRODUCT_IMAGES.teamStudio,
  vest: ASCEND_PRODUCT_IMAGES.lifestyleGolf,
  optics: ASCEND_PRODUCT_IMAGES.lifestyleAirport,
  carry: ASCEND_PRODUCT_IMAGES.lifestyleCoastal,
  architecture: ASCEND_PRODUCT_IMAGES.editorialArchitecture,
  dining: ASCEND_PRODUCT_IMAGES.brotherhoodDining,
} as const;

function formatPrice(amount: number, currency = "USD"): DropPrice {
  return {
    amount,
    currency,
    display: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount),
  };
}

function buildDrop(
  core: {
    slug: string;
    name: string;
    price: number;
    description: string;
    image: string;
    category: DropCategory;
    dropName: string;
    tagline: string;
    story: Drop["story"];
    visuals: Drop["visuals"];
    details: readonly string[];
    scarcity: Drop["scarcity"];
    heroImage?: string;
    gallery?: readonly { src: string; alt: string; caption: string }[];
  },
): Drop {
  const heroImage = core.heroImage ?? core.image;
  return {
    slug: core.slug,
    name: core.name,
    price: formatPrice(core.price),
    description: core.description,
    image: core.image,
    imageAlt: `${core.name} — ${core.dropName}`,
    category: core.category,
    dropName: core.dropName,
    tagline: core.tagline,
    hero: {
      image: heroImage,
      alt: `${core.name} — ${core.dropName} limited release`,
    },
    story: core.story,
    visuals: core.gallery ?? core.visuals,
    details: core.details,
    scarcity: core.scarcity,
  };
}

export const DROPS: readonly Drop[] = [
  buildDrop({
    slug: "ascend-jacket",
    name: "The Ascend Jacket",
    price: 480,
    description: "Matte shell. Structured silhouette.",
    image: DROP_IMAGES.jacket,
    category: "apparel",
    dropName: "Ascend / 01",
    tagline: "Built for presence.",
    story: {
      headline: "Not outerwear. A standard.",
      body: [
        "Designed for those who move in silence.",
        "A silhouette that reads before you speak.",
      ],
    },
    visuals: [
      {
        src: DROP_IMAGES.jacket,
        alt: "The Ascend Jacket — studio",
        caption: "Studio · 01",
      },
      {
        src: DROP_IMAGES.vest,
        alt: "The Ascend Jacket — field",
        caption: "Field · 02",
      },
      {
        src: DROP_IMAGES.architecture,
        alt: "The Ascend Jacket — structure",
        caption: "Structure · 03",
      },
    ],
    details: [
      "Matte shell",
      "Hidden carry",
      "Editorial cut",
      "Numbered run",
    ],
    scarcity: {
      labels: ["Limited Release", "No Restock"],
      stockRemaining: 47,
      totalAllocation: 120,
    },
  }),
  buildDrop({
    slug: "ascend-shell-vest",
    name: "The Shell Vest",
    price: 340,
    description: "Light layer. Clean lines.",
    image: DROP_IMAGES.vest,
    category: "apparel",
    dropName: "Ascend / 04",
    tagline: "Engineered for discipline.",
    story: {
      headline: "Structure without weight.",
      body: [
        "Between studio and street — posture without bulk.",
        "Matte. Minimal. Sharp under low light.",
      ],
    },
    visuals: [
      {
        src: DROP_IMAGES.vest,
        alt: "The Shell Vest — field",
        caption: "Field · 01",
      },
      {
        src: DROP_IMAGES.jacket,
        alt: "The Shell Vest — studio",
        caption: "Studio · 02",
      },
    ],
    details: [
      "Ripstop shell",
      "Interior pocket",
      "Relaxed fit",
      "Limited run",
    ],
    scarcity: {
      labels: ["Limited Release", "No Restock"],
      stockRemaining: 38,
      totalAllocation: 90,
    },
  }),
  buildDrop({
    slug: "ascend-optics",
    name: "Ascend Optics I",
    price: 320,
    description: "Hand-finished acetate. No lens theatre.",
    image: DROP_IMAGES.optics,
    category: "eyewear",
    dropName: "Ascend / 02",
    tagline: "See the room first.",
    story: {
      headline: "Posture, not accessory.",
      body: [
        "Cut for low light and long days.",
        "A frame that disappears until it is noticed.",
      ],
    },
    visuals: [
      {
        src: DROP_IMAGES.optics,
        alt: "Ascend Optics — transit",
        caption: "Transit · 01",
      },
      {
        src: DROP_IMAGES.architecture,
        alt: "Ascend Optics — structure",
        caption: "Lines · 02",
      },
    ],
    details: [
      "Acetate frame",
      "UV400 lenses",
      "Hidden hinge",
      "Matte case",
    ],
    scarcity: {
      labels: ["Limited Release", "No Restock"],
      stockRemaining: 31,
      totalAllocation: 80,
    },
  }),
  buildDrop({
    slug: "ascend-carry",
    name: "The Carry System",
    price: 260,
    description: "Modular interior. Matte hardware.",
    image: DROP_IMAGES.carry,
    category: "accessories",
    dropName: "Ascend / 03",
    tagline: "What you carry defines you.",
    story: {
      headline: "A mobile discipline kit.",
      body: [
        "Not a bag — a system for what you protect.",
        "Built to disappear against black.",
      ],
    },
    visuals: [
      {
        src: DROP_IMAGES.carry,
        alt: "The Carry System — coastal",
        caption: "Coast · 01",
      },
      {
        src: DROP_IMAGES.dining,
        alt: "The Carry System — interior",
        caption: "Interior · 02",
      },
    ],
    details: [
      "Matte exterior",
      "Modular interior",
      "Reinforced strap",
      "Embossed serial",
    ],
    scarcity: {
      labels: ["Limited Release", "No Restock"],
      stockRemaining: 22,
      totalAllocation: 60,
    },
  }),
] as const;

import { getPublicProducts, getPublicProductBySlug } from "@/lib/wearables/store";
import type { PublicProduct } from "@/lib/wearables/types";

export function publicProductToDrop(p: PublicProduct): Drop {
  const priceAmount = p.basePricePaise / 100;
  const currency = p.currency || "INR";
  const displayPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(priceAmount);

  const heroImage = p.primaryImageUrl || p.galleryJson[0]?.src || DROP_IMAGES.jacket;

  return {
    slug: p.slug,
    name: p.title,
    price: {
      amount: priceAmount,
      currency,
      display: displayPrice,
    },
    description: p.description || "",
    image: heroImage,
    imageAlt: `${p.title} — ${p.subtitle || "Ascend Wearable"}`,
    category: (p.category as DropCategory) || "apparel",
    dropName: p.subtitle || "Ascend / Release",
    tagline: p.subtitle || "Built for discipline.",
    hero: {
      image: heroImage,
      alt: `${p.title} limited release`,
    },
    story: {
      headline: p.subtitle || "Ascend Standard",
      body: [p.description || "Designed for discipline."],
    },
    visuals: p.galleryJson.map((g, idx) => ({
      src: g.src,
      alt: g.alt || `${p.title} — visual ${idx + 1}`,
      caption: g.caption || `Visual · 0${idx + 1}`,
    })),
    details: p.materials ? p.materials.split(",").map((s) => s.trim()) : ["Matte shell", "Editorial cut"],
    scarcity: {
      labels: ["Limited Release", "No Restock"],
      stockRemaining: p.variants.reduce((acc, v) => acc + v.stockQuantity, 0),
      totalAllocation: 100,
    },
  };
}

const dropMap = new Map(DROPS.map((d) => [d.slug, d]));

export function getDropBySlug(slug: string): Drop | undefined {
  return dropMap.get(slug);
}

export async function getDropBySlugAsync(slug: string): Promise<Drop | undefined> {
  const p = await getPublicProductBySlug(slug);
  if (!p) return undefined;
  return publicProductToDrop(p);
}

export function getAllDropSlugs(): string[] {
  return DROPS.map((d) => d.slug);
}

export async function getAllDropSlugsAsync(): Promise<string[]> {
  const products = await getPublicProducts();
  if (products.length > 0) return products.map((p) => p.slug);
  return getAllDropSlugs();
}

export function getDropsByCategory(category: DropCategory): Drop[] {
  return DROPS.filter((d) => d.category === category);
}

export async function getDropsByCategoryAsync(category: DropCategory): Promise<Drop[]> {
  const products = await getPublicProducts();
  const filtered = products.filter((p) => p.category === category);
  if (filtered.length > 0) {
    return filtered.map(publicProductToDrop);
  }
  return getDropsByCategory(category);
}

export function getFeaturedDrop(): Drop {
  return DROPS[0]!;
}
