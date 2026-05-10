"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import { useRevealViewport } from "@/contexts/mobile-conversion";
import {
  SURFACE_SPRING,
  cardReveal,
  fadeUp,
  gridStaggerParent,
  headerStaggerParent,
} from "@/lib/motion";
import { leadRight, shellStandard } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Mic2, Orbit, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { useRef } from "react";

const pillars: {
  title: string;
  description: string;
  icon: LucideIcon;
  floatMs: number;
}[] = [
  {
    title: "Physique Architecture",
    description:
      "Body composition, training intelligence, and physical presence — held inside non‑negotiable execution systems.",
    icon: Sparkles,
    floatMs: 5200,
  },
  {
    title: "Communication & Presence",
    description:
      "Voice, clarity, and social calibration under pressure — so presence reads as authority, not performance.",
    icon: Mic2,
    floatMs: 5800,
  },
  {
    title: "Discipline Operating System",
    description:
      "Routines, rituals, and decision hygiene engineered for long‑horizon identity — not motivation spikes.",
    icon: Orbit,
    floatMs: 6400,
  },
  {
    title: "Luxury Accountability",
    description:
      "Private mentorship density, response priority, and proximity — scaled to the tier you select, never to “more transformation for everyone.”",
    icon: ShieldCheck,
    floatMs: 5400,
  },
  {
    title: "Peer Environment",
    description:
      "A premium field of people building the same class of standards — community as reinforcement, not noise.",
    icon: UsersRound,
    floatMs: 6000,
  },
];

function SystemCard({
  title,
  description,
  icon: Icon,
  floatMs,
}: (typeof pillars)[number]) {
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
      variants={cardReveal}
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
          "bg-white/[0.025] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-2xl sm:p-9",
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
        <div className="relative z-10 flex h-full flex-col gap-6">
          <motion.div
            className="flex size-11 items-center justify-center rounded-xl border border-white/[0.1] bg-zinc-950/50 text-zinc-300 shadow-[0_0_24px_-8px_rgba(255,255,255,0.06)] transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:border-white/[0.14] group-hover:text-white"
            animate={{ y: [0, -3, 0] }}
            transition={{
              duration: floatMs / 1000,
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
  return (
    <section
      id="programs"
      data-conversion-zone="programs"
      className="ascend-section-world relative overflow-hidden border-t border-white/[0.028] bg-[#050505] pt-[clamp(5rem,10vw,7.25rem)] pb-[clamp(5.5rem,12vw,9rem)] sm:pt-28 sm:pb-36 lg:pb-[9.5rem]"
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
          variants={headerStaggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.p
            variants={fadeUp}
            className="ascend-type-eyebrow mb-6 text-zinc-500 lg:mb-7"
          >
            The Ascend architecture
          </motion.p>
          <motion.h2
            id="system-heading"
            variants={fadeUp}
            className="ascend-type-section-sm text-white"
          >
            One Philosophy. Layered Mentorship Depth.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="ascend-prose-calm mt-9 max-w-[34rem] text-pretty text-zinc-500 sm:mt-10"
          >
            One philosophy. Tiers scale mentor proximity, accountability
            intensity, response priority, personalization depth, and private
            calibration — never the standard of transformation itself.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-16 grid w-full max-w-6xl grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2 sm:gap-6 lg:mt-24 lg:grid-cols-3 xl:grid-cols-5"
          variants={gridStaggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {pillars.map((p) => (
            <SystemCard key={p.title} {...p} />
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
