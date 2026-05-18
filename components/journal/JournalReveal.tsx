"use client";

import {
  JOURNAL_DURATION,
  JOURNAL_EASE,
  JOURNAL_RISE,
  JOURNAL_VIEWPORT,
} from "@/lib/motion/journal-motion";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type JournalRevealProps = {
  className?: string;
  children?: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  onMount?: boolean;
};

export function JournalReveal({
  className,
  children,
  delay = 0,
  duration = JOURNAL_DURATION,
  y = JOURNAL_RISE,
  onMount = false,
}: JournalRevealProps) {
  const reduce = useReducedMotion();

  const variants: Variants = reduce
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration, delay, ease: JOURNAL_EASE },
        },
      };

  if (onMount) {
    return (
      <motion.div
        className={cn(className)}
        initial="hidden"
        animate="visible"
        variants={variants}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={JOURNAL_VIEWPORT}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
