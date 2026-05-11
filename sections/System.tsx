"use client";

import { AscendImage } from "@/components/AscendImage";
import { EditorialImageStrip } from "@/components/EditorialImageStrip";
import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import { EDITORIAL_ASSETS } from "@/lib/editorial-assets";
import {
  DURATION_OPACITY,
  getFadeUpReveal,
  getGridStaggerParent,
  getHeaderStaggerParent,
  txReveal,
} from "@/lib/motion";
import { leadRight, shellStandard } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlarmClock,
  Mic2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useMemo } from "react";

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

const pillarVisuals = [
  { src: EDITORIAL_ASSETS.training, alt: "Training floor — low light" },
  { src: EDITORIAL_ASSETS.focus, alt: "Gym floor — focused work" },
  { src: EDITORIAL_ASSETS.silhouette, alt: "Athlete silhouette — controlled effort" },
  { src: EDITORIAL_ASSETS.training, alt: "Training repetition" },
  { src: EDITORIAL_ASSETS.presence, alt: "Training environment — steady presence" },
] as const;

function PillarRow({
  title,
  description,
  icon: Icon,
  index,
  fadeVariants,
}: (typeof pillars)[number] & {
  index: number;
  fadeVariants: Variants;
}) {
  const reverse = index % 2 === 1;
  const visual = pillarVisuals[index] ?? pillarVisuals[0];
  return (
    <motion.div
      variants={fadeVariants}
      className={cn(
        "grid gap-4 border-t border-white/[0.06] pt-5 first:border-t-0 first:pt-0 sm:gap-6 sm:pt-6",
        "sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:items-center",
        reverse && "sm:[direction:rtl]",
      )}
    >
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden rounded-lg border border-white/[0.06] bg-zinc-950 sm:aspect-[5/3]",
          reverse && "sm:[direction:ltr]",
        )}
      >
        <AscendImage
          src={visual.src}
          alt={visual.alt}
          fill
          className="object-cover object-center"
          sizes="(max-width:640px) 100vw, 38vw"
          loading="lazy"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
          aria-hidden
        />
      </div>
      <div className={cn("min-w-0 sm:pl-2", reverse && "sm:[direction:ltr]")}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.03] text-zinc-400">
            <Icon className="size-[15px]" strokeWidth={1.25} />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold leading-snug text-zinc-100 sm:text-[14px]">
              {title}
            </h3>
            <p className="mt-1 text-[11px] leading-snug text-zinc-500 sm:text-[12px]">
              {description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
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

  return (
    <section
      id="programs"
      data-conversion-zone="programs"
      className="ascend-section-world relative overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-surface py-6 sm:py-10 lg:py-14"
      aria-labelledby="system-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-ascend-canvas via-ascend-surface to-ascend-canvas" />
        {!isMobile ? (
          <div className="absolute right-[-18%] top-[10%] h-[22rem] w-[22rem] rounded-full bg-[color:rgba(95,115,134,0.05)] blur-[88px]" />
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
            className="ascend-type-eyebrow mb-1.5 text-zinc-600 sm:mb-2"
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
            className="ascend-prose-calm mt-2 max-w-[34rem] text-pretty text-zinc-500 sm:mt-3"
          >
            One private structure — not a catalog of courses.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-4 w-full max-w-[min(100%,68rem)] sm:mt-6 lg:ml-auto lg:mr-0"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_OPACITY, 0.04)}
        >
          <EditorialImageStrip
            src={EDITORIAL_ASSETS.lifestyle}
            alt="Training floor in low light"
            aspectClassName="aspect-[2/1] min-h-[7.5rem] sm:aspect-[21/9] sm:min-h-0"
          />
        </motion.div>

        <motion.div
          className="mx-auto mt-5 max-w-3xl sm:mt-6"
          variants={gridStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {pillars.map((p, i) => (
            <PillarRow
              key={p.title}
              {...p}
              index={i}
              fadeVariants={fadeMain}
            />
          ))}
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-ascend-canvas/45 to-transparent sm:h-16"
        aria-hidden
      />
    </section>
  );
}
