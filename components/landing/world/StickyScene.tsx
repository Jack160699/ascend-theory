"use client";

import { ASCEND_IMAGE_CLASS } from "@/lib/cinematic-composition";
import { cn } from "@/lib/utils";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import { useRef, type ReactNode } from "react";

type ParallaxConfig = {
  scale?: [number, number];
  y?: [number, number];
  opacity?: [number, number];
};

type StickySceneProps = {
  id?: string;
  scrollHeight?: string;
  image: string;
  imageAlt: string;
  imageClass?: string;
  imagePosition?: string;
  overlayClass?: string;
  gradientClass?: string;
  warmGlowClass?: string;
  extraOverlay?: ReactNode;
  contentClassName: string;
  children: ReactNode;
  /** Hero uses start-start offset; story beats use start-end */
  variant?: "hero" | "story";
  parallax?: ParallaxConfig;
  contentOpacity?: MotionValue<number> | null;
};

export function StickyScene({
  id,
  scrollHeight = "130vh",
  image,
  imageAlt,
  imageClass,
  imagePosition = "center",
  overlayClass = "bg-[#0d0d0d]/85",
  gradientClass = "bg-gradient-to-b from-[#0d0d0d]/70 via-[#0d0d0d]/80 to-[#0d0d0d]",
  warmGlowClass,
  extraOverlay,
  contentClassName,
  children,
  variant = "story",
  parallax,
  contentOpacity: externalOpacity,
}: StickySceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset:
      variant === "hero"
        ? ["start start", "end start"]
        : ["start end", "end start"],
  });

  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    parallax?.scale ?? (variant === "hero" ? [1, 1.12] : [1, 1]),
  );
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    parallax?.y ?? (variant === "hero" ? [0, -30] : [40, -40]),
  );
  const internalOpacity = useTransform(
    scrollYProgress,
    variant === "hero" ? [0, 0.5, 1] : [0.2, 0.45, 0.75],
    variant === "hero" ? [0.75, 0.8, 0.9] : [0, 1, 0],
  );
  const contentOpacity = externalOpacity ?? internalOpacity;
  const heroOverlayOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.75, 0.8, 0.9],
  );

  return (
    <div
      id={id}
      ref={ref}
      className="relative w-full"
      style={{ height: scrollHeight }}
    >
      <motion.div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0d0d0d]">
        <motion.div
          className="absolute inset-0"
          style={
            reduceMotion
              ? undefined
              : { scale, y }
          }
        >
          <Image
            src={image}
            alt={imageAlt}
            fill
            className={cn(
              imageClass ?? ASCEND_IMAGE_CLASS.heroStorefront,
              "object-cover",
            )}
            style={{ objectPosition: imagePosition }}
            sizes="100vw"
            priority={variant === "hero"}
          />
        </motion.div>

        {variant === "hero" ? (
          <motion.div
            className="absolute inset-0 bg-[#0d0d0d]"
            style={reduceMotion ? { opacity: 0.82 } : { opacity: heroOverlayOpacity }}
          />
        ) : (
          <div className={cn("absolute inset-0", overlayClass)} />
        )}

        <div className={cn("absolute inset-0", gradientClass)} />
        {warmGlowClass ? (
          <motion.div
            className={cn("absolute inset-0 opacity-15 sm:opacity-20", warmGlowClass)}
            aria-hidden
          />
        ) : null}
        {extraOverlay}

        <motion.div
          className={cn("relative z-10 h-full", contentClassName)}
          style={
            contentOpacity === null
              ? undefined
              : reduceMotion
                ? undefined
                : { opacity: contentOpacity }
          }
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
