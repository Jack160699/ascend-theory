import { STOCK_IMAGES } from "@/lib/stock-media";

/** Self-hosted hero loops in `public/videos/`. */
export const HERO_VIDEO_DESKTOP = "/videos/hero-desktop.mp4" as const;
export const HERO_VIDEO_MOBILE = "/videos/hero-mobile.mp4" as const;

export const HERO_VIDEO = {
  desktop: HERO_VIDEO_DESKTOP,
  mobile: HERO_VIDEO_MOBILE,
  poster: STOCK_IMAGES.heroStorefront,
} as const;
