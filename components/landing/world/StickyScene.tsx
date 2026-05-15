"use client";

import { AscendImage } from "@/components/AscendImage";
import { useIsMobileConversion } from "@/contexts/mobile-conversion";
import { ASCEND_IMAGE_CLASS } from "@/lib/cinematic-composition";
import {
  resolveSceneScrollHeight,
  type SceneScrollSpec,
} from "@/lib/world-scene-metrics";
import { cn } from "@/lib/utils";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

type ParallaxConfig = {
  scale?: [number, number];
  y?: [number, number];
};

type StickySceneProps = {
  id?: string;
  scrollHeight?: SceneScrollSpec;
  image: string;
  imageAlt: string;
  imageClass?: string;
  imagePosition?: string;
  overlayClass?: string;
  gradientClass?: string;
  warmGlowClass?: string;
  extraOverlay?: ReactNode;
  contentClassName?: string;
  children: ReactNode;
  variant?: "hero" | "story";
  parallax?: ParallaxConfig;
  contentOpacity?: MotionValue<number> | null;
  priority?: boolean;
};

export function StickyScene({
  id,
  scrollHeight = { desktop: "125vh", mobile: "98vh" },
  image,
  imageAlt,
  imageClass,
  imagePosition = "center",
  overlayClass = "bg-[#0d0d0d]/88",
  gradientClass = "bg-gradient-to-b from-[#0d0d0d]/75 via-[#0d0d0d]/85 to-[#0d0d0d]",
  warmGlowClass,
  extraOverlay,
  contentClassName,
  children,
  variant = "story",
  parallax,
  priority = false,
  contentOpacity: externalOpacity,
}: StickySceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobileConversion();
  const height = resolveSceneScrollHeight(scrollHeight, isMobile);
  const motionOff = Boolean(reduceMotion);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset:
      variant === "hero"
        ? ["start start", "end start"]
        : ["start end", "end start"],
  });

  const defaultScale: [number, number] =
    variant === "hero" ? [1, 1.08] : [1, 1.04];
  const defaultY: [number, number] =
    variant === "hero" ? [0, -20] : isMobile ? [16, -16] : [40, -40];

  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    motionOff || isMobile
      ? [1, 1]
      : (parallax?.scale ?? defaultScale),
  );
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    motionOff ? [0, 0] : (parallax?.y ?? defaultY),
  );

  const internalOpacity = useTransform(
    scrollYProgress,
    variant === "hero" ? [0, 0.45, 1] : [0.15, 0.42, 0.75],
    variant === "hero" ? [0, 1, 1] : [0, 1, 0],
  );
  const contentOpacity = externalOpacity ?? internalOpacity;

  const heroOverlayOpacity = useTransform(
    scrollYProgress,
    [0, 0.55, 1],
    [0.72, 0.84, 0.92],
  );

  const topEdgeOpacity = useTransform(
    scrollYProgress,
    variant === "hero" ? [0, 0.2] : [0, 0.14],
    variant === "hero" ? [0, 0] : [0.9, 0],
  );
  const bottomEdgeOpacity = useTransform(
    scrollYProgress,
    variant === "hero" ? [0.78, 1] : [0.84, 1],
    [0, 0.95],
  );

  const imageBlurPx = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    motionOff || isMobile ? [0, 0, 0] : [0, 0, 5],
  );
  const imageFilter = useTransform(imageBlurPx, (b) =>
    b > 0 ? `blur(${b}px)` : "none",
  );

  const imageMotionStyle =
    motionOff
      ? undefined
      : {
          scale,
          y,
          filter: imageFilter,
        };

  return (
    <motion.div
      id={id}
      ref={ref}
      className="world-scene-rail relative w-full"
      style={{ height }}
    >
      <div className="sticky top-0 h-[100dvh] min-h-[100svh] w-full overflow-hidden bg-[#0d0d0d]">
        <motion.div
          className="absolute inset-0"
          style={imageMotionStyle}
        >
          <AscendImage
            src={image}
            alt={imageAlt}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            quality={priority ? 82 : 72}
            sizes="100vw"
            className={cn(
              imageClass ?? ASCEND_IMAGE_CLASS.heroStorefront,
              "object-cover",
            )}
            style={{ objectPosition: imagePosition }}
          />
        </motion.div>

        {variant === "hero" ? (
          <motion.div
            className="absolute inset-0 bg-[#0d0d0d]"
            style={motionOff ? { opacity: 0.82 } : { opacity: heroOverlayOpacity }}
          />
        ) : (
          <motion.div className={cn("absolute inset-0", overlayClass)} />
        )}

        <div className={cn("absolute inset-0", gradientClass)} />
        <motion.div className="world-scene-vignette absolute inset-0" aria-hidden />

        {warmGlowClass ? (
          <div
            className={cn(
              "absolute inset-0 opacity-[0.1] sm:opacity-[0.16]",
              warmGlowClass,
            )}
            aria-hidden
          />
        ) : null}
        {extraOverlay}

        <motion.div
          className="world-scene-edge-fade world-scene-edge-fade--top pointer-events-none absolute inset-x-0 top-0 z-[2] h-[20%]"
          style={motionOff ? { opacity: 0 } : { opacity: topEdgeOpacity }}
          aria-hidden
        />
        <motion.div
          className="world-scene-edge-fade world-scene-edge-fade--bottom pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[26%]"
          style={motionOff ? { opacity: 0 } : { opacity: bottomEdgeOpacity }}
          aria-hidden
        />

        <motion.div
          className={cn("relative z-10 h-full", contentClassName)}
          style={
            contentOpacity === null || motionOff
              ? undefined
              : { opacity: contentOpacity }
          }
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}
