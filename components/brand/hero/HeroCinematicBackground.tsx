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

type HeroCinematicBackgroundProps = {
  /** Portal: de-emphasized texture. Default: standard cinematic hero. */
  variant?: "default" | "editorial";
};

/**
 * Full-bleed hero video with optional editorial (atmospheric) treatment.
 */
export function HeroCinematicBackground({
  variant = "default",
}: HeroCinematicBackgroundProps) {
  const isEditorial = variant === "editorial";
  const reduceMotion = useSyncExternalStore(
    subscribeReduce,
    getReduceSnapshot,
    getReduceServerSnapshot,
  );

  const [mobileLoaded, setMobileLoaded] = useState(false);
  const [desktopLoaded, setDesktopLoaded] = useState(false);

  const videoFadeIn = (loaded: boolean) =>
    cn(
      "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-out",
      loaded ? "opacity-100" : "opacity-0",
    );

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        data-hero-bg-zoom
        className={cn(
          "absolute inset-0 overflow-hidden [transform-origin:center_center]",
          isEditorial && "scale-105 blur-[2px] opacity-30",
        )}
      >
        {!reduceMotion ? (
          <>
            <video
              {...VIDEO_PROPS}
              className={cn(videoFadeIn(mobileLoaded), "md:hidden")}
              src={HERO_VIDEO.mobile}
              onLoadedData={() => setMobileLoaded(true)}
            />
            <video
              {...VIDEO_PROPS}
              className={cn(videoFadeIn(desktopLoaded), "hidden md:block")}
              src={HERO_VIDEO.desktop}
              onLoadedData={() => setDesktopLoaded(true)}
            />
          </>
        ) : null}
      </div>

      <div className="brand-hero-overlay bg-black/60" />
      <div className="brand-vignette" />
      <div className="brand-depth-fade" />
      {isEditorial ? <div className="portal-editorial-grain" aria-hidden /> : null}
    </div>
  );
}
