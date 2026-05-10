"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import {
  DURATION_LINE,
  EASE_CINEMATIC,
  SURFACE_SPRING,
  VIEWPORT_CALM,
  fadeUp,
  headerStaggerParent,
  lineDrawHorizontal,
  listStaggerParent,
  nodeRevealSoft,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardPenLine,
  Map,
  Phone,
  Sparkles,
  Users,
} from "lucide-react";

const viewport = VIEWPORT_CALM;

const stages: {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    step: "01",
    title: "Private assessment",
    description:
      "A manually reviewed intake — honest context, emotional stakes, and the architecture you actually need.",
    icon: ClipboardPenLine,
  },
  {
    step: "02",
    title: "Calibration conversation",
    description:
      "Mentors map pressure points, identity tension, and the accountability density that matches your season.",
    icon: Phone,
  },
  {
    step: "03",
    title: "Transformation blueprint",
    description:
      "A structured operating plan across physique, communication, discipline, and lifestyle — calibrated to your tier.",
    icon: Map,
  },
  {
    step: "04",
    title: "Mentorship immersion",
    description:
      "Proximity, cadence, and response priority scale with your path — depth increases; philosophy stays constant.",
    icon: Users,
  },
  {
    step: "05",
    title: "Identity consolidation",
    description:
      "Standards become default — presence, body, voice, and execution start matching the life you are building.",
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
}: (typeof stages)[number] & {
  className?: string;
  timeline?: "vertical" | "horizontal";
  withReveal?: boolean;
}) {
  const isHorizontal = timeline === "horizontal";
  const body = (
    <>
      <div
        className={cn(
          "relative rounded-2xl border border-white/[0.09] bg-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-xl",
          "transition-[border-color,box-shadow] duration-500",
          "group-hover:border-white/[0.16] group-hover:shadow-[0_28px_80px_-48px_rgba(0,0,0,0.88),0_0_48px_-16px_rgba(255,255,255,0.07)]",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
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
                "flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-zinc-950/50 text-zinc-300 transition-colors duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-white/[0.14] group-hover:text-white",
                isHorizontal && "ml-auto",
              )}
              animate={{ y: [0, -2, 0] }}
              transition={{
                duration: 4.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Icon className="size-[18px]" strokeWidth={1.25} />
            </motion.div>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-white">
              {title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-500 transition-colors duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-zinc-400">
              {description}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  if (withReveal) {
    return (
      <motion.div
        variants={nodeRevealSoft}
        className={cn("group relative", className)}
        whileHover={{ y: -3 }}
        transition={SURFACE_SPRING}
      >
        {body}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn("group relative", className)}
      whileHover={{ y: -3 }}
      transition={SURFACE_SPRING}
    >
      {body}
    </motion.div>
  );
}

export function Journey() {
  return (
    <section
      id="journey"
      data-conversion-zone="journey"
      className="relative scroll-mt-28 overflow-hidden border-t border-white/[0.028] bg-[#050505] py-24 sm:py-28 lg:py-32"
      aria-labelledby="journey-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-black" />
        <div className="absolute -left-[18%] top-[30%] h-[26rem] w-[26rem] rounded-full bg-zinc-600/[0.05] blur-[120px]" />
        <div className="absolute -right-[15%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-white/[0.035] blur-[125px]" />
        <div className="absolute bottom-[15%] left-1/2 h-72 w-[min(90%,48rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)] blur-3xl" />
        <motion.div
          className="absolute left-[20%] top-[18%] h-64 w-64 rounded-full bg-zinc-400/[0.035] blur-[95px]"
          animate={{ opacity: [0.4, 0.65, 0.4], scale: [1, 1.02, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.52)_78%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={headerStaggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.p
            variants={fadeUp}
            className="mb-5 text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-500"
          >
            The ascent sequence
          </motion.p>
          <motion.h2
            id="journey-heading"
            variants={fadeUp}
            className="text-balance text-[clamp(1.9rem,9vw,2.35rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-4xl sm:leading-[1.08] lg:text-[2.35rem]"
          >
            From tension to architecture — without theatrics.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-8 max-w-2xl text-pretty text-[15px] leading-[1.75] text-zinc-500 sm:text-base sm:leading-relaxed"
          >
            Awareness opens the door. Execution architecture, private
            accountability, and mentor proximity close it — without theatrics.
          </motion.p>
        </motion.div>

        {/* Mobile: vertical timeline */}
        <div className="relative mx-auto mt-16 max-w-lg lg:hidden">
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
              duration: DURATION_LINE,
              ease: EASE_CINEMATIC,
              delay: 0.15,
            }}
            aria-hidden
          />
          <motion.ul
            className="relative flex list-none flex-col gap-10 p-0"
            variants={listStaggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            {stages.map((s, i) => (
              <motion.li
                key={s.step}
                variants={nodeRevealSoft}
                className="relative flex gap-6 pl-1"
              >
                <div className="relative z-10 flex w-10 shrink-0 flex-col items-center pt-1">
                  <motion.div
                    className="size-3.5 rounded-full border border-white/25 bg-zinc-950 shadow-[0_0_16px_2px_rgba(255,255,255,0.12)] ring-2 ring-white/10"
                    animate={{
                      boxShadow: [
                        "0 0 12px 2px rgba(255,255,255,0.1)",
                        "0 0 22px 4px rgba(255,255,255,0.14)",
                        "0 0 12px 2px rgba(255,255,255,0.1)",
                      ],
                    }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.15,
                    }}
                  />
                </div>
                <StageNode
                  {...s}
                  className="min-w-0 flex-1 pb-2"
                  withReveal={false}
                />
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Desktop: horizontal timeline */}
        <motion.div
          className="relative mx-auto mt-20 hidden max-w-[90rem] px-4 lg:mt-24 lg:grid lg:grid-cols-5 lg:gap-x-4 lg:gap-y-0"
          variants={listStaggerParent}
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
              variants={nodeRevealSoft}
              className="relative flex flex-col items-center"
            >
              <motion.div
                className="relative z-20 mb-6 flex size-11 items-center justify-center rounded-full border border-white/[0.12] bg-zinc-950/80 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_8px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md"
                animate={{
                  y: [0, -3, 0],
                  boxShadow: [
                    "0 0 0 1px rgba(255,255,255,0.04) inset, 0 8px 32px -8px rgba(0,0,0,0.6)",
                    "0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 28px -4px rgba(255,255,255,0.1)",
                    "0 0 0 1px rgba(255,255,255,0.04) inset, 0 8px 32px -8px rgba(0,0,0,0.6)",
                  ],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.12,
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
