"use client";

import { EditorialImageStrip } from "@/components/EditorialImageStrip";
import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import {
  DURATION_OPACITY,
  DURATION_REVEAL,
  RISE_Y_CARD,
  STAGGER_LIST,
  getFadeUpReveal,
  getHeaderStaggerParent,
  txReveal,
} from "@/lib/motion";
import { EDITORIAL_PLACEHOLDERS } from "@/lib/editorial-placeholders";
import { leadRight, shellNarrow } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo, useRef } from "react";

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
    title: "Structured accountability",
    tone: "Disciplined · ambitious",
    bullets: [
      "Weekly structure you can run under pressure",
      "Accountability matched to your season",
      "Group calibration — standards stay high",
      "Systems for physique, voice, discipline, lifestyle",
    ],
  },
  {
    key: "high",
    label: "High-accountability mentorship",
    title: "Closer integration",
    tone: "Serious pace",
    bullets: [
      "Faster feedback loops",
      "More personalization as stakes rise",
      "Priority when decisions cannot wait",
      "Deeper mentor proximity than Core",
    ],
  },
  {
    key: "private",
    label: "Private transformation architecture",
    title: "Private access",
    tone: "Discreet · selective",
    bullets: [
      "Highest mentor proximity",
      "Confidential calibration when required",
      "Cadence built around your tempo",
      "Same philosophy — maximum private attention",
    ],
  },
];

function DepthCard({
  item,
  index,
  viewport,
  staggerScale,
}: {
  item: (typeof depthLevels)[number];
  index: number;
  viewport: { once: boolean; margin?: string };
  staggerScale: number;
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
      transition={txReveal(
        DURATION_REVEAL,
        index * STAGGER_LIST * staggerScale,
      )}
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
          "relative overflow-hidden rounded-[1.35rem] border border-white/[0.09] bg-white/[0.025] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-2xl sm:p-9 lg:p-11",
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
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-12">
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
            <ul className="mt-5 space-y-2.5 text-[14px] leading-[1.68] text-zinc-500 sm:mt-7 sm:space-y-3.5 sm:leading-[1.75]">
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
  const isMobile = useIsMobileConversion();
  const headerStagger = useMemo(
    () => getHeaderStaggerParent(isMobile),
    [isMobile],
  );
  const fadeMain = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);
  const staggerScale = isMobile ? 0.72 : 1;
  return (
    <section
      id="mentorship-depth"
      data-conversion-zone="mentorship"
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-white/[0.028] bg-[#050505] py-[clamp(4rem,9vw,6.5rem)] sm:py-24 lg:py-[9rem]"
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
          variants={headerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className={leadRight}
        >
          <motion.p
            variants={fadeMain}
            className="ascend-type-eyebrow mb-5 text-zinc-500 sm:mb-7 lg:mb-8"
          >
            Mentorship depth
          </motion.p>
          <motion.h2
            id="mentorship-depth-heading"
            variants={fadeMain}
            className="ascend-type-section text-white"
          >
            Same philosophy.
            <span className="mt-3 block text-zinc-300">
              Different proximity.
            </span>
          </motion.h2>
          <motion.div
            variants={fadeMain}
            className="mt-7 max-w-[34rem] space-y-4 text-pretty sm:mt-9 sm:space-y-5"
          >
            <p className="ascend-prose-calm text-zinc-500">
              Every path covers discipline, physique, communication, and
              identity-level growth.
            </p>
            <p className="ascend-prose-calm text-zinc-500">
              Tiers change how close mentorship sits to your real week — not
              the standard we hold you to.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="mx-auto mt-8 w-full max-w-3xl sm:mt-11"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_OPACITY, 0.04)}
        >
          <EditorialImageStrip
            src={EDITORIAL_PLACEHOLDERS.presence}
            alt="Mentorship and presence — placeholder reference"
            caption="Mentorship · proximity — reference frame"
          />
        </motion.div>

        <div className="relative mx-auto mt-10 max-w-3xl sm:mt-14 lg:mt-16 lg:max-w-3xl">
          <div
            className="pointer-events-none absolute left-[1.1rem] top-0 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-white/15 via-white/[0.06] to-transparent sm:left-[1.25rem] lg:block"
            aria-hidden
          />
          <div className="space-y-8 sm:space-y-10 lg:space-y-14 lg:pl-10">
            {depthLevels.map((item, i) => (
              <DepthCard
                key={item.key}
                item={item}
                index={i}
                viewport={viewport}
                staggerScale={staggerScale}
              />
            ))}
          </div>
        </div>

        <motion.div
          className="mt-12 max-w-xl space-y-3 border-t border-white/[0.06] pt-10 text-left sm:mt-16 lg:pl-1"
          initial={{ opacity: 0, y: RISE_Y_CARD * (isMobile ? 0.65 : 0.85) }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL * (isMobile ? 0.85 : 1))}
        >
          <p className="text-[13px] leading-[1.72] text-zinc-600 sm:text-sm sm:leading-[1.75]">
            Results follow consistency — not clever language.
          </p>
          <p className="text-[13px] leading-relaxed text-zinc-600 sm:text-sm">
            Depth changes how fast we can calibrate you and how hard
            accountability can press when it matters.
          </p>
          <p className="pt-2 text-[12px] font-medium uppercase tracking-[0.2em] text-zinc-700">
            All paths demand work · depth is access
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
