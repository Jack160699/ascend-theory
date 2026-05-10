"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import {
  DURATION_OPACITY,
  DURATION_REVEAL,
  TAP_SPRING,
  VIEWPORT_CALM,
  fadeUp,
  headerStaggerParent,
  txReveal,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const viewport = VIEWPORT_CALM;

const ROTATING_LINES = [
  "Structure compounds quietly.",
  "Identity follows repeated standards.",
  "Discipline eventually becomes self-respect.",
  "The future version of you is built through repetition.",
] as const;

const FLOAT_FRAGMENTS: readonly {
  text: string;
  top: string;
  left?: string;
  right?: string;
  delay: number;
}[] = [
  { text: "Non-negotiable execution", top: "14%", left: "8%", delay: 0 },
  { text: "Repeated standards", top: "62%", right: "10%", delay: 1.2 },
  { text: "Quiet compounding", top: "38%", left: "6%", delay: 2.4 },
  { text: "Identity-grade cadence", top: "72%", left: "12%", delay: 0.8 },
];

function scrollToPaths() {
  document
    .getElementById("pricing")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function FinalDecisionCTA() {
  const { openAssessment } = useAssessmentModal();
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLineIndex((i) => (i + 1) % ROTATING_LINES.length);
    }, 6200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      id="final-decision-cta"
      data-conversion-zone="final"
      className="relative scroll-mt-28 overflow-hidden border-t border-white/[0.028] bg-[#030303] py-24 sm:py-32 lg:py-40"
      aria-labelledby="final-decision-cta-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-black" />
        <motion.div
          className="absolute left-1/2 top-[8%] h-[min(70vh,36rem)] w-[min(100%,52rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07),transparent_68%)] blur-3xl"
          animate={{ opacity: [0.35, 0.55, 0.38], scale: [1, 1.02, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-[18%] top-[40%] h-[28rem] w-[28rem] rounded-full bg-zinc-500/[0.04] blur-[120px]"
          animate={{ x: [0, -12, 0], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -left-[16%] bottom-[12%] h-[26rem] w-[26rem] rounded-full bg-white/[0.025] blur-[100px]"
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.62)_75%)]" />
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            mixBlendMode: "overlay",
          }}
        />
      </div>

      {/* Transformation spine */}
      <div
        className="pointer-events-none absolute inset-y-[10%] left-1/2 z-[1] w-px -translate-x-1/2"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.14] to-transparent opacity-80 blur-[1px]" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.22] to-transparent"
          animate={{ opacity: [0.4, 0.85, 0.45] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {FLOAT_FRAGMENTS.map((f) => (
        <motion.p
          key={f.text}
          className="pointer-events-none absolute z-[1] hidden max-w-[11rem] font-serif text-[11px] font-light italic leading-snug text-zinc-700 sm:block lg:text-xs"
          style={{
            top: f.top,
            ...(f.left !== undefined ? { left: f.left } : {}),
            ...(f.right !== undefined ? { right: f.right } : {}),
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.15, 0.32, 0.18],
            y: [0, -6, 0],
          }}
          transition={{
            duration: 16 + f.delay,
            repeat: Infinity,
            ease: "easeInOut",
            delay: f.delay,
          }}
          aria-hidden
        >
          {f.text}
        </motion.p>
      ))}

      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-10 lg:px-12">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={headerStaggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.h2
            id="final-decision-cta-heading"
            variants={fadeUp}
            className="text-balance font-sans text-[1.85rem] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl sm:leading-[1.06] lg:text-[2.85rem] lg:leading-[1.04]"
          >
            The next version of you is built through standards.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-10 max-w-2xl text-pretty text-[15px] leading-[1.8] text-zinc-500 sm:text-lg sm:leading-relaxed"
          >
            Most people spend years negotiating with their potential.
            <span className="mt-3 block text-zinc-400">
              Transformation begins the moment execution becomes non-negotiable.
            </span>
          </motion.p>
        </motion.div>

        <motion.div
          className="relative mx-auto mt-14 max-w-xl sm:mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewport}
          transition={txReveal(DURATION_OPACITY, 0.38)}
        >
          <div className="ascend-surface-soft relative min-h-[3.25rem] rounded-2xl px-6 py-5 sm:min-h-[3.5rem] sm:px-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={ROTATING_LINES[lineIndex]}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={txReveal(DURATION_OPACITY)}
                className="text-center font-serif text-sm font-light italic leading-relaxed text-zinc-500 sm:text-[15px]"
              >
                {ROTATING_LINES[lineIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto mt-14 flex max-w-lg flex-col items-stretch gap-4 sm:mt-16 sm:flex-row sm:justify-center sm:gap-5"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL, 0.48)}
        >
          <motion.button
            type="button"
            onClick={() => openAssessment("pro")}
            className={cn(
              "ascend-button-primary inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-8 text-sm font-medium tracking-tight text-zinc-950 sm:w-auto sm:min-w-[14rem]",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={TAP_SPRING}
          >
            Begin Private Assessment
          </motion.button>
          <motion.button
            type="button"
            onClick={scrollToPaths}
            className={cn(
              "ascend-button-ghost inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.03] px-8 text-sm font-medium tracking-tight text-zinc-200 backdrop-blur-sm transition-colors duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] sm:w-auto sm:min-w-[14rem]",
              "hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={TAP_SPRING}
          >
            Explore Transformation Paths
          </motion.button>
        </motion.div>

        <motion.p
          className="mx-auto mt-16 max-w-md text-center text-[12px] leading-relaxed text-zinc-600 sm:mt-20 sm:text-[13px]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL, 0.58)}
        >
          If you continue remaining the same, nothing changes. The question is
          whether your standards move first — or circumstance forces them later.
        </motion.p>
      </div>
    </section>
  );
}
