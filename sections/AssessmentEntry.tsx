"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import { DURATION_REVEAL, RISE_Y, txReveal } from "@/lib/motion";
import { shellReading } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";

export function AssessmentEntry() {
  const viewport = useRevealViewport();
  const isMobile = useIsMobileConversion();
  const yK = useMemo(() => (isMobile ? 0.62 : 1), [isMobile]);
  const durK = useMemo(() => (isMobile ? 0.88 : 1), [isMobile]);
  return (
    <section
      id="assessment"
      data-conversion-zone="assessment"
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-white/[0.028] bg-[#030303] py-12 sm:py-20 lg:py-36"
      aria-labelledby="assessment-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#040404] to-black" />
        <div className="absolute left-1/2 top-1/2 h-[min(28rem,70vh)] w-[min(90%,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.65)_75%)]" />
      </div>

      <div className={cn(shellReading, "text-left")}>
        <motion.p
          className="ascend-type-eyebrow mb-7 text-zinc-500 lg:mb-8"
          initial={{ opacity: 0, y: RISE_Y * 0.65 * yK }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL * durK)}
        >
          Manual intake
        </motion.p>
        <motion.h2
          id="assessment-heading"
          className="ascend-type-section-sm text-white"
          initial={{ opacity: 0, y: RISE_Y * yK }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL * durK, 0.08 * durK)}
        >
          Tell us the truth — then we match depth.
        </motion.h2>
        <motion.p
          className="ascend-prose-calm mt-9 max-w-[34rem] text-pretty text-zinc-500 sm:mt-10"
          initial={{ opacity: 0, y: RISE_Y * 0.9 * yK }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL * durK, 0.14 * durK)}
        >
          The intake maps stakes and pace to the right tier. Slow on purpose —
          fit first, never pressure.
        </motion.p>
        <p className="mt-5 max-w-[34rem] text-[12px] font-medium uppercase leading-relaxed tracking-[0.18em] text-zinc-600 sm:mt-6 sm:text-[11px] sm:tracking-[0.2em]">
          Mentor bandwidth is capped — applications are read in order.
        </p>
        <motion.div
          className="mt-9 sm:mt-12"
          initial={{ opacity: 0, y: RISE_Y * 0.9 * yK }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL * durK, 0.2 * durK)}
        >
          <Link
            href="#pricing"
            className={cn(
              "ascend-button-primary inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-medium tracking-tight text-zinc-950",
              "transition-transform duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
            )}
          >
            View pricing
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
