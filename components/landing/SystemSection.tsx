"use client";

import { AscendImage } from "@/components/AscendImage";
import { ASCEND_IMAGES } from "@/lib/cinematic-assets";
import { ASCEND_IMAGE_CLASS } from "@/lib/cinematic-composition";
import { shellStandard } from "@/lib/editorial-layout";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

const pillars = [
  {
    title: "Discipline",
    description:
      "Non-negotiable standards for the week — depth, repetition, and the private work no one applauds.",
  },
  {
    title: "Environment",
    description:
      "A room that does not negotiate with drift — composed peers, precision in language, control under pressure.",
  },
  {
    title: "Brotherhood",
    description:
      "Growth beside men who read the room the same way — quiet ambition without performance.",
  },
  {
    title: "Execution",
    description:
      "Decisions live in the calendar, the thread, and how you show up — not in bursts of motivation.",
  },
] as const;

export function SystemSection() {
  return (
    <section
      id="system"
      data-conversion-zone="system"
      className="scroll-mt-24 border-t border-[color:var(--ascend-border)] bg-ascend-canvas py-16 sm:py-20 lg:py-24"
      aria-labelledby="system-heading"
    >
      <div className={shellStandard}>
        <Reveal>
          <p className="ascend-type-eyebrow mb-3 text-zinc-600">The system</p>
          <h2
            id="system-heading"
            className="ascend-type-section-sm ascend-headline max-w-2xl"
          >
            Four pillars. One private standard.
          </h2>
          <p className="ascend-prose-calm mt-4 max-w-lg text-pretty text-zinc-500">
            Structure first — identity, communication, and conditioning under the
            same bar.
          </p>
        </Reveal>

        <Reveal className="mt-10 sm:mt-12" delay={0.06}>
          <figure className="relative aspect-[21/9] overflow-hidden rounded-lg border border-white/[0.07] bg-zinc-950 sm:rounded-xl">
            <AscendImage
              src={ASCEND_IMAGES.teamStudio}
              alt="Ascend Theory team in a premium studio — strategy and design on screen"
              fill
              className={ASCEND_IMAGE_CLASS.teamStudio}
              sizes="(max-width: 1024px) 100vw, 72rem"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ascend-canvas/80 via-transparent to-transparent" />
          </figure>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={0.08 + i * 0.06}>
              <article
                className={cn(
                  "group h-full rounded-lg border border-white/[0.07] bg-ascend-surface/80 p-5 sm:p-6",
                  "transition-[border-color,background-color] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
                  "hover:border-white/[0.12] hover:bg-ascend-elevated/90",
                )}
              >
                <p className="font-mono text-[10px] font-medium tabular-nums text-zinc-600">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-zinc-100">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
                  {pillar.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
