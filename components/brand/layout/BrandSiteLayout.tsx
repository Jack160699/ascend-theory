"use client";

import { BrandNav } from "@/components/brand/BrandNav";
import { BrandOrchestrator } from "@/components/brand/BrandOrchestrator";
import { CinematicScrollProvider } from "@/contexts/cinematic-scroll";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BrandSiteLayoutProps = {
  children: ReactNode;
  /** Enable GSAP scroll motion on this page */
  orchestrate?: boolean;
  className?: string;
  canvasClassName?: string;
};

export function BrandSiteLayout({
  children,
  orchestrate = false,
  className,
  canvasClassName,
}: BrandSiteLayoutProps) {
  return (
    <CinematicScrollProvider>
      {orchestrate ? <BrandOrchestrator /> : null}
      <BrandNav />
      <div
        id="ascend-brand-canvas"
        className={cn(
          "brand-canvas min-h-screen bg-[#0a0a0a] text-white antialiased",
          orchestrate && "brand-motion-pending",
          canvasClassName,
        )}
      >
        <main className={cn("overflow-x-clip", className)}>{children}</main>
      </div>
    </CinematicScrollProvider>
  );
}
