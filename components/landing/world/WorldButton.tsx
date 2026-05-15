"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

type WorldButtonProps = {
  children: React.ReactNode;
  variant?: "outline" | "solid" | "solid-cta";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

export function WorldButton({
  children,
  variant = "outline",
  className,
  onClick,
  type = "button",
}: WorldButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={cn(
        variant === "solid" && "world-btn-solid",
        variant === "solid-cta" && "world-btn-solid world-btn-solid--cta",
        variant === "outline" && "world-btn-outline",
        className,
      )}
      whileHover={reduceMotion ? undefined : { scale: variant === "outline" ? 1.01 : 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.button>
  );
}
