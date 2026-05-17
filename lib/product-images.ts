import { stockPhoto } from "@/lib/stock-media";

/**
 * Local product stills under /public/images/ascend — single source for paths.
 */

export const ASCEND_PRODUCT_IMAGES = {
  teamStudio: "/images/ascend/team-studio.webp",
  lifestyleGolf: "/images/ascend/lifestyle-golf.webp",
  lifestyleAirport: "/images/ascend/lifestyle-airport.webp",
  lifestyleCoastal: "/images/ascend/lifestyle-coastal.webp",
  editorialArchitecture: "/images/ascend/editorial-architecture.webp",
  brotherhoodDining: "/images/ascend/brotherhood-dining.webp",
  heroStorefront: "/images/ascend/hero-storefront.webp",
} as const;

/** Remote fallbacks when a local file is missing or fails to load. */
export const ASCEND_PRODUCT_IMAGES_REMOTE: Record<
  keyof typeof ASCEND_PRODUCT_IMAGES,
  string
> = {
  teamStudio: stockPhoto("photo-1556905054-24bf8fbf6460"),
  lifestyleGolf: stockPhoto("photo-1592919670787-64ace577ec67"),
  lifestyleAirport: stockPhoto("photo-1436491865332-7a61a109cc05"),
  lifestyleCoastal: stockPhoto("photo-1505142468610-359e7caed608"),
  editorialArchitecture: stockPhoto("photo-1486406146926-c627a92ad1ab"),
  brotherhoodDining: stockPhoto("photo-1414235077428-338989a2e8d0"),
  heroStorefront: stockPhoto("photo-1514565130933-ff0f825377de"),
};

export const ASCEND_IMAGE_FALLBACK = ASCEND_PRODUCT_IMAGES.teamStudio;

/** Shared fallback used when a product image fails to load. */
export const PRODUCT_IMAGE_FALLBACK = "/images/fallback.webp";

export const PRODUCT_IMAGE_FALLBACK_REMOTE = ASCEND_PRODUCT_IMAGES_REMOTE.teamStudio;

const LOCAL_TO_REMOTE = new Map<string, string>(
  Object.entries(ASCEND_PRODUCT_IMAGES).map(([key, local]) => [
    local,
    ASCEND_PRODUCT_IMAGES_REMOTE[key as keyof typeof ASCEND_PRODUCT_IMAGES],
  ]),
);

/**
 * Normalize image paths for Next.js static files in /public.
 */
export function normalizeProductImagePath(src: string | undefined | null): string {
  if (!src || typeof src !== "string") return PRODUCT_IMAGE_FALLBACK;
  const trimmed = src.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return trimmed.replace(/\\/g, "/");
  }
  return `/${trimmed.replace(/^\.?\//, "").replace(/\\/g, "/")}`;
}

/** Next fallback in chain: local path → remote CDN → global fallback file → remote fallback. */
export function getProductImageFallback(
  failedSrc: string,
  globalFallback = PRODUCT_IMAGE_FALLBACK,
): string {
  const normalized = normalizeProductImagePath(failedSrc);
  const remote = LOCAL_TO_REMOTE.get(normalized);
  if (remote && remote !== normalized) {
    return remote;
  }
  const global = normalizeProductImagePath(globalFallback);
  if (normalized !== global) {
    return global;
  }
  if (normalized !== PRODUCT_IMAGE_FALLBACK_REMOTE) {
    return PRODUCT_IMAGE_FALLBACK_REMOTE;
  }
  return normalized;
}
