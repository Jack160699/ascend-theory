"use client";

import type { WorldSceneMedia } from "@/lib/world-images";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCallback, useState } from "react";

type WorldSceneImageProps = {
  media: WorldSceneMedia;
  priority?: boolean;
  className?: string;
};

/**
 * Full-bleed WORLD scene still — Figma crops via objectPosition only.
 */
export function WorldSceneImage({
  media,
  priority = false,
  className,
}: WorldSceneImageProps) {
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);

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
      className={cn("object-cover", className)}
      style={{ objectPosition: media.objectPosition }}
      onError={onError}
    />
  );
}
