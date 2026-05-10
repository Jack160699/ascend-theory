"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import {
  DURATION_REVEAL,
  RISE_Y,
  VIEWPORT_CALM,
  txReveal,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

const viewport = VIEWPORT_CALM;

export function AssessmentEntry() {
  return (
    <section
      id="assessment"
      data-conversion-zone="assessment"
      className="relative scroll-mt-28 overflow-hidden border-t border-white/[0.028] bg-[#030303] py-24 sm:py-28 lg:py-32"
      aria-labelledby="assessment-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#040404] to-black" />
        <div className="absolute left-1/2 top-1/2 h-[min(28rem,70vh)] w-[min(90%,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.65)_75%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center sm:px-10 lg:px-12">
        <motion.p
          className="mb-6 text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-500"
          initial={{ opacity: 0, y: RISE_Y * 0.65 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL)}
        >
          Private assessment
        </motion.p>
        <motion.h2
          id="assessment-heading"
          className="text-balance font-sans text-[clamp(1.9rem,8.6vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-white sm:text-4xl sm:leading-[1.08]"
          initial={{ opacity: 0, y: RISE_Y }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL, 0.08)}
        >
          Calibrate your entry with context — not impulse.
        </motion.h2>
        <motion.p
          className="mx-auto mt-8 max-w-xl text-pretty text-[15px] leading-[1.75] text-zinc-500 sm:text-base"
          initial={{ opacity: 0, y: RISE_Y * 0.9 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL, 0.14)}
        >
          The assessment maps tone, stakes, and structure to mentorship depth. It
          is intentionally slow — alignment first, never pressure.
        </motion.p>
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: RISE_Y * 0.9 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL, 0.2)}
        >
          <Link
            href="#pricing"
            className={cn(
              "ascend-button-primary inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-medium tracking-tight text-zinc-950",
              "transition-transform duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            )}
          >
            Continue to entry and assessment
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
