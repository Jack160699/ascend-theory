"use client";

import type { WorldSceneMedia, WorldSceneObjectFit } from "@/lib/world-images";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCallback, useState } from "react";

type WorldSceneImageProps = {
  media: WorldSceneMedia;
  priority?: boolean;
  className?: string;
  /** Overrides `media.objectFit` (e.g. final CTA uses cover on a story asset). */
  objectFit?: WorldSceneObjectFit;
};

/**
 * WORLD scene still — Figma crops via objectPosition; storytelling uses contain where set.
 */
export function WorldSceneImage({
  media,
  priority = false,
  className,
  objectFit: objectFitProp,
}: WorldSceneImageProps) {
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);
  const fit = objectFitProp ?? media.objectFit ?? "cover";

  if (failed) {
    return (
      <div
        className={cn("absolute inset-0 bg-[#0d0d0d]", className)}
        role="img"
        aria-label={media.alt}
      />
    );
  }

  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      quality={priority ? 82 : 68}
      sizes="100vw"
      decoding="async"
      className={cn(
        fit === "contain" ? "object-contain" : "object-cover",
        className,
      )}
      style={{ objectPosition: media.objectPosition }}
      onError={onError}
    />
  );
}
