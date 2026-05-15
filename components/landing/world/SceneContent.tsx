"use client";

import type { CopyPlacement } from "@/lib/figma-world-content";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SceneContentProps = {
  children: ReactNode;
  placement: CopyPlacement;
  className?: string;
  innerClassName?: string;
};

export function SceneContent({
  children,
  placement,
  className,
  innerClassName,
}: SceneContentProps) {
  if (placement === "hero-split") {
    return (
      <div className={cn("world-hero-copy pb-12", className)}>
        <div className={cn("world-scene-copy world-copy-enter", innerClassName)}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "world-scene-copy world-copy-enter",
        placement === "bottom-16" && "world-copy--bottom-16",
        placement === "bottom-20" && "world-copy--bottom-20",
        placement === "bottom-20-left" && "world-copy--bottom-20-left",
        placement === "center-left" && "world-copy--center-left",
        innerClassName,
        className,
      )}
    >
      {children}
    </div>
  );
}
