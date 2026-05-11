"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

/**
 * Hero-only atmosphere: tonal depth, minimal motion (desktop only).
 * Mobile is static for scroll performance and less visual noise.
 */
export function BackgroundEffects({ className }: { className?: string }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-ascend-canvas" />
      <div className="absolute inset-0 bg-gradient-to-b from-ascend-surface/90 via-ascend-canvas to-ascend-surface" />

      {/* Soft orbs — static on mobile; one slow drift on desktop */}
      <div
        className={cn(
          "absolute -left-[20%] top-[12%] transform-gpu rounded-full bg-[color:rgba(95,115,134,0.07)]",
          isMobile ? "h-[18rem] w-[18rem] blur-[48px]" : "h-[34rem] w-[34rem] blur-[88px]",
        )}
      />
      <div
        className={cn(
          "absolute -right-[18%] bottom-[5%] transform-gpu rounded-full bg-white/[0.028]",
          isMobile ? "h-[16rem] w-[16rem] blur-[44px]" : "h-[28rem] w-[28rem] blur-[96px]",
        )}
      />
      <div
        className={cn(
          "absolute left-[28%] top-[42%] transform-gpu rounded-full bg-zinc-400/[0.04]",
          isMobile ? "h-[10rem] w-[10rem] blur-[40px]" : "h-[16rem] w-[16rem] blur-[72px]",
        )}
      />

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_52%_at_50%_-12%,rgba(255,255,255,0.055),transparent_58%)] opacity-[0.88]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,5,0.5)_72%)]" />

      {/* Subtle top sheen — static */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background:
            "linear-gradient(125deg, transparent 42%, rgba(255,255,255,0.03) 50%, transparent 58%)",
        }}
      />
    </div>
  );
}
