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
 * CSS-only sticky scene (Figma WORLD SYSTEM). No scroll listeners or blur.
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
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <AscendImage
            src={scene.image}
            alt={scene.imageAlt}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            quality={priority ? 78 : 68}
            sizes="100vw"
            className={cn(scene.imageClass, "object-cover")}
            style={
              scene.imagePosition
                ? { objectPosition: scene.imagePosition }
                : undefined
            }
          />
          <div className={cn("absolute inset-0", scene.scrimClass)} aria-hidden />
          <div
            className={cn("absolute inset-0", scene.gradientClass)}
            aria-hidden
          />
          {scene.warmGlow ? (
            <div className="world-warm-glow absolute inset-0 opacity-[0.14]" aria-hidden />
          ) : null}
        </div>

        <div
          className={cn(
            "relative z-10 flex h-full w-full",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
