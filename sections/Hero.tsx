"use client";

import { BackgroundEffects } from "@/components/BackgroundEffects";
import { Navbar } from "@/components/Navbar";
import {
  DURATION_OPACITY,
  DURATION_REVEAL,
  EASE_CINEMATIC,
  RISE_Y,
  TAP_SPRING,
  fadeUp,
  heroStaggerContainer,
} from "@/lib/motion";
import { shellHero } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Play } from "lucide-react";

export function Hero() {
  return (
    <section
      data-conversion-zone="hero"
      className={cn(
        "ascend-section-world relative flex min-h-[100dvh] w-full flex-col overflow-hidden",
        "bg-[#050505]",
      )}
      aria-label="Ascend Theory introduction"
    >
      <Navbar />
      <BackgroundEffects className="z-0" />

      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
        <motion.div
          className={cn(
            "absolute -left-[12%] top-[18%] h-40 w-[min(19rem,64vw)] rounded-[1.5rem] sm:-left-[8%] sm:top-[22%] sm:h-56 sm:w-80",
            "border border-white/[0.08] bg-white/[0.025] shadow-[0_0_80px_-30px_rgba(255,255,255,0.06)] backdrop-blur-md",
            "-rotate-6",
          )}
          animate={{ y: [0, 14, 0] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className={cn(
            "absolute -right-[10%] top-[14%] h-32 w-[min(14rem,44vw)] rounded-3xl sm:-right-[6%] sm:top-[18%] sm:h-48 sm:w-72",
            "border border-white/[0.07] bg-zinc-500/[0.04] shadow-[0_0_70px_-28px_rgba(255,255,255,0.05)] backdrop-blur-lg",
            "rotate-[8deg]",
          )}
          animate={{ y: [0, -12, 0] }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className={cn(
            "absolute bottom-[18%] left-[12%] hidden h-36 w-64 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md sm:block",
            "-rotate-[10deg]",
          )}
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className={cn(shellHero, "items-start")}>
        <motion.p
          className="ascend-type-eyebrow mb-9 text-zinc-500 sm:mb-10"
          initial={{ opacity: 0, y: RISE_Y * 0.45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION_REVEAL, ease: EASE_CINEMATIC }}
        >
          Ascend Theory
        </motion.p>

        <motion.div
          className="flex w-full max-w-[min(44rem,100%)] flex-col lg:max-w-[46rem]"
          variants={heroStaggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={fadeUp} className="ascend-type-hero text-white">
            Your current identity is not your ceiling.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="ascend-prose-calm mt-9 max-w-[34rem] text-pretty text-zinc-400 sm:mt-11"
          >
            Private mentorship architecture for ambitious professionals —
            identity-grade accountability across physique, communication,
            discipline, and execution. Entry is structured and reviewed — not
            open-ended enrollment.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-14 flex w-full max-w-[min(36rem,100%)] flex-col gap-4 sm:mt-[3.25rem] sm:flex-row sm:items-center sm:gap-6"
          >
            <motion.a
              href="#pricing"
              aria-label="Request structured transformation entry"
              className={cn(
                "ascend-button-primary group relative inline-flex min-h-12 w-full max-w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 sm:w-auto sm:px-8",
                "bg-white text-center text-zinc-950 text-xs font-medium leading-snug tracking-tight sm:text-sm",
                "transition-[transform] duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={TAP_SPRING}
            >
              <span className="relative z-10 max-w-[16rem] sm:max-w-none">
                Request Structured Entry
              </span>
              <ArrowRight className="relative z-10 size-4 shrink-0 transition-transform duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5" />
            </motion.a>

            <motion.a
              href="#journey"
              className={cn(
                "ascend-button-ghost inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-8 text-sm font-medium tracking-tight text-white sm:w-auto",
                "border border-white/[0.12] bg-white/[0.04] backdrop-blur-xl",
                "transition-[transform,background-color,border-color] duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                "hover:border-white/[0.18] hover:bg-white/[0.07]",
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={TAP_SPRING}
            >
              <Play className="size-4 fill-white/90 text-white/90" />
              Study The Ascent Sequence
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#about"
        className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-zinc-500 sm:bottom-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 1.2,
          duration: DURATION_OPACITY,
          ease: EASE_CINEMATIC,
        }}
        aria-label="Scroll to content"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.28em]">
          Explore
        </span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ChevronDown className="size-5 opacity-70" strokeWidth={1.25} />
        </motion.span>
      </motion.a>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] h-32 bg-gradient-to-t from-black/85 via-black/28 to-transparent sm:h-36"
        aria-hidden
      />
    </section>
  );
}
