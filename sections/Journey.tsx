"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import {
  DURATION_LINE,
  EASE_CINEMATIC,
  SURFACE_SPRING,
  getFadeUpReveal,
  getHeaderStaggerParent,
  getListStaggerParent,
  getNodeRevealSoftMobile,
  lineDrawHorizontal,
} from "@/lib/motion";
import { leadLeft, shellStandard } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ClipboardPenLine, Map, Phone, Sparkles, Users } from "lucide-react";
import { useMemo } from "react";

const stages: {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    step: "01",
    title: "Intake",
    description:
      "You share context in writing. We read it manually before any tier or price is discussed.",
    icon: ClipboardPenLine,
  },
  {
    step: "02",
    title: "Call",
    description:
      "We align on pressure points, pace, and how much accountability you actually need right now.",
    icon: Phone,
  },
  {
    step: "03",
    title: "Plan",
    description:
      "A clear operating plan across training, voice, discipline, and lifestyle — matched to your tier.",
    icon: Map,
  },
  {
    step: "04",
    title: "Immersion",
    description:
      "Cadence and mentor access scale with your path. The philosophy does not.",
    icon: Users,
  },
  {
    step: "05",
    title: "Default",
    description:
      "Standards stop feeling like a fight — body, voice, and execution line up with who you are building toward.",
    icon: Sparkles,
  },
];

function StageNode({
  icon: Icon,
  step,
  title,
  description,
  className,
  timeline = "vertical",
  withReveal = true,
  nodeVariants,
  isMobile = false,
}: (typeof stages)[number] & {
  className?: string;
  timeline?: "vertical" | "horizontal";
  withReveal?: boolean;
  nodeVariants?: Variants;
  isMobile?: boolean;
}) {
  const isHorizontal = timeline === "horizontal";
  const body = (
    <>
      <div
        className={cn(
          "relative rounded-[1.35rem] border border-white/[0.09] bg-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-md sm:p-6 sm:backdrop-blur-xl",
          "transition-[border-color,box-shadow] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
          "group-hover:border-white/[0.16] group-hover:shadow-[0_28px_80px_-48px_rgba(0,0,0,0.88),0_0_48px_-16px_rgba(255,255,255,0.07)]",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.35rem] opacity-0 transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.88]"
          style={{
            background:
              "radial-gradient(400px circle at 50% 0%, rgba(255,255,255,0.08), transparent 55%)",
          }}
        />
        <div className="relative z-10 flex flex-col gap-4">
          <div
            className={cn(
              "flex items-start gap-3",
              isHorizontal ? "justify-end" : "justify-between",
            )}
          >
            {!isHorizontal ? (
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                {step}
              </span>
            ) : null}
            <motion.div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-zinc-950/50 text-zinc-300 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:border-white/[0.14] group-hover:text-white",
                isHorizontal && "ml-auto",
              )}
              animate={
                isMobile
                  ? undefined
                  : { y: [0, -2, 0] }
              }
              transition={
                isMobile
                  ? undefined
                  : {
                      duration: 5.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            >
              <Icon className="size-[18px]" strokeWidth={1.25} />
            </motion.div>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.012em] text-white">
              {title}
            </h3>
            <p className="mt-3 text-[13px] leading-[1.72] text-zinc-500 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:text-zinc-400">
              {description}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  const hoverY = isMobile ? -1 : -2;

  if (withReveal && nodeVariants) {
    return (
      <motion.div
        variants={nodeVariants}
        className={cn("group relative", className)}
        whileHover={{ y: hoverY }}
        transition={SURFACE_SPRING}
      >
        {body}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn("group relative", className)}
      whileHover={{ y: hoverY }}
      transition={SURFACE_SPRING}
    >
      {body}
    </motion.div>
  );
}

export function Journey() {
  const viewport = useRevealViewport();
  const isMobile = useIsMobileConversion();
  const headerStagger = useMemo(
    () => getHeaderStaggerParent(isMobile),
    [isMobile],
  );
  const fadeMain = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);
  const listStagger = useMemo(() => getListStaggerParent(isMobile), [isMobile]);
  const nodeVariants = useMemo(
    () => getNodeRevealSoftMobile(isMobile),
    [isMobile],
  );
  return (
    <section
      id="journey"
      data-conversion-zone="journey"
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-white/[0.028] bg-[#050505] pt-10 pb-9 sm:pt-28 sm:pb-24 lg:py-32"
      aria-labelledby="journey-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-black" />
        <div className="absolute -left-[18%] top-[30%] h-[26rem] w-[26rem] rounded-full bg-zinc-600/[0.05] blur-[120px]" />
        <div className="absolute -right-[15%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-white/[0.035] blur-[125px]" />
        <div className="absolute bottom-[15%] left-1/2 h-72 w-[min(90%,48rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)] blur-3xl" />
        {!isMobile ? (
          <motion.div
            className="absolute left-[20%] top-[18%] h-64 w-64 rounded-full bg-zinc-400/[0.035] blur-[95px]"
            animate={{ opacity: [0.4, 0.58, 0.4], scale: [1, 1.008, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : (
          <div className="absolute left-[20%] top-[18%] h-48 w-48 rounded-full bg-zinc-400/[0.03] blur-[72px]" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.52)_78%)]" />
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
            className="ascend-type-eyebrow mb-6 text-zinc-500 lg:mb-7"
          >
            How entry works
          </motion.p>
          <motion.h2
            id="journey-heading"
            variants={fadeMain}
            className="ascend-type-section-sm text-white"
          >
            Five steps. No theater.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-7 max-w-[34rem] text-pretty text-zinc-500 sm:mt-9"
          >
            Intake, conversation, plan, immersion — then standards become normal
            again.
          </motion.p>
        </motion.div>

        {/* Mobile: vertical timeline */}
        <div className="relative mx-auto mt-9 max-w-lg lg:hidden">
          <div
            className="absolute bottom-6 left-[19px] top-6 w-px bg-gradient-to-b from-white/[0.12] via-zinc-500/25 to-white/[0.08]"
            aria-hidden
          />
          <motion.div
            className="absolute bottom-6 left-[19px] top-6 w-px origin-top bg-gradient-to-b from-white/40 via-white/15 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            initial={{ scaleY: 0, opacity: 0 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={viewport}
            transition={{
              duration: DURATION_LINE * (isMobile ? 0.88 : 1),
              ease: EASE_CINEMATIC,
              delay: isMobile ? 0.08 : 0.15,
            }}
            aria-hidden
          />
          <motion.ul
            className="relative flex list-none flex-col gap-4 p-0 sm:gap-10"
            variants={listStagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            {stages.map((s) => (
              <motion.li
                key={s.step}
                variants={nodeVariants}
                className="relative flex gap-6 pl-1"
              >
                <div className="relative z-10 flex w-10 shrink-0 flex-col items-center pt-1">
                  <div
                    className="size-3.5 rounded-full border border-white/25 bg-zinc-950 shadow-[0_0_14px_2px_rgba(255,255,255,0.11)] ring-2 ring-white/10"
                    aria-hidden
                  />
                </div>
                <StageNode
                  {...s}
                  className="min-w-0 flex-1 pb-2"
                  withReveal={false}
                  isMobile={isMobile}
                />
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Desktop: horizontal timeline */}
        <motion.div
          className="relative mx-auto mt-16 hidden max-w-[90rem] px-4 lg:mt-20 lg:grid lg:grid-cols-5 lg:gap-x-4 lg:gap-y-0"
          variants={listStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.div
            variants={lineDrawHorizontal}
            className="relative col-span-5 mb-2 h-14"
            style={{ transformOrigin: "0% 50%" }}
          >
            <div
              className="absolute left-[4%] right-[4%] top-[22px] h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent"
              aria-hidden
            />
            <div className="absolute left-[4%] right-[4%] top-[21px] h-[3px] rounded-full bg-gradient-to-r from-white/25 via-white/12 to-white/5 shadow-[0_0_24px_rgba(255,255,255,0.12)]" />
          </motion.div>
          {stages.map((s, i) => (
            <motion.div
              key={s.step}
              variants={nodeVariants}
              className="relative flex flex-col items-center"
            >
              <motion.div
                className="relative z-20 mb-6 flex size-11 items-center justify-center rounded-full border border-white/[0.12] bg-zinc-950/80 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_8px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md"
                animate={{
                  y: [0, -2.5, 0],
                  boxShadow: [
                    "0 0 0 1px rgba(255,255,255,0.04) inset, 0 8px 32px -8px rgba(0,0,0,0.6)",
                    "0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 28px -4px rgba(255,255,255,0.1)",
                    "0 0 0 1px rgba(255,255,255,0.04) inset, 0 8px 32px -8px rgba(0,0,0,0.6)",
                  ],
                }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              >
                <span className="font-mono text-[10px] font-semibold tracking-widest text-zinc-400">
                  {s.step}
                </span>
              </motion.div>
              <StageNode
                {...s}
                className="w-full text-left"
                timeline="horizontal"
                withReveal={false}
                isMobile={false}
              />
            </motion.div>
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
