"use client";

import { WorldSceneImage } from "@/components/landing/world/WorldSceneImage";
import { useIsMobileConversion } from "@/contexts/mobile-conversion";
import type { WorldSceneConfig } from "@/lib/figma-world-content";
import { sceneScrollHeight } from "@/lib/world-scene-metrics";
import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

type StickySceneProps = {
  id?: string;
  scene: WorldSceneConfig;
  contentClassName?: string;
  children: ReactNode;
  priority?: boolean;
};

/**
 * Figma WORLD SYSTEM story scene — film plate + layered gradients, CSS-only.
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
      data-beat={id}
      className="world-scene-rail world-atmosphere-rail world-story-rail relative w-full bg-[#0d0d0d]"
      style={{ height: railHeight }}
    >
      <div className="sticky top-0 h-screen min-h-[100svh] w-full overflow-hidden bg-[#0d0d0d]">
        <div className="world-scene-backdrop absolute inset-0" aria-hidden>
          <div className="world-scene-media">
            <WorldSceneImage media={scene.media} priority={priority} />
          </div>

          <div
            className="world-scene-film absolute inset-0"
            style={{ "--world-film": scene.filmOpacity } as CSSProperties}
          />
          <div className="world-scene-lift absolute inset-0" />
          <div
            className={cn(
              "world-scene-gradient absolute inset-0 world-scene-layer-enter",
              `world-scene-gradient--${scene.gradient}`,
            )}
          />
          {scene.accent !== "none" ? (
            <div
              className={cn(
                "world-scene-accent absolute inset-0 world-scene-layer-enter",
                `world-scene-accent--${scene.accent}`,
                scene.accentBreath && "world-scene-accent--breath",
              )}
            />
          ) : null}
          {scene.accent2 ? (
            <div
              className={cn(
                "world-scene-accent world-scene-accent--secondary absolute inset-0 world-scene-layer-enter",
                `world-scene-accent--${scene.accent2}`,
              )}
            />
          ) : null}
          <div className="world-scene-vignette world-scene-vignette--story absolute inset-0" />
          <div className="world-scene-continuity absolute inset-0" />
          <div className="world-scene-emotion absolute inset-0" aria-hidden />
          <div className="world-scene-handoff world-scene-handoff--top" aria-hidden />
          <div className="world-scene-handoff world-scene-handoff--bottom" aria-hidden />
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
