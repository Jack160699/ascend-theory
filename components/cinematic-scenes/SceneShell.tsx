"use client";

import type { ReactNode } from "react";
import {
  cinematicSceneRootProps,
  type HomeSceneId,
} from "@/lib/cinematic-v2/cinematic-layout";
import { HOME_SCENE_SPATIAL } from "@/lib/cinematic-v2/emotional-rhythm";
import {
  HOME_SCENE_NARRATIVE_KIND,
  sceneRailClass,
} from "@/lib/cinematic-v2/scene-environment";
import { cn } from "@/lib/utils";

/**
 * One narrative beat: full viewport, isolated stacking, camera column for
 * transform-only scroll drift (see MasterSceneOrchestrator).
 */
export function SceneShell({
  scene,
  anchorId,
  ariaLabel,
  conversionZone,
  atmosphere,
  children,
  className,
}: {
  scene: HomeSceneId;
  anchorId: string;
  ariaLabel: string;
  /** Optional analytics / conversion key (omit when not a conversion surface). */
  conversionZone?: string;
  /** Minimal absolute layers (e.g. gradients + `data-cinematic-parallax`). */
  atmosphere?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const spatial = HOME_SCENE_SPATIAL[scene];
  const blockMin =
    spatial === "open"
      ? "min-h-[min(108dvh,108svh)]"
      : spatial === "intimate"
        ? "min-h-[min(98dvh,98svh)]"
        : "min-h-[min(100dvh,100svh)]";

  return (
    <section
      {...cinematicSceneRootProps(scene)}
      data-scene-spatial={spatial}
      data-scene-environment={HOME_SCENE_NARRATIVE_KIND[scene]}
      id={anchorId}
      aria-label={ariaLabel}
      {...(conversionZone ? { "data-conversion-zone": conversionZone } : {})}
      className={cn(
        "ascend-scene-rhythm-root relative isolate w-full overflow-hidden scroll-mt-24 bg-ascend-canvas text-white [transform-style:preserve-3d]",
        blockMin,
        className,
      )}
      style={{ perspective: "min(2200px, 120vw)" }}
    >
      {atmosphere}

      <div
        className={cn(
          "relative w-full [transform-style:preserve-3d]",
          blockMin,
        )}
      >
        <div
          data-scene-camera
          className={cn(
            "relative flex w-full flex-col will-change-transform [backface-visibility:hidden] [transform-style:preserve-3d]",
            blockMin,
          )}
        >
          {children}
        </div>
      </div>

      {/* Continuity rail — opacity follows emotional handoff (next room bleeds in early) */}
      <div
        className={cn(
          "ascend-scene-rail pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[min(11rem,22dvh)] sm:h-[min(12rem,24dvh)]",
          sceneRailClass(scene),
        )}
        aria-hidden
        data-cinematic-fog="6"
      />
    </section>
  );
}
