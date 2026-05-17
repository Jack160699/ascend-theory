import { DROP_PRODUCT } from "@/lib/brand/drop-product";
import type { CartProduct } from "./types";

const CATALOG: Record<string, CartProduct> = {
  [DROP_PRODUCT.slug]: {
    slug: DROP_PRODUCT.slug,
    name: DROP_PRODUCT.productName,
    dropName: DROP_PRODUCT.dropName,
    image: DROP_PRODUCT.hero.image,
    imageAlt: DROP_PRODUCT.hero.alt,
    price: DROP_PRODUCT.price.amount,
    currency: DROP_PRODUCT.price.currency,
    priceDisplay: DROP_PRODUCT.price.display,
    maxQuantity: DROP_PRODUCT.scarcity.stockRemaining,
  },
};

export function getCartProduct(slug: string): CartProduct | undefined {
  return CATALOG[slug];
}

export function getDefaultCartProduct(): CartProduct {
  return CATALOG[DROP_PRODUCT.slug]!;
}
