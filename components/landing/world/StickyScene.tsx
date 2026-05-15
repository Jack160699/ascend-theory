"use client";

import { AscendImage } from "@/components/AscendImage";
import { useIsMobileConversion } from "@/contexts/mobile-conversion";
import type { WorldSceneConfig } from "@/lib/figma-world-content";
import { sceneScrollHeight } from "@/lib/world-scene-metrics";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type StickySceneProps = {
  id?: string;
  scene: WorldSceneConfig;
  contentClassName?: string;
  children: ReactNode;
  priority?: boolean;
};

/**
 * Figma WORLD SYSTEM scene — CSS-only drift, exact overlay stack, no scroll JS.
 */
export function StickyScene({
  id,
  scene,
  contentClassName,
  children,
  priority = false,
}: StickySceneProps) {
  const isMobile = useIsMobileConversion();
  const railHeight = sceneScrollHeight(scene.scroll, isMobile);

  return (
    <section
      id={id}
      className="world-scene-rail relative w-full bg-[#0d0d0d]"
      style={{ height: railHeight }}
    >
      <div className="sticky top-0 h-screen min-h-[100svh] w-full overflow-hidden bg-[#0d0d0d]">
        <div className="world-scene-backdrop absolute inset-0" aria-hidden>
          <div className="world-scene-media">
            <AscendImage
              src={scene.image}
              alt=""
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              quality={priority ? 80 : 70}
              sizes="100vw"
              className={cn(scene.imageClass, "object-cover")}
            />
          </div>

          <div
            className="world-scene-scrim absolute inset-0"
            style={{ backgroundColor: `rgba(13, 13, 13, ${scene.scrimOpacity})` }}
          />
          <div
            className={cn(
              "world-scene-gradient absolute inset-0 world-scene-layer-enter",
              `world-scene-gradient--${scene.gradient}`,
            )}
          />
          {scene.accent !== "none" ? (
            <div
              className={cn(
                "world-scene-accent absolute inset-0 world-scene-layer-enter world-scene-layer-enter--delay",
                `world-scene-accent--${scene.accent}`,
              )}
            />
          ) : null}
          {scene.warmGlow ? (
            <div className="world-scene-warm absolute inset-0 world-scene-layer-enter" />
          ) : null}
          <div className="world-scene-vignette absolute inset-0" />
          <div className="world-scene-continuity absolute inset-0" />
        </div>

        <div
          className={cn(
            "relative z-10 h-full w-full",
            scene.copyPlacement === "hero-split"
              ? "flex flex-col justify-between px-5 py-8"
              : contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
