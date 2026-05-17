import { getDropsByCategory, type Drop, type DropCategory } from "./drops";

const CATEGORY_META: Record<
  DropCategory,
  { title: string; line: string }
> = {
  apparel: {
    title: "Apparel",
    line: "Matte silhouettes. No logo theatre.",
  },
  eyewear: {
    title: "Eyewear",
    line: "Low light. Sharp lines.",
  },
  accessories: {
    title: "Accessories",
    line: "Restraint, carried close.",
  },
};

export type WearableCollection = {
  id: DropCategory;
  title: string;
  line: string;
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
      image: products[0]?.image ?? "",
      products,
    };
  });

export const WEARABLES_INDEX = {
  eyebrow: "Wearables",
  headline: "Objects for the focused life.",
  description: "Limited drops. One language. Enter by collection.",
} as const;
