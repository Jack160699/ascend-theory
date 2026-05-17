import {
  DROPS,
  getDropsByCategory,
  type Drop,
  type DropCategory,
} from "./drops";

const CATEGORY_META: Record<
  DropCategory,
  { title: string; line: string; cta: string }
> = {
  apparel: {
    title: "Apparel",
    line: "Matte silhouettes. Editorial cuts. No logos shouting.",
    cta: "View Drop →",
  },
  eyewear: {
    title: "Eyewear",
    line: "Sharp lines. Low light. City and coast.",
    cta: "View Drop →",
  },
  accessories: {
    title: "Accessories",
    line: "Restraint as luxury. Details that stay close.",
    cta: "View Drop →",
  },
};

export type WearableCollection = {
  id: DropCategory;
  title: string;
  line: string;
  cta: string;
  image: string;
  products: readonly Drop[];
};

const CATEGORY_ORDER: readonly DropCategory[] = [
  "apparel",
  "eyewear",
  "accessories",
];

export const WEARABLE_COLLECTIONS: readonly WearableCollection[] =
  CATEGORY_ORDER.map((id) => {
    const products = getDropsByCategory(id);
    const meta = CATEGORY_META[id];
    return {
      id,
      title: meta.title,
      line: meta.line,
      cta: meta.cta,
      image: products[0]?.image ?? "",
      products,
    };
  });

export const WEARABLES_INDEX = {
  eyebrow: "Wearables",
  headline: "Objects for the focused life.",
  description: `${DROPS.length} limited drops across three collections. One visual language — not a catalog.`,
} as const;
