"use client";

import {
  PHILOSOPHY_DURATION,
  PHILOSOPHY_EASE,
  PHILOSOPHY_VIEWPORT,
} from "@/lib/motion/philosophy-motion";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type PhilosophyRevealProps = {
  as?: typeof motion.div | typeof motion.span;
  className?: string;
  children?: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  scale?: number;
  onMount?: boolean;
  viewport?: typeof PHILOSOPHY_VIEWPORT;
};

export function PhilosophyReveal({
  as: Component = motion.div,
  className,
  children,
  delay = 0,
  duration = PHILOSOPHY_DURATION,
  y = 20,
  scale,
  onMount = false,
  viewport = PHILOSOPHY_VIEWPORT,
}: PhilosophyRevealProps) {
  const reduce = useReducedMotion();

  const variants: Variants = reduce
    ? {
        hidden: { opacity: 1, y: 0, scale: 1 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }
    : {
        hidden: {
          opacity: 0,
          y,
          ...(scale !== undefined ? { scale } : {}),
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: scale !== undefined ? 1 : undefined,
          transition: { duration, delay, ease: PHILOSOPHY_EASE },
        },
      };

  if (onMount) {
    return (
      <Component
        className={cn(className)}
        initial="hidden"
        animate="visible"
        variants={variants}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variants}
    >
      {children}
    </Component>
  );
}
