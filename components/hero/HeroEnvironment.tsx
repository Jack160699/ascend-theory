"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useState, type RefObject } from "react";

type HeroEnvironmentProps = {
  sectionRef: RefObject<HTMLElement | null>;
  className?: string;
  /** Softer atmosphere when a photographic hero is primary. */
  variant?: "default" | "cinematic";
};

/**
 * Phase 4 — dimensional hero atmosphere: architectural field, directional
 * sheen, depth planes with scroll-linked parallax (GPU transforms, low amp).
 */
export function HeroEnvironment({
  sectionRef,
  className,
  variant = "default",
}: HeroEnvironmentProps) {
  const reduceMotion = useReducedMotion();
  const [liteMotion, setLiteMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setLiteMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /** Tighter scroll-linked travel on mobile — same parallax read, less layer drift. */
  const amp = reduceMotion ? 0 : liteMotion ? 0.14 : 1;

  const yFar = useTransform(scrollYProgress, [0, 1], [0, 30 * amp]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, 16 * amp]);
  const yNear = useTransform(scrollYProgress, [0, 1], [0, -11 * amp]);

  const cinematic = variant === "cinematic";

  return (
    <div
      className={cn(
        "ascend-hero-env-base",
        cinematic && "opacity-[0.14] mix-blend-soft-light",
        className,
      )}
      aria-hidden
    >
      <div className={cn("ascend-hero-architect-field", cinematic && "opacity-40")} />
      <div className={cn("ascend-hero-directional-sheen", cinematic && "opacity-30")} />

      <motion.div
        style={{ y: yFar }}
        className={cn(
          "absolute -left-[12%] top-[18%] sm:-left-[8%] sm:top-[22%]",
          cinematic && "hidden",
        )}
      >
        <motion.div
          className={cn(
            "h-40 w-[min(19rem,64vw)] will-change-transform sm:h-56 sm:w-80",
            "rounded-[1.5rem] border border-white/[0.07] bg-white/[0.022] shadow-[0_0_80px_-30px_rgba(255,255,255,0.05)]",
            liteMotion ? "backdrop-blur-sm" : "backdrop-blur-md",
            "-rotate-6",
          )}
          animate={
            reduceMotion
              ? undefined
              : liteMotion
                ? { rotate: [-6.15, -5.85, -6.15], opacity: [0.9, 0.97, 0.9] }
                : { rotate: [-6.5, -5.5, -6.5], opacity: [0.88, 1, 0.88] }
          }
          transition={{
            duration: liteMotion ? 36 : 26,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
      <motion.div
        style={{ y: yMid }}
        className={cn(
          "absolute -right-[10%] top-[14%] sm:-right-[6%] sm:top-[18%]",
          cinematic && "hidden",
        )}
      >
        <motion.div
          className={cn(
            "h-32 w-[min(14rem,44vw)] will-change-transform sm:h-48 sm:w-72",
            "rounded-3xl border border-white/[0.06] bg-zinc-500/[0.035] shadow-[0_0_70px_-28px_rgba(255,255,255,0.04)]",
            liteMotion ? "backdrop-blur-sm" : "backdrop-blur-lg",
            "rotate-[8deg]",
          )}
          animate={
            reduceMotion
              ? undefined
              : liteMotion
                ? { rotate: [7.65, 8.35, 7.65], opacity: [0.92, 0.99, 0.92] }
                : { rotate: [7.2, 8.8, 7.2], opacity: [0.9, 1, 0.9] }
          }
          transition={{
            duration: liteMotion ? 38 : 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
      <motion.div
        style={{ y: yNear }}
        className={cn(
          "absolute bottom-[18%] left-[12%]",
          cinematic ? "hidden" : "hidden sm:block",
        )}
      >
        <motion.div
          className={cn(
            "h-36 w-64 will-change-transform",
            "rounded-2xl border border-white/[0.055] bg-white/[0.018] backdrop-blur-md",
            "-rotate-[10deg]",
          )}
          animate={
            reduceMotion
              ? undefined
              : { rotate: [-10.5, -9.2, -10.5], opacity: [0.85, 0.98, 0.85] }
          }
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.6,
          }}
        />
      </motion.div>

      <div className={cn("ascend-hero-floor-read", cinematic && "opacity-25")} />
    </div>
  );
}
