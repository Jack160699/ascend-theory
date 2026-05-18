"use client";

import { HERO_VIDEO } from "@/lib/brand/hero-media";
import { cn } from "@/lib/utils";
import { useState, useSyncExternalStore } from "react";

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

const VIDEO_FADE_CLASS =
  "absolute inset-0 z-[1] h-full w-full object-cover object-center transition-opacity duration-700 ease-out";

/**
 * Full-bleed hero: responsive MP4 loops, opacity fade-in on load (no poster).
 */
export function HeroCinematicBackground() {
  const reduceMotion = useSyncExternalStore(
    subscribeReduce,
    getReduceSnapshot,
    getReduceServerSnapshot,
  );

  const [mobileLoaded, setMobileLoaded] = useState(false);
  const [desktopLoaded, setDesktopLoaded] = useState(false);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        data-hero-bg-zoom
        className="absolute inset-0 overflow-hidden [transform-origin:center_center]"
      >
        {!reduceMotion ? (
          <>
            <video
              {...VIDEO_PROPS}
              className={cn(
                VIDEO_FADE_CLASS,
                "md:hidden",
                mobileLoaded ? "opacity-100" : "opacity-0",
              )}
              src={HERO_VIDEO.mobile}
              onLoadedData={() => setMobileLoaded(true)}
            />
            <video
              {...VIDEO_PROPS}
              className={cn(
                VIDEO_FADE_CLASS,
                "hidden md:block",
                desktopLoaded ? "opacity-100" : "opacity-0",
              )}
              src={HERO_VIDEO.desktop}
              onLoadedData={() => setDesktopLoaded(true)}
            />
          </>
        ) : null}
      </div>

      <div className="brand-hero-overlay bg-black/60" />
      <div className="brand-vignette" />
      <div className="brand-depth-fade" />
    </div>
  );
}
