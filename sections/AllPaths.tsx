"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import { useRevealViewport } from "@/contexts/mobile-conversion";
import {
  DURATION_REVEAL,
  RISE_Y,
  STAGGER_TABLE_ROW,
  fadeUp,
  headerStaggerParent,
  txReveal,
} from "@/lib/motion";
import { leadLeft, shellWide } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const rows: { label: string; core: string; pro: string; black: string }[] = [
  {
    label: "Accountability depth",
    core: "Foundation rhythm — structured check-ins and non‑negotiable systems.",
    pro: "High‑touch accountability with closer mentor proximity.",
    black: "Reserved cadence — private, highest‑frequency accountability.",
  },
  {
    label: "Mentor access",
    core: "Architected mentor touchpoints within the collective container.",
    pro: "Direct mentor alignment for faster calibration and feedback loops.",
    black: "Private mentor proximity — discretion‑first access architecture.",
  },
  {
    label: "Personalization",
    core: "Calibrated systems mapped to your stage — same philosophy, foundation density.",
    pro: "Personalized mentorship architecture layered across life domains.",
    black:
      "Full private calibration — bespoke transformation operating system.",
  },
  {
    label: "Response priority",
    core: "Structured response windows inside the program cadence.",
    pro: "Elevated priority windows for time‑sensitive decisions.",
    black: "Highest response priority — reserved for private allocation.",
  },
  {
    label: "Transformation structure",
    core: "Same methodology: physique, communication, discipline, lifestyle — foundation pacing.",
    pro: "Same methodology — accelerated depth and identity‑grade stakes.",
    black: "Same methodology — private orchestration at executive tempo.",
  },
  {
    label: "Community access",
    core: "Premium community inclusion — peer standards without noise.",
    pro: "Premium community plus a tighter accountability loop.",
    black: "Curated access — discretion, selectivity, minimal surface area.",
  },
  {
    label: "Private calibration",
    core: "Optional pathways as you earn density and consistency.",
    pro: "Integrated calibration where your life architecture demands it.",
    black:
      "Dedicated private calibration sessions and offline‑grade attention.",
  },
];

export function AllPaths() {
  const viewport = useRevealViewport();
  return (
    <section
      id="paths"
      data-conversion-zone="allocate"
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-white/[0.04] bg-[#030303] py-16 sm:py-30 lg:py-[8.5rem]"
      aria-labelledby="all-paths-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-black" />
        <div className="absolute left-1/2 top-[15%] h-[24rem] w-[min(100%,52rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.045),transparent_72%)] blur-3xl" />
        <div className="absolute -right-[18%] bottom-[10%] h-[26rem] w-[26rem] rounded-full bg-zinc-600/[0.04] blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_78%)]" />
      </div>

      <div className={shellWide}>
        <motion.div
          className={leadLeft}
          variants={headerStaggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.p
            variants={fadeUp}
            className="ascend-type-eyebrow mb-6 text-zinc-500 lg:mb-7"
          >
            Mentorship depth
          </motion.p>
          <motion.h2
            id="all-paths-heading"
            variants={fadeUp}
            className="ascend-type-section-sm text-white"
          >
            All Paths Lead To Transformation.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="ascend-prose-calm mt-9 max-w-[34rem] text-pretty text-zinc-500 sm:mt-10"
          >
            Same discipline, physique, communication, structure, and
            accountability philosophy. Depth shifts with mentor allocation — not
            with hierarchy of worth.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-14 w-full max-w-6xl sm:mt-16 lg:mt-20"
          initial={{ opacity: 0, y: RISE_Y }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL)}
        >
          <div className="relative rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-2xl">
            <div
              className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-50"
              style={{
                background:
                  "radial-gradient(900px circle at 50% 0%, rgba(255,255,255,0.06), transparent 55%)",
              }}
              aria-hidden
            />

            <div className="relative overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[52rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th
                      scope="col"
                      className="sticky left-0 z-20 w-[11rem] bg-[#070707]/95 px-4 py-5 text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600 backdrop-blur-md sm:w-[12.5rem] sm:px-6 sm:py-6"
                    >
                      Dimension
                    </th>
                    {(["Core", "Pro", "Black"] as const).map((t) => (
                      <th
                        key={t}
                        scope="col"
                        className="px-4 py-5 text-center sm:px-6 sm:py-6"
                      >
                        <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-400">
                          Ascend {t}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <motion.tr
                      key={row.label}
                      className={cn(
                        "border-b border-white/[0.04] transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
                        i % 2 === 0 ? "bg-white/[0.015]" : "bg-transparent",
                      )}
                      initial={{ opacity: 0, y: 6 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={viewport}
                      transition={txReveal(
                        DURATION_REVEAL * 0.92,
                        i * STAGGER_TABLE_ROW,
                      )}
                    >
                      <th
                        scope="row"
                        className="sticky left-0 z-10 max-w-[11rem] bg-[#060606]/95 px-4 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 backdrop-blur-md sm:max-w-[12.5rem] sm:px-6 sm:py-5 sm:text-[12px] sm:tracking-[0.2em]"
                      >
                        {row.label}
                      </th>
                      <td className="px-4 py-4 align-top text-[13px] leading-relaxed text-zinc-400 sm:px-6 sm:py-5">
                        {row.core}
                      </td>
                      <td className="px-4 py-4 align-top text-[13px] leading-relaxed text-zinc-300 sm:px-6 sm:py-5">
                        {row.pro}
                      </td>
                      <td className="px-4 py-4 align-top text-[13px] leading-relaxed text-zinc-400 sm:px-6 sm:py-5">
                        {row.black}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-7 max-w-2xl text-left text-[12px] leading-[1.72] text-zinc-600 sm:leading-[1.75] lg:pl-1">
            Same philosophy — different integration depth. Core remains
            intentionally rigorous. Tiers scale proximity, cadence, and private
            attention — never a hierarchy of worth.
          </p>
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 to-transparent"
        aria-hidden
      />
    </section>
  );
}
