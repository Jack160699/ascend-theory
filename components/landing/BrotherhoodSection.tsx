"use client";

import { AscendImage } from "@/components/AscendImage";
import { ASCEND_IMAGES } from "@/lib/cinematic-assets";
import { ASCEND_IMAGE_CLASS } from "@/lib/cinematic-composition";
import { shellStandard } from "@/lib/editorial-layout";
import { Reveal } from "./Reveal";

export function BrotherhoodSection() {
  return (
    <section
      id="brotherhood"
      data-conversion-zone="brotherhood"
      className="scroll-mt-24 border-t border-[color:var(--ascend-border)] bg-ascend-canvas"
      aria-labelledby="brotherhood-heading"
    >
      <div className="relative min-h-[min(70vh,32rem)] w-full sm:min-h-[min(75vh,36rem)]">
        <AscendImage
          src={ASCEND_IMAGES.brotherhoodDining}
          alt="Ascend Theory — members sharing a meal in an upscale private setting"
          fill
          className={ASCEND_IMAGE_CLASS.brotherhoodDining}
          sizes="100vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-ascend-canvas via-black/35 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/30" />

        <div
          className={`${shellStandard} relative z-10 flex min-h-[min(70vh,32rem)] flex-col justify-end pb-12 pt-28 sm:min-h-[min(75vh,36rem)] sm:justify-center sm:pb-16 sm:pt-24`}
        >
          <Reveal className="max-w-lg">
            <p className="ascend-type-eyebrow mb-3 text-zinc-400">Brotherhood</p>
            <h2
              id="brotherhood-heading"
              className="ascend-type-section-sm ascend-headline text-white"
            >
              Growth beside men who hold the same bar.
            </h2>
            <p className="ascend-prose-calm mt-4 max-w-md text-pretty text-zinc-300/95">
              Not a network. A small field of people choosing directness, emotional
              intelligence, and quiet ambition — without performance.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
