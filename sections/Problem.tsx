"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  Compass,
  MessageCircle,
  RefreshCw,
  ScanLine,
  UserRound,
} from "lucide-react";
import { useRef } from "react";

const viewport = { once: true, margin: "-100px" } as const;

const headerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.16, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const cardsContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.12 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const pains: {
  title: string;
  line: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Identity Drift",
    line: "You feel the gap between who you are in private and who you claim to be in public.",
    icon: UserRound,
  },
  {
    title: "Negotiated Discipline",
    line: "Standards flex the moment life applies pressure — and you notice.",
    icon: CalendarClock,
  },
  {
    title: "Physique Dissonance",
    line: "Your body stops matching the presence you are trying to carry.",
    icon: ScanLine,
  },
  {
    title: "Presence Under Load",
    line: "Communication tightens when stakes rise — and your voice follows.",
    icon: MessageCircle,
  },
  {
    title: "Broken Cadence",
    line: "Momentum never compounds because accountability is optional, not ambient.",
    icon: RefreshCw,
  },
  {
    title: "Architectural Fog",
    line: "Motion without mentorship depth feels like effort without evolution.",
    icon: Compass,
  },
];

function PainCard({
  title,
  line,
  icon: Icon,
}: (typeof pains)[number]) {
  const articleRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const root = articleRef.current;
    const glow = glowRef.current;
    if (!root || !glow) return;
    const r = root.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    glow.style.setProperty("--spot-x", `${x}%`);
    glow.style.setProperty("--spot-y", `${y}%`);
  };

  const handleLeave = () => {
    const glow = glowRef.current;
    if (!glow) return;
    glow.style.setProperty("--spot-x", "50%");
    glow.style.setProperty("--spot-y", "50%");
  };

  return (
    <motion.article
      ref={articleRef}
      variants={cardVariant}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="group relative h-full [perspective:1400px]"
      style={{ transformStyle: "preserve-3d" }}
      whileHover={{
        rotateX: 3.5,
        rotateY: -3.5,
        transition: { type: "spring", stiffness: 260, damping: 22 },
      }}
    >
      <motion.div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08]",
          "bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-xl",
          "transition-[border-color,box-shadow] duration-500",
          "group-hover:border-white/[0.14] group-hover:shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85),0_0_60px_-20px_rgba(255,255,255,0.06)]",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(520px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,0.1), transparent 58%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent opacity-40"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex size-9 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-950/40 text-zinc-400 transition-colors duration-300 group-hover:border-white/[0.12] group-hover:text-zinc-200">
            <Icon className="size-[18px]" strokeWidth={1.35} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight text-white">
              {title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400">
              {line}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

export function Problem() {
  return (
    <section
      id="about"
      data-conversion-zone="tension"
      className="relative overflow-hidden border-t border-white/[0.04] bg-[#050505] py-20 sm:py-28 lg:py-32"
      aria-labelledby="problem-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#060606] to-black" />
        <div className="absolute -left-[30%] top-1/4 h-[28rem] w-[28rem] rounded-full bg-zinc-600/[0.06] blur-[120px]" />
        <div className="absolute -right-[25%] bottom-[10%] h-[26rem] w-[26rem] rounded-full bg-white/[0.035] blur-[110px]" />
        <div className="absolute left-1/2 top-0 h-[20rem] w-[min(90%,48rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_70%)] blur-2xl" />
        <motion.div
          className="absolute left-[15%] top-[55%] h-72 w-72 rounded-full bg-zinc-500/[0.04] blur-[90px]"
          animate={{ y: [0, 24, 0], opacity: [0.5, 0.75, 0.5] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_78%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={headerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.h2
            id="problem-heading"
            variants={fadeUp}
            className="text-balance text-[clamp(1.9rem,9vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-white sm:text-4xl sm:leading-[1.12] lg:text-[2.5rem]"
          >
            Transformation begins when self-negotiation ends.{" "}
            <br className="hidden sm:block" />
            <span className="sm:ml-1.5">Most tension is architectural — not moral.</span>
          </motion.h2>
          <motion.div
            variants={fadeUp}
            className="mx-auto mt-8 max-w-2xl space-y-4 text-pretty text-[15px] leading-[1.7] text-zinc-500 sm:text-base sm:leading-relaxed"
          >
            <p>
              Noise fragments discipline, dulls presence, and quietly rewrites
              what you accept as normal — until your identity starts defending
              the compromise.
            </p>
            <p>
              The pain is not that you are incapable. It is that nothing around
              you is engineered to hold a higher standard — until you choose a
              private architecture that does.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-5 sm:mt-20 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3 lg:gap-6 [perspective:1600px]"
          variants={cardsContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {pains.map((p) => (
            <PainCard key={p.title} {...p} />
          ))}
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent"
        aria-hidden
      />
    </section>
  );
}
