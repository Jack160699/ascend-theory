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
import { Activity, Mic2, AlarmClock, ShieldCheck, UsersRound } from "lucide-react";
import { useMemo, useRef } from "react";

const pillars: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Physique",
    description: "Training and body composition you can repeat.",
    icon: Activity,
  },
  {
    title: "Presence",
    description: "Clear under pressure.",
    icon: Mic2,
  },
  {
    title: "Routine",
    description: "A week you can actually run.",
    icon: AlarmClock,
  },
  {
    title: "Accountability",
    description: "Someone holds the standard with you.",
    icon: ShieldCheck,
  },
  {
    title: "Peer environment",
    description: "Others at the same bar — quiet reinforcement.",
    icon: UsersRound,
  },
];

function SystemCard({
  title,
  description,
  icon: Icon,
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
    if (isMobile) return;
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
    if (isMobile) return;
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
        rotateX: isMobile ? 0 : 2,
        rotateY: isMobile ? 0 : 2.4,
        y: isMobile ? 0 : -2,
        transition: SURFACE_SPRING,
      }}
    >
      <motion.div
        className={cn(
          "relative flex h-full min-h-[7.5rem] flex-col overflow-hidden rounded-xl border border-[color:var(--ascend-border)]",
          "bg-ascend-elevated/98 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] sm:rounded-[1.05rem] sm:p-4",
          "backdrop-blur-none sm:backdrop-blur-md",
          "transition-[border-color,box-shadow] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
          "group-hover:border-[color:rgba(95,115,134,0.22)] group-hover:shadow-[0_12px_40px_-28px_rgba(0,0,0,0.5)] sm:group-hover:shadow-[0_20px_56px_-36px_rgba(0,0,0,0.55)]",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.1] sm:opacity-[0.14]"
          style={{
            background:
              "linear-gradient(118deg, transparent 0%, rgba(95,115,134,0.05) 48%, transparent 62%)",
          }}
          aria-hidden
        />

        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.65] sm:group-hover:opacity-[0.75]"
          style={{
            background:
              "radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(95,115,134,0.08), transparent 58%)",
          }}
        />
        <div
          ref={sheenRef}
          className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.35] sm:block sm:group-hover:opacity-[0.45]"
          style={{
            background:
              "radial-gradient(280px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,0.06), transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/[0.03] sm:rounded-[1.05rem]"
          aria-hidden
        />
        <div className="relative z-10 flex h-full flex-col gap-2 sm:gap-3">
          <div className="flex size-7 items-center justify-center rounded-lg border border-[color:var(--ascend-border)] bg-ascend-surface/90 text-zinc-400 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:border-[color:rgba(95,115,134,0.24)] group-hover:text-zinc-200 sm:size-8">
            <Icon className="size-[15px] sm:size-[16px]" strokeWidth={1.25} />
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <h3 className="text-[12px] font-semibold leading-snug tracking-[-0.012em] text-[rgb(249,249,247)] sm:text-[13px]">
              {title}
            </h3>
            <p className="mt-1 text-[11px] leading-snug text-zinc-500 sm:mt-1.5 sm:text-[12px]">
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
      className="ascend-section-world relative overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-surface py-7 sm:py-12 lg:py-16"
      aria-labelledby="system-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-ascend-canvas via-ascend-surface to-ascend-canvas" />
        {!isMobile ? (
          <>
            <div className="absolute right-[-20%] top-[8%] h-[28rem] w-[28rem] rounded-full bg-[color:rgba(95,115,134,0.06)] blur-[100px]" />
            <div className="absolute -left-[22%] bottom-[5%] h-[24rem] w-[24rem] rounded-full bg-white/[0.025] blur-[96px]" />
            <div className="absolute left-1/2 top-[18%] h-[16rem] w-[min(100%,52rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent_72%)] blur-3xl" />
          </>
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,6,0.42)_76%)]" />
      </div>

      <div className={shellStandard}>
        <motion.div
          className={cn(leadRight, "lg:pr-6 xl:pr-10")}
          variants={headerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.p
            variants={fadeMain}
            className="ascend-type-eyebrow mb-2 text-zinc-600 sm:mb-3"
          >
            What you get
          </motion.p>
          <motion.h2
            id="system-heading"
            variants={fadeMain}
            className="ascend-type-section-sm ascend-headline"
          >
            Standards you can run every week.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-3 max-w-[34rem] text-pretty text-zinc-500 sm:mt-4"
          >
            Training, presence, routine, accountability — one private structure.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-5 w-full max-w-[min(100%,68rem)] sm:mt-7 lg:ml-auto lg:mr-0"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_OPACITY, 0.04)}
        >
          <EditorialImageStrip
            src={EDITORIAL_PLACEHOLDERS.lifestyle}
            alt="Structured training and lifestyle — low light, realistic"
            aspectClassName="aspect-[2/1] min-h-[8rem] sm:aspect-[21/9] sm:min-h-0"
          />
        </motion.div>

        <motion.div
          className="mt-4 grid w-full max-w-6xl auto-rows-fr grid-cols-2 gap-2 sm:mt-5 sm:gap-2.5 lg:grid-cols-5"
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
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-ascend-canvas/45 to-transparent sm:h-20"
        aria-hidden
      />
    </section>
  );
}
