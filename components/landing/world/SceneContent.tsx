"use client";

import type { CopyPlacement, StoryDisplayScale } from "@/lib/figma-world-content";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const DISPLAY_CLASS: Record<StoryDisplayScale, string> = {
  lg: "world-display--lg",
  md: "world-display--md",
  env: "world-display--env",
  sm: "world-display--sm",
};

type SceneContentProps = {
  children: ReactNode;
  placement: CopyPlacement;
  display?: StoryDisplayScale;
  className?: string;
  innerClassName?: string;
};

export function SceneContent({
  children,
  placement,
  display,
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
      data-display={display}
    >
      {children}
    </div>
  );
}

export function StoryHeadline({
  display,
  className,
  children,
}: {
  display: StoryDisplayScale;
  className?: string;
  children: ReactNode;
}) {
  return (
    <h2 className={cn("world-display world-story-headline mb-6", DISPLAY_CLASS[display], className)}>
      {children}
    </h2>
  );
}

export function StoryEyebrow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <p className={cn("world-eyebrow", className)}>{children}</p>;
}
