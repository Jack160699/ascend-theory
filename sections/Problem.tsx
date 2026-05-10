"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import {
  SURFACE_SPRING,
  cardReveal,
  getFadeUpReveal,
  getGridStaggerParent,
  getHeaderStaggerParent,
} from "@/lib/motion";
import { leadLeft, shellStandard } from "@/lib/editorial-layout";
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
import { useMemo, useRef } from "react";

const pains: {
  title: string;
  line: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Identity drift",
    line: "What you do in private stops matching what you claim in public.",
    icon: UserRound,
  },
  {
    title: "Negotiated discipline",
    line: "Rules loosen the moment the week gets heavy — then the guilt stacks.",
    icon: CalendarClock,
  },
  {
    title: "Physique gap",
    line: "Your body no longer matches the presence you are trying to project.",
    icon: ScanLine,
  },
  {
    title: "Presence under pressure",
    line: "When stakes rise, your voice and clarity are the first things to go.",
    icon: MessageCircle,
  },
  {
    title: "Broken cadence",
    line: "You start strong, then accountability becomes optional again.",
    icon: RefreshCw,
  },
  {
    title: "No clear lane",
    line: "Busy days feel like motion — but the trajectory is unclear.",
    icon: Compass,
  },
];

function PainCard({ title, line, icon: Icon }: (typeof pains)[number]) {
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
      variants={cardReveal}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="group relative h-full [perspective:1400px]"
      style={{ transformStyle: "preserve-3d" }}
      whileHover={{
        rotateX: 2.5,
        rotateY: -2.5,
        transition: SURFACE_SPRING,
      }}
    >
      <motion.div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.08]",
          "bg-white/[0.03] p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-xl sm:p-8",
          "transition-[border-color,box-shadow] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
          "group-hover:border-white/[0.14] group-hover:shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85),0_0_60px_-20px_rgba(255,255,255,0.06)]",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.88]"
          style={{
            background:
              "radial-gradient(520px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,0.1), transparent 58%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent opacity-40"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex size-9 items-center justify-center rounded-lg border border-white/[0.08] bg-zinc-950/40 text-zinc-400 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:border-white/[0.12] group-hover:text-zinc-200">
            <Icon className="size-[18px]" strokeWidth={1.35} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.012em] text-white">
              {title}
            </h3>
            <p className="mt-3 text-[13px] leading-[1.72] text-zinc-500 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:text-zinc-400">
              {line}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

export function Problem() {
  const viewport = useRevealViewport();
  const isMobile = useIsMobileConversion();
  const headerStagger = useMemo(
    () => getHeaderStaggerParent(isMobile),
    [isMobile],
  );
  const fadeMain = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);
  const gridStagger = useMemo(() => getGridStaggerParent(isMobile), [isMobile]);
  return (
    <section
      id="about"
      data-conversion-zone="tension"
      className="ascend-section-world relative overflow-hidden border-t border-white/[0.028] bg-[#050505] pt-20 pb-[clamp(5.5rem,12vw,8.5rem)] sm:pt-32 sm:pb-36 lg:pt-[7.75rem] lg:pb-[9.5rem]"
      aria-labelledby="problem-heading"
    >
      <SectionContinuity />
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

      <div className={shellStandard}>
        <motion.div
          className={leadLeft}
          variants={headerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.h2
            id="problem-heading"
            variants={fadeMain}
            className="ascend-type-section-sm text-white"
          >
            The friction is not laziness.{" "}
            <br className="hidden sm:block" />
            <span className="sm:ml-1.5">
              It is standards that bend when life gets loud.
            </span>
          </motion.h2>
          <motion.div
            variants={fadeMain}
            className="mt-10 max-w-[34rem] space-y-5 text-pretty sm:mt-11"
          >
            <p className="ascend-prose-calm text-zinc-500">
              Without a private structure, discipline fragments — and your
              identity quietly starts defending small compromises.
            </p>
            <p className="text-[13px] font-medium leading-relaxed text-zinc-400/95 sm:text-[14px] sm:leading-relaxed">
              Limited capacity. Applications are read in order — not as a bulk
              funnel.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-14 grid w-full max-w-5xl grid-cols-1 gap-5 sm:mt-24 sm:grid-cols-2 sm:gap-6 lg:mt-28 lg:grid-cols-3 lg:gap-7 [perspective:1600px]"
          variants={gridStagger}
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
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/45 via-black/12 to-transparent sm:h-32"
        aria-hidden
      />
    </section>
  );
}
