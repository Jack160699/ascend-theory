"use client";

import { BackgroundEffects } from "@/components/BackgroundEffects";
import { Navbar } from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Play } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.28,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function Hero() {
  return (
    <section
      data-conversion-zone="hero"
      className={cn(
        "relative flex min-h-[100dvh] w-full flex-col overflow-hidden",
        "bg-[#050505]",
      )}
      aria-label="Ascend Theory introduction"
    >
      <Navbar />
      <BackgroundEffects className="z-0" />

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
      >
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

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-32 pt-[7.4rem] sm:px-10 sm:pb-32 sm:pt-[7.25rem] lg:px-12 lg:pb-36 lg:pt-32">
        <motion.p
          className="mb-8 text-[11px] font-medium uppercase tracking-[0.34em] text-zinc-500 sm:mb-8 sm:text-xs sm:tracking-[0.38em]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] as const }}
        >
          Ascend Theory
        </motion.p>

        <motion.div
          className="flex max-w-4xl flex-col"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={fadeUp}
            className="text-balance font-sans text-[clamp(2.2rem,11vw,2.95rem)] font-semibold leading-[1.05] tracking-[-0.036em] text-white sm:text-5xl sm:leading-[1.05] lg:text-[3.55rem] lg:leading-[1.04]"
          >
            Your current identity is not your ceiling.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-2xl text-pretty text-[15px] leading-[1.72] text-zinc-400 sm:mt-10 sm:text-base sm:leading-relaxed"
          >
            Private mentorship architecture for ambitious professionals —
            identity-grade accountability across physique, communication,
            discipline, and execution.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-col gap-3.5 sm:mt-16 sm:flex-row sm:items-center sm:gap-5"
          >
            <motion.a
              href="#pricing"
              aria-label="Begin your transformation"
              className={cn(
                "group relative inline-flex min-h-12 w-full max-w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 sm:w-auto sm:px-8",
                "bg-white text-center text-zinc-950 text-xs font-medium leading-snug tracking-tight sm:text-sm",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_24px_80px_-24px_rgba(255,255,255,0.25)]",
                "transition-[transform,box-shadow] duration-500 ease-out",
                "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_28px_90px_-20px_rgba(255,255,255,0.35)]",
              )}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <span className="relative z-10 max-w-[16rem] sm:max-w-none">
                Begin Your Transformation
              </span>
              <ArrowRight className="relative z-10 size-4 shrink-0 transition-transform duration-500 ease-out group-hover:translate-x-0.5" />
            </motion.a>

            <motion.a
              href="#journey"
              className={cn(
                "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-8 text-sm font-medium tracking-tight text-white sm:w-auto",
                "border border-white/[0.12] bg-white/[0.04] backdrop-blur-xl",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.04)]",
                "transition-[transform,background-color,border-color] duration-500 ease-out",
                "hover:border-white/[0.18] hover:bg-white/[0.07]",
              )}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Play className="size-4 fill-white/90 text-white/90" />
              Watch Journey
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#about"
        className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-zinc-500 sm:bottom-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
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
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] h-28 bg-gradient-to-t from-black via-black/50 to-transparent"
        aria-hidden
      />
    </section>
  );
}
