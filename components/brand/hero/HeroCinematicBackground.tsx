"use client";

import { HERO_VIDEO } from "@/lib/brand/hero-media";
import Image from "next/image";
import { useSyncExternalStore } from "react";

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

const VIDEO_PROPS = {
  autoPlay: true,
  muted: true,
  loop: true,
  playsInline: true,
  preload: "auto" as const,
};

/**
 * Full-bleed hero: responsive desktop/mobile MP4 loops with poster fallback.
 */
export function HeroCinematicBackground() {
  const reduceMotion = useSyncExternalStore(
    subscribeReduce,
    getReduceSnapshot,
    getReduceServerSnapshot,
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
        />
        {!reduceMotion ? (
          <>
            <video
              {...VIDEO_PROPS}
              className="brand-hero-media absolute inset-0 z-[1] h-full w-full object-cover object-center md:hidden"
              src={HERO_VIDEO.mobile}
              poster={HERO_VIDEO.poster}
            />
            <video
              {...VIDEO_PROPS}
              className="brand-hero-media absolute inset-0 z-[1] hidden h-full w-full object-cover object-center md:block"
              src={HERO_VIDEO.desktop}
              poster={HERO_VIDEO.poster}
            />
          </>
        ) : null}
      </div>

      <div className="brand-hero-overlay" />
      <div className="brand-vignette" />
      <div className="brand-depth-fade" />
    </div>
  );
}
