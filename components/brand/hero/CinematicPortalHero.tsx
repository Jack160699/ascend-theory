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
 * Timed gateway: brand intro → spatial directions → fade-to-black navigation.
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
      <HeroCinematicBackground overlayOpacity={0.6} />

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
          "portal-cinematic__directions",
          showDirections && "portal-cinematic__directions--visible",
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
              "portal-cinematic__direction",
              `portal-cinematic__direction--${item.placement}`,
            )}
            onClick={() => handleDirectionClick(item.href)}
          >
            <span
              className="portal-cinematic__direction-label"
              style={{ animationDelay: item.stagger }}
            >
              {item.label}
            </span>
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
