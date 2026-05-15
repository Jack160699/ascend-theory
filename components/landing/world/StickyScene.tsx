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
 * CSS-only sticky scene: subtle scale drift, layered atmosphere, section fades.
 * No scroll listeners, blur, or JS motion.
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
        <div className="world-scene-backdrop absolute inset-0" aria-hidden>
          <div className="world-scene-media">
            <AscendImage
              src={scene.image}
              alt=""
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              quality={priority ? 78 : 68}
              sizes="100vw"
              className={cn(scene.imageClass, "world-scene-image object-cover")}
              style={{ objectPosition: scene.imagePosition }}
            />
          </div>

          <div className="world-scene-atmosphere">
            <div className="world-scene-vignette" />
            <div
              className={cn(
                "world-scene-grade",
                `world-scene-grade--${scene.grade}`,
              )}
            />
            {scene.warmGlow ? <div className="world-scene-warm" /> : null}
          </div>

          <div className="world-scene-continuity" />
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
