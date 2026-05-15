"use client";

import { EASE_CINEMATIC } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const viewport = { once: true, margin: "-80px" } as const;

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.7, delay, ease: EASE_CINEMATIC }}
    >
      {children}
    </motion.div>
  );
}
