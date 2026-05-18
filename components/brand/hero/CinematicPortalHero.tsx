"use client";

import { HeroCinematicBackground } from "@/components/brand/hero/HeroCinematicBackground";
import { BRAND, HERO_PORTAL_SUBLINE } from "@/lib/brand/content";
import { PORTAL_DIRECTIONS } from "@/lib/brand/routes";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

const SUBTEXT_DELAY_MS = 800;
const HIDE_TEXT_DELAY_MS = 2500;
const DIRECTIONS_DELAY_MS = 3000;
const NAVIGATE_DELAY_MS = 800;

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
 * Timed gateway: brand intro → bottom-up direction stack → fade-to-black navigation.
 */
export function CinematicPortalHero() {
  const router = useRouter();
  const reduceMotion = useSyncExternalStore(
    subscribeReduce,
    getReduceSnapshot,
    getReduceServerSnapshot,
  );

  const [showSubtext, setShowSubtext] = useState(false);
  const [hideText, setHideText] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const subtextDelay = reduceMotion ? 0 : SUBTEXT_DELAY_MS;
    const hideTextDelay = reduceMotion ? 0 : HIDE_TEXT_DELAY_MS;
    const directionsDelay = reduceMotion ? 0 : DIRECTIONS_DELAY_MS;

    const subtextTimer = window.setTimeout(
      () => setShowSubtext(true),
      subtextDelay,
    );
    const hideTextTimer = window.setTimeout(
      () => setHideText(true),
      hideTextDelay,
    );
    const directionsTimer = window.setTimeout(
      () => setShowDirections(true),
      directionsDelay,
    );

    return () => {
      window.clearTimeout(subtextTimer);
      window.clearTimeout(hideTextTimer);
      window.clearTimeout(directionsTimer);
    };
  }, [reduceMotion]);

  const handleDirectionClick = useCallback(
    (href: string) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      window.setTimeout(() => {
        router.push(href);
      }, NAVIGATE_DELAY_MS);
    },
    [isTransitioning, router],
  );

  return (
    <section className="portal-screen" aria-label="Ascend Theory entry">
      <HeroCinematicBackground />

      <p
        className="absolute left-6 top-6 z-20 text-sm tracking-[0.3em] text-white/80"
        aria-hidden={hideText && showDirections}
      >
        {BRAND.mark}
      </p>

      <div
        className={cn(
          "portal-cinematic__intro",
          hideText && "portal-cinematic__intro--out",
        )}
        aria-hidden={hideText && showDirections}
      >
        <h1 className="portal-cinematic__title">{BRAND.mark}</h1>
        <p
          className={cn(
            "portal-cinematic__sub",
            showSubtext && "portal-cinematic__sub--in",
          )}
        >
          {HERO_PORTAL_SUBLINE}
        </p>
      </div>

      <nav
        className={cn(
          "absolute bottom-16 right-16 z-[12] flex flex-col items-end space-y-3 text-right",
          showDirections ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-label="Enter the brand"
        aria-hidden={!showDirections}
      >
        {PORTAL_DIRECTIONS.map((item) => (
          <button
            key={item.href}
            type="button"
            disabled={!showDirections || isTransitioning}
            className={cn(
              "m-0 origin-right cursor-pointer border-0 bg-transparent p-0 text-right font-medium uppercase",
              "text-base tracking-widest text-white/60 opacity-0 transition-colors duration-300",
              "hover:text-white md:text-lg",
              "disabled:cursor-default",
              showDirections && "animate-rise",
            )}
            style={{ animationDelay: item.stagger }}
            onClick={() => handleDirectionClick(item.href)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div
        className={cn(
          "portal-cinematic__transition",
          isTransitioning && "portal-cinematic__transition--active",
        )}
        aria-hidden
      />
    </section>
  );
}
