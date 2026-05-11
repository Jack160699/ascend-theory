"use client";

import { cn } from "@/lib/utils";
import Image, { type ImageProps } from "next/image";
import { useCallback, useState } from "react";

type AscendImageProps = Omit<ImageProps, "onError">;

/**
 * Next/Image with graceful failure: keeps layout, no empty holes.
 */
export function AscendImage({ className, alt, ...rest }: AscendImageProps) {
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);

  if (failed) {
    const label = typeof alt === "string" ? alt : "Image unavailable";
    return (
      <div
        className={cn(
          rest.fill ? "absolute inset-0" : "",
          "bg-[radial-gradient(ellipse_at_30%_20%,rgba(63,63,70,0.35),rgba(9,9,11,0.96)_65%)]",
          "ring-1 ring-inset ring-white/[0.05]",
          className,
        )}
        role="img"
        aria-label={label}
      />
    );
  }

  return (
    <Image {...rest} alt={alt} className={className} onError={onError} />
  );
}
