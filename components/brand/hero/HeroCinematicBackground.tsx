"use client";

import { HERO_VIDEO, HERO_VIDEO_REMOTE_FALLBACK } from "@/lib/brand/hero-media";
import Image from "next/image";
import { useCallback, useState, useSyncExternalStore } from "react";

function subscribeReduce(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReduceSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReduceServerSnapshot() {
  return false;
}

const VIDEO_SOURCES = [
  { webm: HERO_VIDEO.webm, mp4: HERO_VIDEO.mp4 },
  {
    webm: HERO_VIDEO_REMOTE_FALLBACK.webm,
    mp4: HERO_VIDEO_REMOTE_FALLBACK.mp4,
  },
] as const;

/**
 * Full-bleed hero: local WebM + MP4 from /public/videos/, poster + remote fallback.
 */
export function HeroCinematicBackground() {
  const reduceMotion = useSyncExternalStore(
    subscribeReduce,
    getReduceSnapshot,
    getReduceServerSnapshot,
  );
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = VIDEO_SOURCES[sourceIndex] ?? VIDEO_SOURCES[0];

  const onVideoError = useCallback(() => {
    setSourceIndex((i) => (i < VIDEO_SOURCES.length - 1 ? i + 1 : i));
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        data-hero-bg-zoom
        className="absolute inset-0 [transform-origin:center_center]"
      >
        <Image
          src={HERO_VIDEO.poster}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {!reduceMotion && sourceIndex < VIDEO_SOURCES.length ? (
          <video
            key={sourceIndex}
            className="brand-hero-media absolute inset-0 z-[1] h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={HERO_VIDEO.poster}
            onError={onVideoError}
          >
            <source src={sources.webm} type="video/webm" />
            <source src={sources.mp4} type="video/mp4" />
          </video>
        ) : null}
      </div>

      <div className="brand-hero-overlay" />
      <div className="brand-vignette" />
      <div className="brand-depth-fade" />
    </div>
  );
}
