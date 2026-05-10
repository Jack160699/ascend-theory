"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import {
  DURATION_OPACITY,
  DURATION_REVEAL,
  TAP_SPRING,
  getFadeUpReveal,
  getHeaderStaggerParent,
  txReveal,
} from "@/lib/motion";
import { leadLeft, shellStandard } from "@/lib/editorial-layout";
import { PRIMARY_CTA_LABEL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo } from "react";

const DECISION_LINE =
  "Talent without structure becomes drift — identity hardens where you stop negotiating small exits.";

const FLOAT_FRAGMENTS: readonly {
  text: string;
  top: string;
  left?: string;
  right?: string;
  delay: number;
}[] = [
  { text: "Non-negotiable execution", top: "14%", left: "8%", delay: 0 },
  { text: "Reserved standards", top: "62%", right: "10%", delay: 1.2 },
  { text: "Quiet accountability", top: "38%", left: "6%", delay: 2.4 },
  { text: "Identity-grade cadence", top: "72%", left: "12%", delay: 0.8 },
];

export function FinalDecisionCTA() {
  const { openAssessment } = useAssessmentModal();
  const viewport = useRevealViewport();
  const isMobile = useIsMobileConversion();
  const headerStagger = useMemo(
    () => getHeaderStaggerParent(isMobile),
    [isMobile],
  );
  const fadeMain = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);

  return (
    <section
      id="final-decision-cta"
      data-conversion-zone="final"
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-white/[0.028] bg-[#030303] py-12 sm:py-24 lg:py-36"
      aria-labelledby="final-decision-cta-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-black" />
        <motion.div
          className="absolute left-1/2 top-[8%] h-[min(70vh,36rem)] w-[min(100%,52rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07),transparent_68%)] blur-3xl"
          animate={{ opacity: [0.35, 0.52, 0.38], scale: [1, 1.008, 1] }}
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
            y: [0, -4, 0],
          }}
          transition={{
            duration: 13 + f.delay,
            repeat: Infinity,
            ease: "easeInOut",
            delay: f.delay,
          }}
          aria-hidden
        >
          {f.text}
        </motion.p>
      ))}

      <div className={shellStandard}>
        <motion.div
          className={cn(leadLeft, "max-w-[min(46rem,100%)] lg:max-w-[44rem]")}
          variants={headerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.h2
            id="final-decision-cta-heading"
            variants={fadeMain}
            className="ascend-type-section text-white"
          >
            The next version of you is a standards decision.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-10 max-w-[34rem] text-pretty text-zinc-500 sm:mt-11 sm:text-lg sm:leading-[1.78]"
          >
            Most people negotiate with their potential for years.
            <span className="mt-3 block text-zinc-400">
              Change starts when execution is no longer optional.
            </span>
          </motion.p>
        </motion.div>

        <motion.div
          className="relative mt-12 max-w-xl sm:mt-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewport}
          transition={txReveal(DURATION_OPACITY, isMobile ? 0.22 : 0.38)}
        >
          <div className="ascend-surface-soft relative min-h-[3.25rem] rounded-[1.25rem] px-6 py-5 sm:min-h-[3.5rem] sm:px-8">
            <p className="text-left font-serif text-sm font-light italic leading-[1.72] text-zinc-500 sm:text-[15px] sm:leading-[1.75]">
              {DECISION_LINE}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="mt-12 flex max-w-2xl flex-col items-stretch gap-3 sm:mt-14 sm:flex-row sm:items-center sm:gap-4 lg:gap-5"
          initial={{ opacity: 0, y: isMobile ? 14 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL, isMobile ? 0.28 : 0.48)}
        >
          <motion.button
            type="button"
            onClick={() => openAssessment()}
            className={cn(
              "ascend-button-primary inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-8 text-sm font-medium tracking-tight text-zinc-950 sm:w-auto sm:min-w-[14rem]",
            )}
            whileHover={{ scale: 1.012 }}
            whileTap={{ scale: 0.988 }}
            transition={TAP_SPRING}
          >
            {PRIMARY_CTA_LABEL}
          </motion.button>
          <motion.a
            href="#pricing"
            className={cn(
              "ascend-button-ghost inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.03] px-8 text-sm font-medium tracking-tight text-zinc-200 backdrop-blur-sm transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] sm:w-auto sm:min-w-[14rem]",
              "hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white",
            )}
            whileHover={{ scale: 1.012 }}
            whileTap={{ scale: 0.988 }}
            transition={TAP_SPRING}
          >
            View pricing
          </motion.a>
        </motion.div>

        <motion.p
          className="mt-12 max-w-md text-left text-[12px] leading-[1.72] text-zinc-600 sm:mt-16 sm:text-[13px] sm:leading-[1.75]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL, isMobile ? 0.36 : 0.58)}
        >
          If nothing changes, nothing changes. Either your standards move first —
          or life moves them for you.
        </motion.p>
      </div>
    </section>
  );
}
