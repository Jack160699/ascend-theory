"use client";

import { HERO_VIDEO } from "@/lib/brand/hero-media";
import Image from "next/image";
import { useCallback, useSyncExternalStore } from "react";

function subscribeMobile(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(max-width: 768px)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getMobileSnapshot() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function getMobileServerSnapshot() {
  return false;
}

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

/**
 * Full-bleed hero media: video on desktop, poster on mobile / fallback.
 * Zoom target is `[data-hero-bg-zoom]` (GSAP in brand-reveal).
 */
export function HeroCinematicBackground() {
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );
  const reduceMotion = useSyncExternalStore(
    subscribeReduce,
    getReduceSnapshot,
    getReduceServerSnapshot,
  );

  const useVideo = !isMobile && !reduceMotion;

  const onVideoError = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      e.currentTarget.style.display = "none";
    },
    [],
  );

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
          aria-hidden
        />
        {useVideo ? (
          <video
            className="brand-hero-media absolute inset-0 z-[1] h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={HERO_VIDEO.poster}
            onError={onVideoError}
          >
            <source src={HERO_VIDEO.webm} type="video/webm" />
            <source src={HERO_VIDEO.mp4} type="video/mp4" />
          </video>
        ) : null}
      </div>

      <div className="brand-hero-overlay" />
      <div className="brand-vignette" />
      <div className="brand-depth-fade" />
    </div>
  );
}
