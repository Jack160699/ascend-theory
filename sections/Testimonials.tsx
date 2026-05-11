"use client";

import { AscendImage } from "@/components/AscendImage";
import { SectionContinuity } from "@/components/SectionContinuity";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import { CINEMATIC_ASSETS } from "@/lib/cinematic-assets";
import {
  DURATION_REVEAL,
  SURFACE_SPRING,
  getFadeUpChild,
  getFadeUpReveal,
  getHeaderStaggerParent,
  getListStaggerParent,
  txReveal,
} from "@/lib/motion";
import { leadLeft, shellWide } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import { Quote } from "lucide-react";
import { useMemo } from "react";

const quotes = [
  {
    text: "I wanted something that would not negotiate with my standards — how I plan, speak, and close the week.",
    tag: "Identity · discipline",
  },
  {
    text: "The shift was quieter: clearer communication and fewer exceptions I had to explain away.",
    tag: "Presence · communication",
  },
] as const;

const fieldStills = [
  {
    src: CINEMATIC_ASSETS.leadershipLounge,
    label: "Presence",
    sub: "Calm leadership in conversation",
    span: "lg:col-span-2 lg:row-span-2",
    aspect: "aspect-[4/3] lg:aspect-auto lg:min-h-[14rem]",
  },
  {
    src: CINEMATIC_ASSETS.systemsPlanningWall,
    label: "Systems",
    sub: "The week made legible on the wall",
    span: "",
    aspect: "aspect-[5/4]",
  },
  {
    src: CINEMATIC_ASSETS.brotherhoodWalk,
    label: "Field",
    sub: "Shared standard, private pace",
    span: "",
    aspect: "aspect-[5/4]",
  },
] as const;

function FieldStillsFigure({
  src,
  label,
  sub,
  span,
  aspect,
  fadeChildVariants,
  isMobile,
}: (typeof fieldStills)[number] & {
  fadeChildVariants: Variants;
  isMobile: boolean;
}) {
  return (
    <motion.figure
      variants={fadeChildVariants}
      whileHover={isMobile ? undefined : { y: -1 }}
      transition={SURFACE_SPRING}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
        span,
      )}
    >
      <div className={cn("relative w-full", aspect)}>
        <AscendImage
          src={src}
          alt={label}
          fill
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.01]"
          sizes="(max-width:1024px) 100vw, 40vw"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <figcaption className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-4">
          <p className="text-[12px] font-medium tracking-tight text-white sm:text-sm">
            {label}
          </p>
          <p className="mt-0.5 text-[10px] leading-snug text-zinc-500 sm:text-[11px]">
            {sub}
          </p>
        </figcaption>
      </div>
    </motion.figure>
  );
}

export function Testimonials() {
  const viewport = useRevealViewport();
  const isMobile = useIsMobileConversion();
  const headerStagger = useMemo(
    () => getHeaderStaggerParent(isMobile),
    [isMobile],
  );
  const fadeMain = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);
  const listStagger = useMemo(() => getListStaggerParent(isMobile), [isMobile]);
  const fadeChild = useMemo(() => getFadeUpChild(isMobile), [isMobile]);

  return (
    <section
      id="testimonials"
      data-conversion-zone="proof"
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-canvas py-7 sm:py-11 lg:py-14"
      aria-labelledby="proof-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-ascend-surface/70 via-ascend-canvas to-ascend-surface/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.52)_78%)]" />
      </div>

      <div className={shellWide}>
        <motion.div
          className={leadLeft}
          variants={headerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.p
            variants={fadeMain}
            className="ascend-type-eyebrow mb-2 text-zinc-500 sm:mb-3"
          >
            Proof
          </motion.p>
          <motion.h2
            id="proof-heading"
            variants={fadeMain}
            className="ascend-type-section-sm ascend-headline"
          >
            Evidence is behavior — not captions.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-3 max-w-[32rem] text-pretty text-zinc-500 sm:mt-4"
          >
            Stills from how members think, speak, and hold structure — editorial,
            restrained, and grounded.
          </motion.p>
        </motion.div>

        <motion.article
          className="mt-8 max-w-5xl border border-white/[0.07] bg-white/[0.02] sm:mt-10 lg:mt-11"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={txReveal(DURATION_REVEAL, 0.06)}
        >
          <div className="grid lg:grid-cols-2">
            <div className="relative aspect-[5/4] min-h-[12rem] border-b border-white/[0.06] lg:aspect-auto lg:min-h-[17rem] lg:border-b-0 lg:border-r">
              <AscendImage
                src={CINEMATIC_ASSETS.lifestyleRooftopStanding}
                alt="Rooftop at dawn — solitude, clarity, quiet confidence"
                fill
                className="object-cover object-[center_35%]"
                sizes="(max-width:1024px) 100vw, 50vw"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent lg:bg-gradient-to-r" />
            </div>
            <div className="flex flex-col justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
              <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-zinc-600">
                Transformation
              </p>
              <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-zinc-100 sm:text-xl">
                A season of operating differently.
              </h3>
              <blockquote className="mt-4 border-l border-white/[0.12] pl-4 text-[13px] leading-relaxed text-zinc-400 sm:text-[14px] sm:leading-relaxed">
                “Decisions stopped living only in my head. The standard was in the
                thread, the calendar, and how I showed up — not in a burst of
                motivation.”
              </blockquote>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">
                Private member note
              </p>
              <div className="mt-5 flex gap-2">
                <div className="relative h-16 w-[28%] overflow-hidden rounded-md border border-white/[0.08] bg-zinc-950 sm:h-20">
                  <AscendImage
                    src={CINEMATIC_ASSETS.philosophyLibrary}
                    alt="Depth and study — weekly private work"
                    fill
                    className="object-cover"
                    sizes="120px"
                    loading="lazy"
                  />
                </div>
                <div className="relative h-16 flex-1 overflow-hidden rounded-md border border-white/[0.08] bg-zinc-950 sm:h-20">
                  <AscendImage
                    src={CINEMATIC_ASSETS.systemsPlanningWall}
                    alt="Planning wall — structure and consistency"
                    fill
                    className="object-cover"
                    sizes="240px"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.article>

        <motion.div
          className="mt-8 sm:mt-10"
          variants={listStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <p className="mb-3 text-left text-[10px] font-medium uppercase tracking-[0.26em] text-zinc-600 sm:mb-4">
            Field stills
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:grid-rows-2 lg:gap-3">
            {fieldStills.map((f) => (
              <FieldStillsFigure
                key={f.label}
                {...f}
                fadeChildVariants={fadeChild}
                isMobile={isMobile}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-8 grid max-w-5xl gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5"
          variants={listStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          {quotes.map((q) => (
            <motion.figure
              key={q.tag}
              variants={fadeChild}
              className="border-l border-white/[0.1] py-1 pl-4 sm:pl-5"
            >
              <Quote
                className="mb-2 size-5 text-white/[0.07]"
                strokeWidth={1}
                aria-hidden
              />
              <blockquote className="text-[13px] leading-snug text-zinc-300 sm:text-[14px] sm:leading-relaxed">
                “{q.text}”
              </blockquote>
              <figcaption className="mt-3 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                {q.tag}
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-ascend-surface/35 to-transparent sm:h-16" />
    </section>
  );
}
