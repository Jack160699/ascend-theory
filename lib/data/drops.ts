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
  jacket: "/images/ascend/team-studio.webp",
  vest: "/images/ascend/lifestyle-golf.webp",
  optics: "/images/ascend/lifestyle-airport.webp",
  carry: "/images/ascend/lifestyle-coastal.webp",
  architecture: "/images/ascend/editorial-architecture.webp",
  dining: "/images/ascend/brotherhood-dining.webp",
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
    description:
      "Matte shell. Structured silhouette. Built for presence.",
    image: DROP_IMAGES.jacket,
    category: "apparel",
    dropName: "Ascend / 01",
    tagline: "Identity you wear before you speak.",
    story: {
      headline: "Not outerwear. A standard.",
      body: [
        "Cut for people who already live with intention — founders, creators, operators who move through cities and silence with the same discipline.",
        "Matte black. No logo theatre. A silhouette that reads before you introduce yourself.",
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
  }),
  buildDrop({
    slug: "ascend-shell-vest",
    name: "The Shell Vest",
    price: 340,
    description:
      "Lightweight layer. Clean lines. Built for transit and focus.",
    image: DROP_IMAGES.vest,
    category: "apparel",
    dropName: "Ascend / 04",
    tagline: "Structure without weight.",
    story: {
      headline: "A layer that disappears until it defines you.",
      body: [
        "The Shell Vest is cut for movement between studio, street, and travel — a matte layer that holds posture without bulk.",
        "Interior carry. Minimal hardware. Designed to read sharp under low light.",
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
      "Matte ripstop shell",
      "Zip interior pocket",
      "Relaxed athletic fit",
      "Unisex sizing · XS–XL",
      "Limited numbered run",
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
    description:
      "Hand-finished acetate. No branding on the lens. Built for focus in motion.",
    image: DROP_IMAGES.optics,
    category: "eyewear",
    dropName: "Ascend / 02",
    tagline: "Sharp lines. Low light. City and coast.",
    story: {
      headline: "See the room before you enter it.",
      body: [
        "Eyewear as posture — not accessory theatre. Ascend Optics I is cut for low light, long days, and the quiet confidence of people who do not need to announce themselves.",
        "Matte temple. Hidden hinge. A frame that disappears until someone asks where you got it.",
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
  }),
  buildDrop({
    slug: "ascend-carry",
    name: "The Carry System",
    price: 260,
    description:
      "Modular interior. Matte hardware. Designed to disappear against black.",
    image: DROP_IMAGES.carry,
    category: "accessories",
    dropName: "Ascend / 03",
    tagline: "Restraint as luxury. Details that stay close.",
    story: {
      headline: "What you carry is what you protect.",
      body: [
        "The Carry System is not a bag — it is a mobile discipline kit. Laptop sleeve, document pocket, and a hidden compartment for the things you do not display.",
        "Built for operators who move between studio, street, and silence without repacking their identity.",
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
      "Water-resistant matte exterior",
      "Modular interior dividers",
      "Reinforced carry strap",
      'Fits 16" laptop + tablet',
      "Limited run · embossed serial",
    ],
    scarcity: {
      labels: ["Limited Release", "No Restock"],
      stockRemaining: 22,
      totalAllocation: 60,
    },
  }),
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
