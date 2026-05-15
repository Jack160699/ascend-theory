"use client";

import { Navbar } from "@/components/Navbar";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import { ASCEND_IMAGES } from "@/lib/cinematic-assets";
import { ASCEND_IMAGE_CLASS } from "@/lib/cinematic-composition";
import { shellHero } from "@/lib/editorial-layout";
import { EASE_CINEMATIC } from "@/lib/motion";
import { HERO_CTA_LABEL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  const { openAssessment } = useAssessmentModal();

  return (
    <section
      id="hero"
      data-conversion-zone="hero"
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-ascend-canvas"
      aria-label="Ascend Theory"
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, ease: EASE_CINEMATIC }}
      >
        <Image
          src={ASCEND_IMAGES.heroStorefront}
          alt="Ascend Theory — man walking past the Ascend Theory storefront at golden hour"
          fill
          priority
          className={ASCEND_IMAGE_CLASS.heroStorefront}
          sizes="100vw"
        />
        <motion.div
          className="absolute inset-0 bg-black/48 sm:bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE_CINEMATIC }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ascend-canvas via-black/25 to-black/35" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: EASE_CINEMATIC }}
        />
      </motion.div>

      <Navbar />

      <div className={cn(shellHero, "relative z-10")}>
        <motion.p
          className="ascend-type-eyebrow mb-6 text-zinc-400 sm:mb-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE_CINEMATIC }}
        >
          Ascend Theory
        </motion.p>

        <motion.h1
          className="ascend-type-hero ascend-headline m-0 max-w-[14ch] text-pretty text-white"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: EASE_CINEMATIC }}
        >
          You are not lazy.
        </motion.h1>

        <motion.p
          className="ascend-prose-calm mt-6 max-w-[min(32rem,100%)] text-pretty text-zinc-300/95 sm:mt-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28, ease: EASE_CINEMATIC }}
        >
          Most men drift slowly away from their potential.
        </motion.p>

        <motion.div
          className="mt-10 sm:mt-12"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.42, ease: EASE_CINEMATIC }}
        >
          <button
            type="button"
            onClick={() => openAssessment()}
            className={cn(
              "ascend-button-primary group inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-md bg-white px-7 text-sm font-medium text-zinc-950",
              "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_16px_40px_-12px_rgba(0,0,0,0.45)]",
              "transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:opacity-95 active:scale-[0.997] sm:w-auto",
            )}
          >
            {HERO_CTA_LABEL}
            <ArrowRight className="size-4 transition-transform duration-[var(--ascend-hover-duration)] group-hover:translate-x-0.5" />
          </button>
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[5] h-24 bg-gradient-to-t from-ascend-canvas to-transparent sm:h-32"
        aria-hidden
      />
    </section>
  );
}
