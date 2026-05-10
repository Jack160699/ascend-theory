"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import { useRevealViewport } from "@/contexts/mobile-conversion";
import {
  DURATION_REVEAL,
  RISE_Y_CARD,
  STAGGER_LIST,
  fadeUp,
  headerStaggerParent,
  txReveal,
} from "@/lib/motion";
import { leadRight, shellNarrow } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRef } from "react";

const depthLevels: {
  key: string;
  label: string;
  title: string;
  tone: string;
  bullets: string[];
}[] = [
  {
    key: "foundation",
    label: "Foundation access",
    title: "Structured accountability and transformation systems",
    tone: "Disciplined · ambitious · structured",
    bullets: [
      "Weekly structure that holds execution to a calendar",
      "Accountability guidance mapped to your season",
      "Group calibration without diluting standards",
      "Transformation systems you can run under pressure",
      "Execution support that keeps promises visible",
    ],
  },
  {
    key: "high",
    label: "High-accountability mentorship",
    title: "Closer mentorship integration and accelerated accountability",
    tone: "Serious transformation · accelerated growth",
    bullets: [
      "Deeper calibration across life domains",
      "Stronger accountability loops with faster feedback",
      "Personalized guidance as stakes rise",
      "Higher response cadence when decisions cannot wait",
      "Execution refinement under mentor proximity",
    ],
  },
  {
    key: "private",
    label: "Private transformation architecture",
    title: "Private high-access transformation environment",
    tone: "Discreet · elite · selective",
    bullets: [
      "Highest mentor proximity with reserved attention",
      "Private calibration for confidential contexts",
      "Elite-level accountability without surface noise",
      "Private execution structure aligned to tempo",
      "Maximum personalization depth — still the same philosophy",
    ],
  },
];

function DepthCard({
  item,
  index,
  viewport,
}: {
  item: (typeof depthLevels)[number];
  index: number;
  viewport: { once: boolean; margin?: string };
}) {
  const rootRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const root = rootRef.current;
    const glow = glowRef.current;
    if (!root || !glow) return;
    const r = root.getBoundingClientRect();
    glow.style.setProperty(
      "--dx",
      `${((e.clientX - r.left) / r.width) * 100}%`,
    );
    glow.style.setProperty(
      "--dy",
      `${((e.clientY - r.top) / r.height) * 100}%`,
    );
  };

  const onLeave = () => {
    const glow = glowRef.current;
    if (!glow) return;
    glow.style.setProperty("--dx", "50%");
    glow.style.setProperty("--dy", "50%");
  };

  return (
    <motion.article
      ref={rootRef}
      initial={{ opacity: 0, y: RISE_Y_CARD }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={txReveal(DURATION_REVEAL, index * STAGGER_LIST)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative"
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[1.35rem] opacity-0 blur-2xl transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.85]",
          item.key === "private" &&
            "bg-[radial-gradient(ellipse_at_50%_0%,rgba(180,150,110,0.12),transparent_65%)]",
          item.key === "high" &&
            "bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.14),transparent_62%)]",
          item.key === "foundation" &&
            "bg-[radial-gradient(ellipse_at_40%_0%,rgba(255,255,255,0.1),transparent_70%)]",
        )}
      />
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.35rem] border border-white/[0.09] bg-white/[0.025] p-9 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-2xl sm:p-11",
          item.key === "private" &&
            "border-amber-950/20 bg-gradient-to-br from-zinc-950/90 to-black",
        )}
      >
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.88]"
          style={{
            background:
              "radial-gradient(640px circle at var(--dx, 50%) var(--dy, 50%), rgba(255,255,255,0.08), transparent 58%)",
          }}
        />
        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-start lg:gap-14">
          <div className="shrink-0 lg:w-[9rem]">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-3.5 text-[11px] font-medium uppercase leading-relaxed tracking-[0.22em] text-zinc-500">
              {item.label}
            </p>
            <p className="mt-4 text-xs leading-[1.65] text-zinc-600">
              {item.tone}
            </p>
          </div>
          <div className="min-w-0 flex-1 border-t border-white/[0.06] pt-7 lg:border-l lg:border-t-0 lg:pl-11 lg:pt-0">
            <h3 className="text-balance font-sans text-xl font-semibold tracking-[-0.024em] text-white sm:text-2xl sm:leading-[1.12]">
              {item.title}
            </h3>
            <ul className="mt-7 space-y-3.5 text-[14px] leading-[1.72] text-zinc-500 sm:text-[15px] sm:leading-[1.75]">
              {item.bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span
                    className="mt-2.5 h-px w-10 shrink-0 bg-gradient-to-r from-white/25 to-transparent"
                    aria-hidden
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function MentorshipDepth() {
  const viewport = useRevealViewport();
  return (
    <section
      id="mentorship-depth"
      data-conversion-zone="mentorship"
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-white/[0.028] bg-[#050505] py-[clamp(5.25rem,12vw,8.5rem)] sm:py-32 lg:py-[9rem]"
      aria-labelledby="mentorship-depth-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-black" />
        <motion.div
          className="absolute left-[10%] top-[20%] h-[26rem] w-[26rem] rounded-full bg-white/[0.04] blur-[120px]"
          animate={{ opacity: [0.35, 0.55, 0.35], y: [0, 16, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-[15%] bottom-[15%] h-[28rem] w-[28rem] rounded-full bg-zinc-600/[0.05] blur-[115px]"
          animate={{ x: [0, -12, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.58)_78%)]" />
      </div>

      <div className={shellNarrow}>
        <motion.div
          variants={headerStaggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className={leadRight}
        >
          <motion.p
            variants={fadeUp}
            className="ascend-type-eyebrow mb-7 text-zinc-500 lg:mb-8"
          >
            Mentorship depth
          </motion.p>
          <motion.h2
            id="mentorship-depth-heading"
            variants={fadeUp}
            className="ascend-type-section text-white"
          >
            Transformation Does Not Change.
            <span className="mt-3 block text-zinc-300">
              Mentorship Depth Does.
            </span>
          </motion.h2>
          <motion.div
            variants={fadeUp}
            className="mt-10 max-w-[34rem] space-y-6 text-pretty sm:mt-11"
          >
            <p className="ascend-prose-calm text-zinc-500">
              Every Ascend path follows the same philosophy: discipline,
              physique, communication, accountability, and identity-level
              growth.
            </p>
            <p className="ascend-prose-calm text-zinc-500">
              The difference is how deeply mentorship integrates into your
              execution environment.
            </p>
          </motion.div>
        </motion.div>

        <div className="relative mx-auto mt-20 max-w-3xl sm:mt-24 lg:mt-28 lg:max-w-3xl">
          <div
            className="pointer-events-none absolute left-[1.1rem] top-0 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-white/15 via-white/[0.06] to-transparent sm:left-[1.25rem] lg:block"
            aria-hidden
          />
          <div className="space-y-14 sm:space-y-16 lg:space-y-20 lg:pl-10">
            {depthLevels.map((item, i) => (
              <DepthCard key={item.key} item={item} index={i} viewport={viewport} />
            ))}
          </div>
        </div>

        <motion.div
          className="mt-16 max-w-xl space-y-4 border-t border-white/[0.06] pt-12 text-left sm:mt-20 lg:pl-1"
          initial={{ opacity: 0, y: RISE_Y_CARD * 0.85 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL)}
        >
          <p className="text-[13px] leading-[1.72] text-zinc-600 sm:text-sm sm:leading-[1.75]">
            Transformation outcomes track execution consistency — not rhetoric.
          </p>
          <p className="text-[13px] leading-relaxed text-zinc-600 sm:text-sm">
            Mentorship depth changes calibration speed, accountability density,
            and how closely standards sit to your decisions.
          </p>
          <p className="text-[13px] leading-relaxed text-zinc-600 sm:text-sm">
            Structure scales with proximity — never with entitlement.
          </p>
          <p className="pt-4 text-[12px] font-medium uppercase tracking-[0.2em] text-zinc-700">
            All paths demand transformation · depth is mentor integration
          </p>
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/48 via-black/14 to-transparent sm:h-32"
        aria-hidden
      />
    </section>
  );
}
