import { DROPS } from "@/lib/data/drops";
import type { CartProduct } from "./types";

const CATALOG: Record<string, CartProduct> = Object.fromEntries(
  DROPS.map((drop) => [
    drop.slug,
    {
      slug: drop.slug,
      name: drop.productName,
      dropName: drop.dropName,
      image: drop.hero.image,
      imageAlt: drop.hero.alt,
      price: drop.price.amount,
      currency: drop.price.currency,
      priceDisplay: drop.price.display,
      maxQuantity: drop.scarcity.stockRemaining,
    },
  ]),
);

export function getCartProduct(slug: string): CartProduct | undefined {
  return CATALOG[slug];
}

export function getDefaultCartProduct(): CartProduct {
  return CATALOG[DROPS[0]!.slug]!;
}
