"use client";

import type { ReactNode } from "react";
import {
  cinematicSceneRootProps,
  type HomeSceneId,
} from "@/lib/cinematic-v2/cinematic-layout";
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
  return (
    <section
      {...cinematicSceneRootProps(scene)}
      id={anchorId}
      aria-label={ariaLabel}
      {...(conversionZone ? { "data-conversion-zone": conversionZone } : {})}
      className={cn(
        "relative isolate min-h-[100dvh] min-h-[100svh] w-full overflow-hidden scroll-mt-24 bg-ascend-canvas text-white",
        "[transform-style:preserve-3d]",
        className,
      )}
      style={{ perspective: "min(2200px, 120vw)" }}
    >
      {atmosphere}

      <div className="relative min-h-[100dvh] min-h-[100svh] w-full [transform-style:preserve-3d]">
        <div
          data-scene-camera
          className="relative flex min-h-[100dvh] min-h-[100svh] w-full flex-col will-change-transform [backface-visibility:hidden] [transform-style:preserve-3d]"
        >
          {children}
        </div>
      </div>

      {/* Continuity rail into the next beat — transform-only fog drift */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[min(11rem,22dvh)] sm:h-[min(12rem,24dvh)]"
        aria-hidden
        data-cinematic-fog="6"
        style={{
          background:
            "linear-gradient(to top, rgba(5,5,6,0.88) 0%, rgba(5,5,6,0.35) 42%, transparent 100%)",
        }}
      />
    </section>
  );
}
