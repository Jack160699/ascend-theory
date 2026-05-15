"use client";

import { AscendImage } from "@/components/AscendImage";
import { ASCEND_IMAGES } from "@/lib/cinematic-assets";
import { ASCEND_IMAGE_CLASS } from "@/lib/cinematic-composition";
import { shellStandard } from "@/lib/editorial-layout";
import { Reveal } from "./Reveal";

export function PhilosophySection() {
  return (
    <section
      id="philosophy"
      data-conversion-zone="philosophy"
      className="scroll-mt-24 border-t border-[color:var(--ascend-border)] bg-ascend-surface py-16 sm:py-20 lg:py-24"
      aria-labelledby="philosophy-heading"
    >
      <div className={shellStandard}>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-center">
          <Reveal>
            <p className="ascend-type-eyebrow mb-3 text-zinc-600">Philosophy</p>
            <h2
              id="philosophy-heading"
              className="ascend-type-section-sm ascend-headline"
            >
              You do not need more motivation.
            </h2>
            <p className="ascend-prose-calm mt-4 max-w-md text-pretty text-zinc-500">
              You need structure that still holds when life gets loud — standards
              for how you think, speak, move, and operate when no one is watching.
            </p>
            <p className="mt-6 max-w-md text-[14px] font-medium leading-relaxed text-zinc-400">
              Ascend Theory is private mentorship for men who are done negotiating
              with their own potential. One system: presence, accountability, and
              disciplined execution — reviewed by hand, not automated.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <figure className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/[0.07] bg-zinc-950 sm:rounded-xl">
              <AscendImage
                src={ASCEND_IMAGES.editorialArchitecture}
                alt="Ascend Theory — composed man in a brutalist architectural space"
                fill
                className={ASCEND_IMAGE_CLASS.editorialArchitecture}
                sizes="(max-width: 1024px) 100vw, 46vw"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
