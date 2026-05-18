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

const MENU_ITEM_CLASS =
  "m-0 cursor-pointer border-0 bg-transparent p-0 text-right font-light uppercase whitespace-nowrap text-[clamp(20px,4vw,48px)] tracking-[0.25em] text-white/70 opacity-0 transition-[color,transform,opacity] duration-300 hover:scale-105 hover:text-white md:tracking-[0.35em]";

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
 * Luxury editorial portal — typography-led menu over atmospheric video.
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
    <section
      className="portal-screen portal-screen--editorial min-h-[120vh]"
      aria-label="Ascend Theory entry"
    >
      <HeroCinematicBackground variant="editorial" />

      <p
        className="absolute left-6 top-6 z-20 text-xs font-light tracking-[0.4em] text-white/80 md:text-sm"
        aria-hidden={hideText && showDirections}
      >
        {BRAND.mark}
      </p>

      <div
        className={cn(
          "pointer-events-none absolute left-[8%] top-[45%] z-10 text-left transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.33,1,0.68,1)] md:left-[10%]",
          hideText && "-translate-y-2.5 opacity-0",
        )}
        aria-hidden={hideText && showDirections}
      >
        <h1 className="m-0 whitespace-nowrap text-[clamp(1.5rem,4vw,2.75rem)] font-light leading-[1.1] tracking-[0.2em] text-white">
          {BRAND.mark}
        </h1>
        <p
          className={cn(
            "m-0 mt-6 text-[clamp(0.65rem,1.2vw,0.85rem)] font-light uppercase tracking-[0.35em] text-white/60 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.33,1,0.68,1)]",
            showSubtext ? "translate-y-0 opacity-100" : "translate-y-3.5 opacity-0",
          )}
        >
          {HERO_PORTAL_SUBLINE}
        </p>
      </div>

      <nav
        className={cn(
          "absolute right-6 top-[42%] z-[12] flex flex-col items-end space-y-8 text-right md:right-[8%] md:top-[38%] md:space-y-10",
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
              MENU_ITEM_CLASS,
              "origin-right disabled:cursor-default",
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
