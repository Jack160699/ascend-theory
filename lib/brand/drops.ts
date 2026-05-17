import { DROP_PRODUCT, type DropProduct } from "@/lib/brand/drop-product";

const CATALOG: Record<string, DropProduct> = {
  [DROP_PRODUCT.slug]: DROP_PRODUCT,
};

export function getDropBySlug(slug: string): DropProduct | undefined {
  return CATALOG[slug];
}

export function getAllDropSlugs(): string[] {
  return Object.keys(CATALOG);
}
