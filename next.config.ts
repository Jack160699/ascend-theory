import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    /** Match cinematic still long edges (2600–3000px) for full-bleed sections. */
    deviceSizes: [640, 750, 828, 1080, 1200, 1280, 1536, 1920, 2048, 2560, 3000],
    imageSizes: [256, 384, 640],
    /** WebP-only keeps optimizer output aligned with Sharp-encoded stills (grain/texture). */
    formats: ["image/webp"],
  },
};

export default nextConfig;
