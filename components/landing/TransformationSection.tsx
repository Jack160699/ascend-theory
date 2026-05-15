"use client";

import { AscendImage } from "@/components/AscendImage";
import { ASCEND_IMAGES } from "@/lib/cinematic-assets";
import { ASCEND_IMAGE_CLASS } from "@/lib/cinematic-composition";
import { shellStandard } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

const testimonials = [
  {
    quote:
      "I wanted something that would not negotiate with my standards — how I plan, speak, and close the week.",
    tag: "Identity · discipline",
  },
  {
    quote:
      "The shift was quieter: clearer communication and fewer exceptions I had to explain away.",
    tag: "Presence · communication",
  },
  {
    quote:
      "Decisions stopped living only in my head. The standard was in the thread, the calendar, and how I showed up.",
    tag: "Execution · structure",
  },
] as const;

const lifestyleStills = [
  {
    src: ASCEND_IMAGES.lifestyleGolf,
    alt: "Ascend Theory — members at a private golf club at golden hour",
    className: ASCEND_IMAGE_CLASS.lifestyleGolf,
    span: "sm:col-span-2 sm:row-span-2",
    aspect: "aspect-[4/3] sm:aspect-auto sm:min-h-[14rem]",
  },
  {
    src: ASCEND_IMAGES.lifestyleAirport,
    alt: "Ascend Theory — composed professional in a luxury airport terminal",
    className: ASCEND_IMAGE_CLASS.lifestyleAirport,
    span: "",
    aspect: "aspect-[4/3]",
  },
  {
    src: ASCEND_IMAGES.lifestyleCoastal,
    alt: "Ascend Theory — man on a coastal promenade at sunset",
    className: ASCEND_IMAGE_CLASS.lifestyleCoastal,
    span: "",
    aspect: "aspect-[4/3]",
  },
] as const;

export function TransformationSection() {
  return (
    <section
      id="transformation"
      data-conversion-zone="proof"
      className="scroll-mt-24 border-t border-[color:var(--ascend-border)] bg-ascend-surface py-16 sm:py-20 lg:py-24"
      aria-labelledby="transformation-heading"
    >
      <div className={shellStandard}>
        <Reveal>
          <p className="ascend-type-eyebrow mb-3 text-zinc-600">Transformation</p>
          <h2
            id="transformation-heading"
            className="ascend-type-section-sm ascend-headline max-w-xl"
          >
            Evidence is behavior — not captions.
          </h2>
        </Reveal>

        <Reveal className="mt-10 sm:mt-12" delay={0.06}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
            {lifestyleStills.map((still) => (
              <figure
                key={still.src}
                className={cn(
                  "relative overflow-hidden rounded-lg border border-white/[0.07] bg-zinc-950",
                  still.span,
                )}
              >
                <div className={cn("relative w-full", still.aspect)}>
                  <AscendImage
                    src={still.src}
                    alt={still.alt}
                    fill
                    className={still.className}
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              </figure>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {testimonials.map((t, i) => (
            <Reveal key={t.tag} delay={0.1 + i * 0.06}>
              <blockquote className="h-full border-l border-white/[0.1] py-1 pl-5">
                <p className="text-[14px] leading-relaxed text-zinc-300 sm:text-[15px]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-4 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                  {t.tag}
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
