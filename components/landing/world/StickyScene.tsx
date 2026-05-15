"use client";

import { AscendImage } from "@/components/AscendImage";
import { ASCEND_IMAGE_CLASS } from "@/lib/cinematic-composition";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Full-viewport editorial scene — static, no scroll-driven motion. */
type WorldSceneProps = {
  id?: string;
  image: string;
  imageAlt: string;
  imageClass?: string;
  imagePosition?: string;
  contentClassName?: string;
  children: ReactNode;
  priority?: boolean;
};

export function StickyScene({
  id,
  image,
  imageAlt,
  imageClass,
  imagePosition = "center",
  contentClassName,
  children,
  priority = false,
}: WorldSceneProps) {
  return (
    <section
      id={id}
      className="world-scene relative w-full bg-[#0d0d0d]"
    >
      <div className="absolute inset-0">
        <AscendImage
          src={image}
          alt={imageAlt}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          quality={priority ? 80 : 70}
          sizes="100vw"
          className={cn(
            imageClass ?? ASCEND_IMAGE_CLASS.heroStorefront,
            "object-cover",
          )}
          style={{ objectPosition: imagePosition }}
        />
        <div className="world-scene-overlay" aria-hidden />
      </div>

      <div
        className={cn(
          "world-scene-inner relative z-10 flex min-h-svh",
          contentClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
