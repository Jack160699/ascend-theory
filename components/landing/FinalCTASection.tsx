"use client";

import { WorldButton } from "@/components/landing/world/WorldButton";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import { motion, useReducedMotion } from "framer-motion";

const BULLETS = [
  "Daily structured routines",
  "Weekly accountability calls",
  "Private curated community",
] as const;

export function FinalCTASection() {
  const { openAssessment } = useAssessmentModal();
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="apply"
      data-conversion-zone="final"
      className="world-section-pricing relative flex min-h-screen w-full flex-col items-center justify-center bg-[#0d0d0d] px-5"
      aria-labelledby="final-cta-heading"
    >
      <div
        className="world-dot-grid world-dot-grid--fine pointer-events-none absolute inset-0 opacity-[0.015]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 45%, rgba(255, 220, 180, 0.12) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <motion.div
        className="relative z-10 mx-auto max-w-lg text-center"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
        viewport={{ once: true, margin: "-10%" }}
      >
        <p className="world-brand-mark mb-8 sm:mb-12">ASCEND THEORY</p>
        <p className="mb-8 text-xs font-light uppercase tracking-[0.12em] text-white/55 sm:mb-10">
          A Structured Environment for Men
        </p>

        <h2 id="final-cta-heading" className="world-display world-display--cta mb-6 sm:mb-7">
          Ready to
          <br />
          rebuild yourself?
        </h2>

        <p className="world-body mx-auto mb-8 max-w-md sm:mb-10">
          We help ambitious men build discipline,
          <br />
          accountability, and confidence through
          <br />
          structured systems and brotherhood.
        </p>

        <ul className="mx-auto mb-10 max-w-sm space-y-2.5 text-left sm:mb-12">
          {BULLETS.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span
                className="mt-1.5 size-1 shrink-0 rounded-full bg-white/40"
                aria-hidden
              />
              <span className="world-body--muted">{item}</span>
            </li>
          ))}
        </ul>

        <WorldButton variant="solid-cta" onClick={() => openAssessment()}>
          APPLY NOW
        </WorldButton>

        <p className="mt-4 text-[10px] font-light tracking-[0.08em] text-white/35 sm:mt-5">
          Limited spaces · Application required
        </p>
      </motion.div>

      <p
        className="absolute bottom-8 text-[7px] font-light tracking-[0.35em] text-white/12 sm:bottom-10"
        suppressHydrationWarning
      >
        © {new Date().getFullYear()}
      </p>
    </section>
  );
}
