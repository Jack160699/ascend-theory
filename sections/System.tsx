"use client";

import { AscendImage } from "@/components/AscendImage";
import { EditorialImageStrip } from "@/components/EditorialImageStrip";
import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import { CINEMATIC_ASSETS } from "@/lib/cinematic-assets";
import {
  CINEMATIC_IMAGE_CLASS,
  cinematicImageClassForSrc,
} from "@/lib/cinematic-composition";
import {
  DURATION_OPACITY,
  DURATION_REVEAL,
  getFadeUpReveal,
  getGridStaggerParent,
  getHeaderStaggerParent,
  txReveal,
} from "@/lib/motion";
import { cinematicSceneRootProps } from "@/lib/cinematic-v2/cinematic-layout";
import { leadRight, shellStandard } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlarmClock,
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
    title: "Routine",
    description:
      "Depth, notes, and repetition — the private work no one applauds.",
    icon: AlarmClock,
  },
  {
    title: "Accountability",
    description:
      "Private review, clear language, and nowhere for drift to hide.",
    icon: ShieldCheck,
  },
  {
    title: "Peer environment",
    description:
      "Others walking the same bar — composed, direct, emotionally literate.",
    icon: UsersRound,
  },
  {
    title: "Physique",
    description:
      "Conditioning as one layer of the same standard — never the headline.",
    icon: Activity,
  },
];

const pillarVisuals = [
  {
    src: CINEMATIC_ASSETS.philosophyLibrary,
    alt: "Study and intention — reading and journaling in quiet light",
  },
  {
    src: CINEMATIC_ASSETS.systemsPlanningWall,
    alt: "Weekly planning wall — routines, training, work, recovery, communication",
  },
  {
    src: CINEMATIC_ASSETS.brotherhoodWalk,
    alt: "Shared walk — brotherhood and modern masculine presence",
  },
  {
    src: CINEMATIC_ASSETS.lifestyleRooftopStanding,
    alt: "Rooftop at dawn — clarity, solitude, quiet confidence",
  },
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
          "relative aspect-[16/10] overflow-hidden rounded-md border border-white/[0.055] bg-zinc-950 sm:aspect-[5/3] sm:rounded-lg",
          reverse && "sm:[direction:ltr]",
        )}
      >
        <AscendImage
          src={visual.src}
          alt={visual.alt}
          fill
          className={cinematicImageClassForSrc(visual.src)}
          sizes="(max-width:640px) 100vw, 38vw"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
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
      {...cinematicSceneRootProps("programs")}
      data-conversion-zone="programs"
      className="ascend-section-world relative overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-surface py-6 sm:py-10 lg:py-14"
      aria-labelledby="system-heading"
    >
      <SectionContinuity />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        data-cinematic-parallax="8"
      >
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
            Discipline & systems
          </motion.p>
          <motion.h2
            id="system-heading"
            variants={fadeMain}
            className="ascend-type-section-sm ascend-headline"
          >
            How you think, speak, move, and operate — under one private standard.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-2 max-w-[34rem] text-pretty text-zinc-500 sm:mt-3"
          >
            Structure first: the week, the thread, the room. Identity and
            communication stay in charge — conditioning follows the same line.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-4 w-full max-w-[min(100%,68rem)] sm:mt-6 lg:ml-auto lg:mr-0"
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_OPACITY, 0.06)}
        >
          <EditorialImageStrip
            src={CINEMATIC_ASSETS.systemsPlanningWall}
            alt="Weekly planning wall — routines, training, work, recovery, communication"
            aspectClassName="aspect-[2/1] min-h-[7.5rem] sm:aspect-[21/9] sm:min-h-0"
            imageClassName={CINEMATIC_IMAGE_CLASS.systemsPlanningWall}
          />
        </motion.div>

        <motion.article
          className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-lg border border-white/[0.06] bg-zinc-950/25 sm:mt-10 sm:rounded-xl"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL, 0.1)}
        >
          <div className="grid lg:grid-cols-2">
            <div className="relative aspect-[5/4] min-h-[13rem] border-b border-white/[0.06] lg:aspect-auto lg:min-h-[16rem] lg:border-b-0 lg:border-r">
              <AscendImage
                src={CINEMATIC_ASSETS.leadershipLounge}
                alt="Calm leadership — conversation in a premium lounge"
                fill
                className={CINEMATIC_IMAGE_CLASS.leadershipLounge}
                sizes="(max-width:1024px) 100vw, 50vw"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r" />
            </div>
            <div className="flex flex-col justify-center px-4 py-6 sm:px-7 sm:py-9 lg:px-10 lg:py-10">
              <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-zinc-600">
                Leadership & presence
              </p>
              <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight text-zinc-100 sm:text-lg">
                Communication that stays composed when the stakes show up.
              </h3>
              <p className="mt-3 text-[12px] leading-relaxed text-zinc-500 sm:text-[13px]">
                Voice, posture, and listening — held to the same private standard
                as your calendar. No performance. No volume for its own sake.
              </p>
            </div>
          </div>
        </motion.article>

        <motion.div
          className="mx-auto mt-6 max-w-3xl sm:mt-8"
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

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-ascend-canvas/45 to-transparent sm:h-16" />
    </section>
  );
}
