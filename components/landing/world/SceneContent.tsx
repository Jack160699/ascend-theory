"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SceneContentProps = {
  children: ReactNode;
  layout?: "bottom" | "center" | "center-left";
  className?: string;
  innerClassName?: string;
};

export function SceneContent({
  children,
  layout = "bottom",
  className,
  innerClassName,
}: SceneContentProps) {
  return (
    <div
      className={cn(
        "world-scene-content",
        layout === "bottom" && "world-scene-content--bottom",
        layout === "center" && "world-scene-content--center",
        layout === "center-left" && "world-scene-content--center-left",
        className,
      )}
    >
      <div className="world-scene-scrim" aria-hidden />
      <div className={cn("world-scene-copy", innerClassName)}>{children}</div>
    </div>
  );
}
