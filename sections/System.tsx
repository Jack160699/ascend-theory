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
}[] = [
  {
    title: "Physique",
    description:
      "Training and composition that still hold when the week goes loud.",
    icon: Sparkles,
  },
  {
    title: "Voice & presence",
    description: "Clear under pressure — certain, not rehearsed.",
    icon: Mic2,
  },
  {
    title: "Operating system",
    description: "Routines and decisions that survive ordinary days.",
    icon: Orbit,
  },
  {
    title: "Accountability",
    description: "Proximity scales with your tier. The bar does not.",
    icon: ShieldCheck,
  },
  {
    title: "Peer field",
    description: "Others at the same bar — reinforcement, not noise.",
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
        rotateX: isMobile ? 0 : 2,
        rotateY: isMobile ? 0 : 2.4,
        y: isMobile ? 0 : -2,
        transition: SURFACE_SPRING,
      }}
    >
      <motion.div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-[color:var(--ascend-border)]",
          "bg-ascend-elevated/98 p-3.5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-xl sm:rounded-[1.25rem] sm:p-5 lg:p-6",
          "transition-[border-color,box-shadow] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
          "group-hover:border-[color:rgba(95,115,134,0.26)] group-hover:shadow-[0_20px_64px_-40px_rgba(0,0,0,0.58),0_0_40px_-12px_var(--ascend-accent-glow)]",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            background:
              "linear-gradient(118deg, transparent 0%, rgba(95,115,134,0.06) 48%, transparent 62%)",
          }}
          aria-hidden
        />

        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.75]"
          style={{
            background:
              "radial-gradient(480px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(95,115,134,0.1), transparent 58%)",
          }}
        />
        <div
          ref={sheenRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.45]"
          style={{
            background:
              "radial-gradient(320px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,0.08), transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.15rem] ring-1 ring-inset ring-white/[0.035] sm:rounded-[1.25rem]"
          aria-hidden
        />
        <div className="relative z-10 flex h-full flex-col gap-3 sm:gap-4">
          <div className="flex size-8 items-center justify-center rounded-lg border border-[color:var(--ascend-border)] bg-ascend-surface/90 text-zinc-400 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:border-[color:rgba(95,115,134,0.28)] group-hover:text-zinc-200 sm:size-9">
            <Icon className="size-[17px] sm:size-[18px]" strokeWidth={1.25} />
          </div>
          <div className="flex flex-1 flex-col">
            <h3 className="text-[13px] font-semibold leading-snug tracking-[-0.012em] text-[rgb(249,249,247)] sm:text-[14px]">
              {title}
            </h3>
            <p className="mt-2 text-[12px] leading-snug text-zinc-500 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:text-zinc-400 sm:mt-2.5 sm:text-[13px] sm:leading-relaxed">
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
      className="ascend-section-world relative overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-surface pt-[clamp(2.25rem,5vw,4.25rem)] pb-[clamp(2.75rem,6vw,5rem)] sm:pt-16 sm:pb-20 lg:pb-24"
      aria-labelledby="system-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-ascend-canvas via-ascend-surface to-ascend-canvas" />
        <div className="absolute right-[-20%] top-[8%] h-[28rem] w-[28rem] rounded-full bg-[color:rgba(95,115,134,0.06)] blur-[100px]" />
        <div className="absolute -left-[22%] bottom-[5%] h-[24rem] w-[24rem] rounded-full bg-white/[0.025] blur-[96px]" />
        <div className="absolute left-1/2 top-[18%] h-[16rem] w-[min(100%,52rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent_72%)] blur-3xl" />
        <div className="absolute right-[12%] top-[42%] h-64 w-64 rounded-full bg-[color:rgba(95,115,134,0.045)] blur-[72px] sm:h-72 sm:w-72 sm:blur-[88px]" />
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
            className="ascend-type-eyebrow mb-3 text-zinc-600 sm:mb-5"
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
            className="ascend-prose-calm mt-4 max-w-[34rem] text-pretty text-zinc-500 sm:mt-5"
          >
            One philosophy. What scales is proximity, response depth, and how
            private the calibration can go.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-6 w-full max-w-[min(100%,68rem)] sm:mt-9 lg:ml-auto lg:mr-0"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_OPACITY, 0.04)}
        >
          <EditorialImageStrip
            src={EDITORIAL_PLACEHOLDERS.training}
            alt="Training floor — disciplined execution"
            caption="Elite training · disciplined execution"
          />
        </motion.div>

        <motion.div
          className="mt-5 grid w-full max-w-6xl grid-cols-2 gap-1.5 sm:mt-8 sm:gap-2.5 lg:mt-10 lg:grid-cols-3 xl:grid-cols-5 xl:gap-3"
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
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-ascend-canvas/45 to-transparent sm:h-24"
        aria-hidden
      />
    </section>
  );
}
