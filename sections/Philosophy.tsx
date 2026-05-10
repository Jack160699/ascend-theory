"use client";

import { EditorialImageStrip } from "@/components/EditorialImageStrip";
import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import {
  DURATION_OPACITY,
  SURFACE_SPRING,
  getFadeUpChild,
  getFadeUpReveal,
  getGridStaggerParent,
  getHeaderStaggerParent,
  txReveal,
} from "@/lib/motion";
import { EDITORIAL_PLACEHOLDERS } from "@/lib/editorial-placeholders";
import { leadLeft, shellStandard } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import { useMemo, useRef } from "react";

const principles: {
  n: string;
  title: string;
  body: string[];
  fragment: string;
}[] = [
  {
    n: "01",
    title: "Identity before motivation",
    body: [
      "Motivation spikes and fades.",
      "Identity is what you repeat when no one is watching.",
    ],
    fragment: "Standards over spikes.",
  },
  {
    n: "02",
    title: "Structure creates discipline",
    body: [
      "Discipline is not a mood — it is what your week is built to protect.",
    ],
    fragment: "Architecture over mood.",
  },
  {
    n: "03",
    title: "Accountability accelerates growth",
    body: [
      "You move faster when someone sees the gap between your claim and your calendar.",
    ],
    fragment: "Visibility compounds.",
  },
  {
    n: "04",
    title: "Transformation is environmental",
    body: [
      "Your default rises when the room stops tolerating small compromises.",
    ],
    fragment: "Environment shapes default.",
  },
];

function PrincipleRow({
  item,
  reversed,
  viewport,
  gridStaggerVariants,
  fadeUpChildVariants,
}: {
  item: (typeof principles)[number];
  reversed: boolean;
  viewport: { once: boolean; margin?: string };
  gridStaggerVariants: Variants;
  fadeUpChildVariants: Variants;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const root = rootRef.current;
    const glow = glowRef.current;
    if (!root || !glow) return;
    const r = root.getBoundingClientRect();
    glow.style.setProperty(
      "--gx",
      `${((e.clientX - r.left) / r.width) * 100}%`,
    );
    glow.style.setProperty(
      "--gy",
      `${((e.clientY - r.top) / r.height) * 100}%`,
    );
  };

  const onLeave = () => {
    const glow = glowRef.current;
    if (!glow) return;
    glow.style.setProperty("--gx", "50%");
    glow.style.setProperty("--gy", "50%");
  };

  const textBlock = (
    <motion.div
      variants={fadeUpChildVariants}
      className={cn(
        "flex flex-col justify-center",
        reversed ? "lg:pl-4" : "lg:pr-4",
      )}
    >
      <div className="mb-3 flex items-baseline gap-3 sm:mb-5 sm:gap-4">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-600">
          {item.n}
        </span>
        <span
          className="h-px flex-1 max-w-[7rem] bg-gradient-to-r from-white/25 to-transparent"
          aria-hidden
        />
      </div>
      <h3 className="text-balance font-sans text-2xl font-semibold tracking-[-0.032em] text-white sm:text-3xl lg:text-[2rem] lg:leading-[1.1]">
        {item.title}
      </h3>
      <div className="mt-5 space-y-2.5 text-pretty text-[15px] leading-[1.72] text-zinc-500 sm:mt-7 sm:space-y-3.5 sm:text-base sm:leading-[1.8]">
        {item.body.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </motion.div>
  );

  const visualBlock = (
    <motion.div
      variants={fadeUpChildVariants}
      className="relative min-h-[9.5rem] sm:min-h-[14rem]"
    >
      <motion.article
        ref={rootRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="group relative h-full min-h-[9.5rem] overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-white/[0.025] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-md sm:min-h-[16rem] sm:p-9 sm:backdrop-blur-xl lg:p-11"
        whileHover={{ y: -2 }}
        transition={SURFACE_SPRING}
      >
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.85]"
          style={{
            background:
              "radial-gradient(520px circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.08), transparent 58%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-50"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, transparent 42%, transparent 100%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <p className="max-w-[12rem] font-mono text-[10px] font-medium uppercase leading-relaxed tracking-[0.22em] text-zinc-600">
            {item.fragment}
          </p>
          <motion.p
            className="text-right font-sans text-[clamp(2.5rem,8vw,4.5rem)] font-semibold leading-none tracking-[-0.04em] text-white/[0.06]"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 10 + parseInt(item.n, 10) * 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            aria-hidden
          >
            {item.n}
          </motion.p>
        </div>
      </motion.article>
    </motion.div>
  );

  return (
    <motion.div
      variants={gridStaggerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-14 xl:gap-x-16"
    >
      {reversed ? (
        <>
          {visualBlock}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {visualBlock}
        </>
      )}
    </motion.div>
  );
}

export function Philosophy() {
  const viewport = useRevealViewport();
  const isMobile = useIsMobileConversion();
  const headerStagger = useMemo(
    () => getHeaderStaggerParent(isMobile),
    [isMobile],
  );
  const fadeMain = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);
  const fadeChild = useMemo(() => getFadeUpChild(isMobile), [isMobile]);
  const gridStagger = useMemo(() => getGridStaggerParent(isMobile), [isMobile]);
  return (
    <section
      id="philosophy"
      data-conversion-zone="philosophy"
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-white/[0.028] bg-[#050505] pt-[clamp(3rem,8vw,5.5rem)] pb-[clamp(3.25rem,8vw,6.5rem)] sm:pt-24 sm:pb-32 lg:pt-[9.5rem] lg:pb-[10.5rem]"
      aria-labelledby="philosophy-heading"
    >
      <SectionContinuity top={false} />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-black" />
        <motion.div
          className="absolute left-1/2 top-[15%] h-[22rem] w-[min(100%,48rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.055),transparent_70%)] blur-3xl"
          animate={{ opacity: [0.4, 0.65, 0.4], scale: [1, 1.03, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-[20%] bottom-[20%] h-[24rem] w-[24rem] rounded-full bg-zinc-600/[0.045] blur-[110px]"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_78%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            mixBlendMode: "overlay",
          }}
        />
      </div>

      <div className={shellStandard}>
        <motion.div
          className={leadLeft}
          variants={headerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.p
            variants={fadeMain}
            className="ascend-type-eyebrow mb-5 text-zinc-500 sm:mb-7 lg:mb-8"
          >
            How we think
          </motion.p>
          <motion.h2
            id="philosophy-heading"
            variants={fadeMain}
            className="ascend-type-section text-white"
          >
            Motivation is not enough.
          </motion.h2>

          <motion.div
            variants={fadeMain}
            className="mt-8 max-w-[34rem] space-y-4 border-l border-white/[0.09] pl-5 sm:mt-11 sm:space-y-6 sm:pl-7 lg:mt-14 lg:space-y-7 lg:pl-8"
          >
            <p className="ascend-prose-lede text-pretty text-zinc-400">
              You already know what to do. The gap is follow-through.
            </p>
            <p className="ascend-prose-calm text-pretty text-zinc-500">
              When standards flex under pressure, results stall — quietly.
            </p>
            <div className="space-y-2.5 text-[15px] leading-[1.78] text-zinc-500 sm:text-base sm:leading-[1.8]">
              <p className="font-medium text-zinc-400">What usually breaks:</p>
              <ul className="list-none space-y-2 pl-0">
                {[
                  "inconsistency",
                  "self-negotiation",
                  "lack of structure",
                  "weak accountability",
                  "fragmented identity",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      className="mt-2.5 h-px w-8 shrink-0 bg-gradient-to-r from-white/30 to-transparent"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="pt-3 text-[15px] font-medium leading-[1.75] text-zinc-300 sm:text-base sm:leading-[1.78]">
              Ascend exists to close that gap — with structure, not hype.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-8 w-full max-w-5xl sm:mt-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_OPACITY, 0.05)}
        >
          <EditorialImageStrip
            src={EDITORIAL_PLACEHOLDERS.silhouette}
            alt="Presence and identity — placeholder reference"
            caption="Identity · presence — reference frame"
          />
        </motion.div>

        <motion.p
          className="mt-8 max-w-[34rem] font-mono text-[10px] font-medium uppercase leading-relaxed tracking-[0.28em] text-zinc-600 sm:mt-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewport}
          transition={txReveal(DURATION_OPACITY, 0.1)}
        >
          One system — not a course catalog.
        </motion.p>

        <div className="mt-10 max-w-5xl space-y-10 sm:mt-14 sm:space-y-14 lg:mt-16 lg:space-y-20">
          {principles.map((p, i) => (
            <PrincipleRow
              key={p.n}
              item={p}
              reversed={i % 2 === 1}
              viewport={viewport}
              gridStaggerVariants={gridStagger}
              fadeUpChildVariants={fadeChild}
            />
          ))}
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/45 via-black/12 to-transparent sm:h-32"
        aria-hidden
      />
    </section>
  );
}
