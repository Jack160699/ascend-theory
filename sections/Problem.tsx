"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import {
  SURFACE_SPRING,
  getCardRevealMobile,
  getFadeUpReveal,
  getGridStaggerParent,
  getHeaderStaggerParent,
} from "@/lib/motion";
import { leadLeft, shellStandard } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { CalendarClock, MessageCircle, UserRound } from "lucide-react";
import { useMemo, useRef } from "react";

const pains: {
  title: string;
  line: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Identity drift",
    line: "Private behavior stops matching public claims — quietly.",
    icon: UserRound,
  },
  {
    title: "Negotiated discipline",
    line: "Rules bend when the week gets loud; guilt stacks instead.",
    icon: CalendarClock,
  },
  {
    title: "Presence under pressure",
    line: "Voice and clarity are the first things to go when stakes rise.",
    icon: MessageCircle,
  },
];

function PainCard({
  title,
  line,
  icon: Icon,
  cardVariants,
  isMobile,
}: (typeof pains)[number] & {
  cardVariants: Variants;
  isMobile: boolean;
}) {
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
      variants={cardVariants}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="group relative h-full [perspective:1400px]"
      style={{ transformStyle: "preserve-3d" }}
      whileHover={{
        rotateX: isMobile ? 0 : 2.5,
        rotateY: isMobile ? 0 : -2.5,
        transition: SURFACE_SPRING,
      }}
    >
      <motion.div
          className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-xl border border-[color:var(--ascend-border)]",
          "bg-ascend-elevated/95 p-3.5 shadow-[0_0_0_1px_rgba(255,255,255,0.025)_inset] backdrop-blur-md sm:rounded-[1.1rem] sm:p-4 sm:backdrop-blur-xl",
          "transition-[border-color,box-shadow] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
          "group-hover:border-[color:rgba(95,115,134,0.28)] group-hover:shadow-[0_16px_48px_-28px_rgba(0,0,0,0.55),0_0_32px_-14px_var(--ascend-accent-glow)]",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.88]"
          style={{
            background:
              "radial-gradient(380px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(95,115,134,0.08), transparent 58%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.025] via-transparent to-transparent opacity-[0.34]"
          aria-hidden
        />
          <div className="relative z-10 flex flex-col gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg border border-[color:var(--ascend-border)] bg-ascend-surface/80 text-zinc-500 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:border-[color:rgba(95,115,134,0.3)] group-hover:text-zinc-300 sm:size-8">
            <Icon className="size-[16px]" strokeWidth={1.35} />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold leading-snug tracking-[-0.012em] text-[rgb(249,249,247)] sm:text-[14px]">
              {title}
            </h3>
            <p className="mt-1.5 text-[11px] leading-snug text-zinc-600 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:text-zinc-500 sm:mt-2 sm:text-[12px] sm:leading-relaxed">
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
  const cardVariants = useMemo(
    () => getCardRevealMobile(isMobile),
    [isMobile],
  );
  return (
    <section
      id="about"
      data-conversion-zone="tension"
      className="ascend-section-world relative overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-canvas py-8 pb-10 sm:py-14 sm:pb-16 lg:py-20 lg:pb-20"
      aria-labelledby="problem-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-ascend-canvas via-ascend-surface/80 to-ascend-canvas" />
        <div className="absolute -left-[30%] top-1/4 h-[22rem] w-[22rem] rounded-full bg-zinc-600/[0.05] blur-[100px] sm:h-[28rem] sm:w-[28rem] sm:blur-[120px]" />
        <div className="absolute -right-[25%] bottom-[10%] h-[20rem] w-[20rem] rounded-full bg-white/[0.03] blur-[90px] sm:h-[26rem] sm:w-[26rem] sm:blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,6,0.48)_78%)]" />
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
            className="ascend-type-section-sm ascend-headline"
          >
            The friction is not laziness — it is standards that bend when life
            gets loud.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-4 max-w-[34rem] text-pretty text-zinc-500 sm:mt-5"
          >
            Without private structure, discipline fragments — and identity starts
            defending small compromises. Limited capacity; applications read in
            order.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-6 grid w-full max-w-5xl grid-cols-1 gap-2 sm:mt-8 sm:grid-cols-3 sm:gap-3"
          variants={gridStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {pains.map((p) => (
            <PainCard
              key={p.title}
              {...p}
              cardVariants={cardVariants}
              isMobile={isMobile}
            />
          ))}
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-ascend-surface/40 to-transparent sm:h-16"
        aria-hidden
      />
    </section>
  );
}
