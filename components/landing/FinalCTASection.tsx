"use client";

import { AscendImage } from "@/components/AscendImage";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import { ASCEND_IMAGES } from "@/lib/cinematic-assets";
import { ASCEND_IMAGE_CLASS } from "@/lib/cinematic-composition";
import { shellStandard } from "@/lib/editorial-layout";
import { FINAL_SECTION_CTA_LABEL } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";

export function FinalCTASection() {
  const { openAssessment } = useAssessmentModal();

  return (
    <section
      id="apply"
      data-conversion-zone="final"
      className="scroll-mt-24 border-t border-[color:var(--ascend-border)]"
      aria-labelledby="final-cta-heading"
    >
      <div className="relative min-h-[min(65vh,28rem)] w-full sm:min-h-[min(70vh,32rem)]">
        <AscendImage
          src={ASCEND_IMAGES.lifestyleCoastal}
          alt="Ascend Theory — man walking a coastal promenade at golden hour"
          fill
          className={ASCEND_IMAGE_CLASS.lifestyleCoastal}
          sizes="100vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-ascend-canvas via-black/45 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />

        <div
          className={`${shellStandard} relative z-10 flex min-h-[min(65vh,28rem)] flex-col justify-center py-16 sm:min-h-[min(70vh,32rem)] sm:py-20`}
        >
          <Reveal className="max-w-xl">
            <h2
              id="final-cta-heading"
              className="ascend-type-section-sm ascend-headline text-white sm:ascend-type-section"
            >
              The structure changes the man.
            </h2>
            <p className="ascend-prose-calm mt-4 max-w-md text-pretty text-zinc-300/95">
              Most people stay inside familiar standards. A smaller group decides
              differently. Private applications are reviewed personally.
            </p>
            <button
              type="button"
              onClick={() => openAssessment()}
              className="ascend-button-primary mt-8 inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-zinc-950 transition-opacity duration-[var(--ascend-hover-duration)] hover:opacity-95 active:scale-[0.997] sm:w-auto"
            >
              {FINAL_SECTION_CTA_LABEL}
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
