"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import {
  DURATION_REVEAL,
  RISE_Y,
  STAGGER_TABLE_ROW,
  getFadeUpReveal,
  getHeaderStaggerParent,
  txReveal,
} from "@/lib/motion";
import { leadLeft, shellWide } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo } from "react";

const rows: { label: string; core: string; pro: string; black: string }[] = [
  {
    label: "Accountability",
    core: "Structured check-ins and clear systems.",
    pro: "Tighter loops — mentors closer to your week.",
    black: "Highest frequency — private cadence.",
  },
  {
    label: "Mentor access",
    core: "Touchpoints inside the shared container.",
    pro: "Direct alignment — faster calibration.",
    black: "Maximum proximity — discretion first.",
  },
  {
    label: "Personalization",
    core: "Systems mapped to your stage.",
    pro: "Deeper tailoring across domains.",
    black: "Fully bespoke cadence and calibration.",
  },
  {
    label: "Response speed",
    core: "Defined windows inside the program.",
    pro: "Priority when decisions cannot wait.",
    black: "Top priority — reserved allocation.",
  },
  {
    label: "What you work on",
    core: "Physique, voice, discipline, lifestyle — foundation pace.",
    pro: "Same scope — accelerated depth.",
    black: "Same scope — private orchestration.",
  },
  {
    label: "Community",
    core: "Peer field — standards without noise.",
    pro: "Same field — stronger accountability thread.",
    black: "Curated surface — minimal noise.",
  },
  {
    label: "Private calibration",
    core: "Earned as consistency holds.",
    pro: "Integrated when stakes demand it.",
    black: "Dedicated private sessions.",
  },
];

const tierCards = [
  { key: "core" as const, title: "Ascend Core", accent: "text-zinc-500" },
  { key: "pro" as const, title: "Ascend Pro", accent: "text-[color:var(--ascend-accent)]" },
  { key: "black" as const, title: "Ascend Black", accent: "text-amber-200/75" },
];

export function AllPaths() {
  const viewport = useRevealViewport();
  const isMobile = useIsMobileConversion();
  const headerStagger = useMemo(
    () => getHeaderStaggerParent(isMobile),
    [isMobile],
  );
  const fadeMain = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);
  const rowStagger = STAGGER_TABLE_ROW * (isMobile ? 0.65 : 1);
  const tableRise = RISE_Y * (isMobile ? 0.72 : 1);
  return (
    <section
      id="paths"
      data-conversion-zone="allocate"
      className="ascend-section-world relative scroll-mt-28 overflow-x-clip border-t border-[color:var(--ascend-border)] bg-ascend-surface py-7 sm:py-16 lg:py-20"
      aria-labelledby="all-paths-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-ascend-canvas via-ascend-surface to-ascend-canvas" />
        <div className="absolute left-1/2 top-[12%] h-[20rem] w-[min(100%,48rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent_72%)] blur-3xl sm:top-[15%] sm:h-[24rem]" />
        <div className="absolute -right-[18%] bottom-[10%] h-[22rem] w-[22rem] rounded-full bg-zinc-600/[0.035] blur-[100px] sm:h-[26rem] sm:w-[26rem] sm:blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,6,0.48)_78%)]" />
      </div>

      <div className={shellWide}>
        <motion.div
          className={leadLeft}
          variants={headerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.p
            variants={fadeMain}
            className="ascend-type-eyebrow mb-4 text-zinc-500 sm:mb-6 lg:mb-7"
          >
            Compare tiers
          </motion.p>
          <motion.h2
            id="all-paths-heading"
            variants={fadeMain}
            className="ascend-type-section-sm ascend-headline"
          >
            Same lane. Different access.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-6 max-w-[34rem] text-pretty text-zinc-500 sm:mt-8"
          >
            Philosophy is fixed. Tiers change mentor proximity, response speed,
            and how private calibration can go — not your worth.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-8 w-full max-w-6xl sm:mt-12 lg:mt-16"
          initial={{ opacity: 0, y: tableRise }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL * (isMobile ? 0.88 : 1))}
        >
          {/* Mobile: stacked tier cards — no horizontal scroll */}
          <div className="space-y-4 lg:hidden">
            {tierCards.map((tier) => (
              <div
                key={tier.key}
                className="rounded-[1.1rem] border border-white/[0.08] bg-white/[0.025] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]"
              >
                <p
                  className={cn(
                    "text-[11px] font-medium uppercase tracking-[0.26em]",
                    tier.accent,
                  )}
                >
                  {tier.title}
                </p>
                <div className="mt-4 space-y-3.5">
                  {rows.map((row) => (
                    <div key={row.label} className="border-t border-white/[0.06] pt-3 first:border-t-0 first:pt-0">
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                        {row.label}
                      </p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
                        {tier.key === "core"
                          ? row.core
                          : tier.key === "pro"
                            ? row.pro
                            : row.black}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: wide comparison table */}
          <div className="relative hidden rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-xl lg:block">
            <div
              className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-50"
              style={{
                background:
                  "radial-gradient(900px circle at 50% 0%, rgba(255,255,255,0.06), transparent 55%)",
              }}
              aria-hidden
            />

            <div className="relative overflow-x-auto">
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
                        DURATION_REVEAL * (isMobile ? 0.82 : 0.92),
                        i * rowStagger,
                      )}
                    >
                      <th
                        scope="row"
                        className="sticky left-0 z-10 max-w-[11rem] border-r border-[color:var(--ascend-border)] bg-ascend-elevated/95 px-4 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600 backdrop-blur-md sm:max-w-[12.5rem] sm:px-6 sm:py-4 sm:text-[12px] sm:tracking-[0.2em]"
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

          <p className="mt-5 max-w-2xl text-left text-[12px] leading-[1.72] text-zinc-600 sm:mt-6 sm:leading-[1.75] lg:pl-1">
            Core is already rigorous. Pro and Black add proximity, speed, and
            private room — not a higher “class” of person.
          </p>
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-ascend-canvas/55 to-transparent sm:h-20"
        aria-hidden
      />
    </section>
  );
}
