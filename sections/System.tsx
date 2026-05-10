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
  getCardRevealMobile,
  getFadeUpReveal,
  getGridStaggerParent,
  getHeaderStaggerParent,
  txReveal,
} from "@/lib/motion";
import { EDITORIAL_PLACEHOLDERS } from "@/lib/editorial-placeholders";
import { leadRight, shellStandard } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Mic2, Orbit, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { useMemo, useRef } from "react";

const pillars: {
  title: string;
  description: string;
  icon: LucideIcon;
  floatMs: number;
}[] = [
  {
    title: "Physique",
    description:
      "Training, composition, and presence — built into systems you cannot negotiate away on a bad week.",
    icon: Sparkles,
    floatMs: 5200,
  },
  {
    title: "Voice & presence",
    description:
      "Clear communication under pressure — so you sound certain, not rehearsed.",
    icon: Mic2,
    floatMs: 5800,
  },
  {
    title: "Daily operating system",
    description:
      "Routines and decisions that hold on ordinary days — not only when motivation spikes.",
    icon: Orbit,
    floatMs: 6400,
  },
  {
    title: "Accountability",
    description:
      "Mentor access and response depth scale with your tier — the standard does not.",
    icon: ShieldCheck,
    floatMs: 5400,
  },
  {
    title: "Peer field",
    description:
      "Others working to the same bar — reinforcement without noise.",
    icon: UsersRound,
    floatMs: 6000,
  },
];

function SystemCard({
  title,
  description,
  icon: Icon,
  floatMs,
  cardVariants,
  isMobile,
}: (typeof pillars)[number] & {
  cardVariants: Variants;
  isMobile: boolean;
}) {
  const articleRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const root = articleRef.current;
    const glow = glowRef.current;
    const sheen = sheenRef.current;
    if (!root || !glow) return;
    const r = root.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    glow.style.setProperty("--spot-x", `${x}%`);
    glow.style.setProperty("--spot-y", `${y}%`);
    if (sheen) {
      sheen.style.setProperty("--spot-x", `${x}%`);
      sheen.style.setProperty("--spot-y", `${y}%`);
    }
  };

  const handleLeave = () => {
    const glow = glowRef.current;
    const sheen = sheenRef.current;
    if (glow) {
      glow.style.setProperty("--spot-x", "50%");
      glow.style.setProperty("--spot-y", "50%");
    }
    if (sheen) {
      sheen.style.setProperty("--spot-x", "50%");
      sheen.style.setProperty("--spot-y", "50%");
    }
  };

  return (
    <motion.article
      ref={articleRef}
      variants={cardVariants}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="group relative h-full [perspective:1500px]"
      style={{ transformStyle: "preserve-3d" }}
      whileHover={{
        rotateX: 2,
        rotateY: 2.4,
        y: -2,
        transition: SURFACE_SPRING,
      }}
    >
      <motion.div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.09]",
          "bg-white/[0.025] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-2xl sm:p-8 lg:p-9",
          "transition-[border-color,box-shadow] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
          "group-hover:border-white/[0.16] group-hover:shadow-[0_32px_90px_-48px_rgba(0,0,0,0.9),0_0_72px_-24px_rgba(255,255,255,0.08)]",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            background:
              "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.02) 50%, transparent 65%)",
            backgroundSize: "220% 100%",
          }}
        />

        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.88]"
          style={{
            background:
              "radial-gradient(560px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,0.11), transparent 60%)",
          }}
        />
        <div
          ref={sheenRef}
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.58]"
          style={{
            background:
              "radial-gradient(380px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,0.15), transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.35rem] ring-1 ring-inset ring-white/[0.04]"
          aria-hidden
        />
        <div className="relative z-10 flex h-full flex-col gap-4 sm:gap-6">
          <motion.div
            className="flex size-11 items-center justify-center rounded-xl border border-white/[0.1] bg-zinc-950/50 text-zinc-300 shadow-[0_0_24px_-8px_rgba(255,255,255,0.06)] transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:border-white/[0.14] group-hover:text-white"
            animate={{ y: [0, isMobile ? -2 : -3, 0] }}
            transition={{
              duration: (floatMs / 1000) * (isMobile ? 0.88 : 1),
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon className="size-[20px]" strokeWidth={1.25} />
          </motion.div>
          <div className="flex flex-1 flex-col">
            <h3 className="text-[16px] font-semibold leading-snug tracking-[-0.012em] text-white">
              {title}
            </h3>
            <p className="mt-3.5 text-[13px] leading-[1.72] text-zinc-500 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:text-zinc-400">
              {description}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

export function System() {
  const viewport = useRevealViewport();
  const isMobile = useIsMobileConversion();
  const headerStagger = useMemo(
    () => getHeaderStaggerParent(isMobile),
    [isMobile],
  );
  const fadeMain = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);
  const gridStagger = useMemo(() => getGridStaggerParent(isMobile), [isMobile]);
  const cardVariants = useMemo(
    () => getCardRevealMobile(isMobile),
    [isMobile],
  );
  return (
    <section
      id="programs"
      data-conversion-zone="programs"
      className="ascend-section-world relative overflow-hidden border-t border-white/[0.028] bg-[#050505] pt-[clamp(3.75rem,8vw,6rem)] pb-[clamp(4.25rem,9vw,7.5rem)] sm:pt-24 sm:pb-32 lg:pb-[9.5rem]"
      aria-labelledby="system-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-[#030303]" />
        <div className="absolute right-[-20%] top-[8%] h-[32rem] w-[32rem] rounded-full bg-zinc-500/[0.055] blur-[130px]" />
        <div className="absolute -left-[22%] bottom-[5%] h-[28rem] w-[28rem] rounded-full bg-white/[0.03] blur-[115px]" />
        <div className="absolute left-1/2 top-[20%] h-[18rem] w-[min(100%,56rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.055),transparent_72%)] blur-3xl" />
        <motion.div
          className="absolute right-[12%] top-[42%] h-80 w-80 rounded-full bg-zinc-400/[0.04] blur-[100px]"
          animate={{ scale: [1, 1.06, 1], opacity: [0.45, 0.7, 0.45] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_75%)]" />
      </div>

      <div className={shellStandard}>
        <motion.div
          className={leadRight}
          variants={headerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.p
            variants={fadeMain}
            className="ascend-type-eyebrow mb-4 text-zinc-500 sm:mb-6 lg:mb-7"
          >
            What you get
          </motion.p>
          <motion.h2
            id="system-heading"
            variants={fadeMain}
            className="ascend-type-section-sm text-white"
          >
            One lane. Deeper access when you choose it.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-7 max-w-[34rem] text-pretty text-zinc-500 sm:mt-9"
          >
            Same philosophy across tiers. What changes is mentor proximity,
            accountability load, and how fast we can calibrate you privately.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-8 w-full max-w-6xl sm:mt-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_OPACITY, 0.04)}
        >
          <EditorialImageStrip
            src={EDITORIAL_PLACEHOLDERS.focus}
            alt="Focus and discipline — placeholder reference"
            caption="Discipline · execution — reference frame"
          />
        </motion.div>

        <motion.div
          className="mt-8 grid w-full max-w-6xl grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:mt-16 lg:grid-cols-3 xl:grid-cols-5 xl:gap-6"
          variants={gridStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {pillars.map((p) => (
            <SystemCard
              key={p.title}
              {...p}
              cardVariants={cardVariants}
              isMobile={isMobile}
            />
          ))}
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/48 via-black/14 to-transparent sm:h-32"
        aria-hidden
      />
    </section>
  );
}
