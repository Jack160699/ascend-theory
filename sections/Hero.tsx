"use client";

import { BackgroundEffects } from "@/components/BackgroundEffects";
import { HeroEnvironment } from "@/components/hero";
import { Navbar } from "@/components/Navbar";
import { useIsMobileConversion } from "@/contexts/mobile-conversion";
import {
  DURATION_OPACITY,
  DURATION_REVEAL,
  EASE_CINEMATIC,
  RISE_Y,
  TAP_SPRING,
  getFadeUpReveal,
  getHeroLine1,
  getHeroLine2,
  getHeroStaggerCinematic,
} from "@/lib/motion";
import { shellHero } from "@/lib/editorial-layout";
import {
  ASCEND_WHATSAPP_ME_URL,
  PRIMARY_CTA_LABEL,
} from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useMemo, useRef } from "react";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobileConversion();
  const heroStagger = useMemo(
    () => getHeroStaggerCinematic(isMobile),
    [isMobile],
  );
  const heroLine1v = useMemo(() => getHeroLine1(isMobile), [isMobile]);
  const heroLine2v = useMemo(() => getHeroLine2(isMobile), [isMobile]);
  const fadeUpHero = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);

  return (
    <section
      ref={heroRef}
      data-conversion-zone="hero"
      className={cn(
        "ascend-section-world ascend-hero-perspective relative flex min-h-[100dvh] w-full flex-col overflow-hidden",
        "bg-[#050505]",
      )}
      aria-label="Ascend Theory introduction"
    >
      <Navbar />
      <BackgroundEffects className="z-0" />
      <HeroEnvironment sectionRef={heroRef} />

      <div className={cn(shellHero, "relative z-10 items-start")}>
        <motion.p
          className="ascend-type-eyebrow mb-6 text-zinc-500/92 sm:mb-10"
          initial={{ opacity: 0, y: RISE_Y * 0.45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: DURATION_REVEAL * (isMobile ? 0.78 : 1),
            ease: EASE_CINEMATIC,
          }}
        >
          Ascend Theory
        </motion.p>

        <motion.div
          className="flex w-full max-w-[min(44rem,100%)] flex-col lg:max-w-[46rem]"
          variants={heroStagger}
          initial="hidden"
          animate="visible"
        >
          <h1 className="ascend-type-hero m-0 text-white">
            <motion.span
              variants={heroLine1v}
              initial="hidden"
              animate="visible"
              className="block"
            >
              Your current identity
            </motion.span>
            <motion.span
              variants={heroLine2v}
              initial="hidden"
              animate="visible"
              className="mt-[0.12em] block text-white/[0.94]"
            >
              is not your limit.
            </motion.span>
          </h1>

          <motion.p
            variants={fadeUpHero}
            className="ascend-prose-calm mt-8 max-w-[min(34rem,100%)] text-pretty text-zinc-400/92 sm:mt-12"
          >
            Private mentorship for serious professionals — training, presence,
            discipline, and accountability in one system. You apply; we review.
            No open enrollment.
          </motion.p>

          <motion.div
            variants={fadeUpHero}
            className="mt-11 flex w-full max-w-[min(36rem,100%)] flex-col gap-3.5 sm:mt-[3.25rem] sm:flex-row sm:items-center sm:gap-6"
          >
            <motion.a
              href={ASCEND_WHATSAPP_ME_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={PRIMARY_CTA_LABEL}
              className={cn(
                "ascend-button-primary group relative inline-flex min-h-12 w-full max-w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 sm:w-auto sm:px-8",
                "bg-white text-center text-zinc-950 text-xs font-medium leading-snug tracking-tight sm:text-sm",
                "transition-[transform] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
              )}
              whileHover={{ scale: 1.012 }}
              whileTap={{ scale: 0.988 }}
              transition={TAP_SPRING}
            >
              <span className="relative z-10 max-w-[16rem] sm:max-w-none">
                {PRIMARY_CTA_LABEL}
              </span>
              <ArrowRight className="relative z-10 size-4 shrink-0 transition-transform duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:translate-x-0.5" />
            </motion.a>

            <motion.a
              href="#pricing"
              className={cn(
                "ascend-button-ghost inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-8 text-sm font-medium tracking-tight text-white sm:w-auto",
                "border border-white/[0.12] bg-white/[0.04] backdrop-blur-xl",
                "transition-[transform,background-color,border-color] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
                "hover:border-white/[0.18] hover:bg-white/[0.07]",
              )}
              whileHover={{ scale: 1.012 }}
              whileTap={{ scale: 0.988 }}
              transition={TAP_SPRING}
            >
              View pricing
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#about"
        className="absolute bottom-[max(5.75rem,env(safe-area-inset-bottom)+4.75rem)] left-1/2 z-[15] flex -translate-x-1/2 flex-col items-center gap-2 text-zinc-500 sm:bottom-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: isMobile ? 0.68 : 1.2,
          duration: DURATION_OPACITY * (isMobile ? 0.88 : 1),
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
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[12] h-36 bg-gradient-to-t from-black/90 via-black/32 to-transparent sm:h-40"
        aria-hidden
      />
    </section>
  );
}
