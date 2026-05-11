"use client";

import { BackgroundEffects } from "@/components/BackgroundEffects";
import { HeroEnvironment } from "@/components/hero";
import { Navbar } from "@/components/Navbar";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import { useIsMobileConversion } from "@/contexts/mobile-conversion";
import { CINEMATIC_ASSETS } from "@/lib/cinematic-assets";
import { CINEMATIC_IMAGE_CLASS } from "@/lib/cinematic-composition";
import {
  CTA_HOVER_SCALE,
  CTA_TAP_SCALE,
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
import { cinematicSceneRootProps } from "@/lib/cinematic-v2/cinematic-layout";
import { shellHero } from "@/lib/editorial-layout";
import { HERO_CTA_LABEL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useMemo, useRef } from "react";

export function Hero() {
  const { openAssessment } = useAssessmentModal();
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
      {...cinematicSceneRootProps("hero")}
      data-conversion-zone="hero"
      className={cn(
        "ascend-section-world ascend-hero-perspective relative flex min-h-[100dvh] w-full flex-col overflow-hidden",
        "bg-ascend-canvas",
      )}
      aria-label="Ascend Theory introduction"
    >
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
        data-cinematic-parallax="6"
      >
        <Image
          src={CINEMATIC_ASSETS.heroRooftopSunrise}
          alt="Rooftop at sunrise — quiet reflection, architectural space, city horizon"
          fill
          priority
          className={CINEMATIC_IMAGE_CLASS.heroRooftopSunrise}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/44 sm:bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/40 to-black/18 sm:from-black/65 sm:via-black/28 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ascend-canvas via-transparent to-black/25 sm:to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_35%,transparent_0%,rgba(5,5,6,0.55)_68%)] opacity-90 sm:opacity-100" />
      </div>

      <Navbar />
      <BackgroundEffects className="z-[2] opacity-[0.35] sm:opacity-45" />
      <HeroEnvironment sectionRef={heroRef} variant="cinematic" className="z-[2]" />

      <div className={cn(shellHero, "relative z-10 items-start")}>
        <motion.p
          className="ascend-type-eyebrow mb-6 text-zinc-400/95 sm:mb-10"
          initial={{ opacity: 0, y: RISE_Y * 0.45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: DURATION_REVEAL * (isMobile ? 0.92 : 1),
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
          <h1 className="ascend-type-hero m-0 text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
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
              className="mt-[0.12em] block text-white/[0.96]"
            >
              is not your limit.
            </motion.span>
          </h1>

          <motion.p
            variants={fadeUpHero}
            className="ascend-prose-calm mt-7 max-w-[min(34rem,100%)] text-pretty text-zinc-300/95 sm:mt-10 sm:text-zinc-400/95"
          >
            Private mentorship for serious professionals — identity, how you
            communicate, and the structure you run your life on. Conditioning
            sits inside that standard. You apply. We read every message.
          </motion.p>

          <motion.div
            variants={fadeUpHero}
            className="mt-11 w-full max-w-[min(36rem,100%)] sm:mt-[3.25rem]"
          >
            <motion.button
              type="button"
              onClick={() => openAssessment()}
              aria-label={HERO_CTA_LABEL}
              className={cn(
                "ascend-button-primary group relative inline-flex min-h-12 w-full max-w-full items-center justify-center gap-2 overflow-hidden rounded-md px-6 py-3 sm:w-auto sm:px-8",
                "bg-white text-center text-zinc-950 text-xs font-medium leading-snug tracking-tight sm:text-sm",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_48px_-12px_rgba(0,0,0,0.5)]",
                "transition-[transform] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
              )}
              whileHover={{ scale: CTA_HOVER_SCALE }}
              whileTap={{ scale: CTA_TAP_SCALE }}
              transition={TAP_SPRING}
            >
              <span className="relative z-10 max-w-[16rem] sm:max-w-none">
                {HERO_CTA_LABEL}
              </span>
              <ArrowRight className="relative z-10 size-4 shrink-0 transition-transform duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:translate-x-0.5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#philosophy"
        className="absolute bottom-5 left-1/2 z-[15] flex -translate-x-1/2 flex-col items-center gap-2 text-zinc-400 sm:bottom-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: isMobile ? 0.85 : 1.45,
          duration: DURATION_OPACITY * (isMobile ? 0.95 : 1),
          ease: EASE_CINEMATIC,
        }}
        aria-label="Scroll to content"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.28em]">
          Explore
        </span>
        {isMobile ? (
          <span>
            <ChevronDown className="size-5 opacity-60" strokeWidth={1.25} />
          </span>
        ) : (
          <motion.span
            animate={{ y: [0, 3, 0] }}
            transition={{
              duration: 4.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ChevronDown className="size-5 opacity-65" strokeWidth={1.25} />
          </motion.span>
        )}
      </motion.a>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[12] h-28 bg-gradient-to-t from-ascend-canvas via-ascend-canvas/70 to-transparent sm:h-36"
        aria-hidden
      />
    </section>
  );
}
