import { BRAND_IMAGES } from "@/lib/brand/images";

/**
 * Hero cinematic background — keep each file under ~2MB.
 * Place assets in `public/videos/` (see README in that folder).
 */
export const HERO_VIDEO = {
  webm: "/videos/hero-intro.webm",
  mp4: "/videos/hero-intro.mp4",
  poster: BRAND_IMAGES.hero,
} as const;
