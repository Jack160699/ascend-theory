"use client";

import {
  PRODUCT_IMAGE_FALLBACK,
  getProductImageFallback,
  normalizeProductImagePath,
} from "@/lib/product-images";
import { cn } from "@/lib/utils";
import Image, { type ImageProps } from "next/image";
import { useCallback, useState } from "react";

type AscendImageProps = Omit<ImageProps, "onError" | "src"> & {
  src: string;
  /** Override default `/images/fallback.webp` */
  fallbackSrc?: string;
};

/**
 * Next/Image with graceful failure: local → remote CDN → fallback file → placeholder.
 */
export function AscendImage(props: AscendImageProps) {
  return <AscendImageInner key={props.src} {...props} />;
}

function AscendImageInner({
  className,
  alt,
  src,
  fallbackSrc = PRODUCT_IMAGE_FALLBACK,
  ...rest
}: AscendImageProps) {
  const primary = normalizeProductImagePath(src);
  const [currentSrc, setCurrentSrc] = useState(primary);
  const [exhausted, setExhausted] = useState(false);

  const onError = useCallback(() => {
    setCurrentSrc((prev) => {
      const next = getProductImageFallback(prev, normalizeProductImagePath(fallbackSrc));
      if (next === prev) {
        setExhausted(true);
        return prev;
      }
      return next;
    });
  }, [fallbackSrc]);

  if (exhausted) {
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

  const isRemote = currentSrc.startsWith("http");

  return (
    <Image
      {...rest}
      src={currentSrc}
      alt={alt}
      className={cn("ascend-media", className)}
      onError={onError}
      unoptimized={isRemote}
    />
  );
}
