import { STOCK_HERO_VIDEO, STOCK_IMAGES } from "@/lib/stock-media";

/**
 * Hero cinematic background — self-hosted in `public/videos/`.
 * Run `npm run download:hero-video` if files are missing.
 * Target: each file under ~2MB (see public/videos/README.md).
 */
export const HERO_VIDEO = {
  webm: "/videos/hero-intro.webm",
  mp4: "/videos/hero-intro.mp4",
  poster: STOCK_IMAGES.heroStorefront,
} as const;

/** Used only when local /public files are missing (see HeroCinematicBackground). */
export const HERO_VIDEO_REMOTE_FALLBACK = {
  webm: STOCK_HERO_VIDEO.webm,
  mp4: STOCK_HERO_VIDEO.mp4,
} as const;
