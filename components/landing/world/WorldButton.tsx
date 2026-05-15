"use client";

import { cn } from "@/lib/utils";

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
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        variant === "solid" && "world-btn-solid",
        variant === "solid-cta" && "world-btn-solid world-btn-solid--cta",
        variant === "outline" && "world-btn-outline",
        className,
      )}
    >
      {children}
    </button>
  );
}
