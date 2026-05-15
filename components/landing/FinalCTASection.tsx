"use client";

import { WorldButton } from "@/components/landing/world/WorldButton";
import { WorldPanelAtmosphere } from "@/components/landing/world/WorldPanelAtmosphere";
import { WorldSceneImage } from "@/components/landing/world/WorldSceneImage";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import { WORLD_CTA } from "@/lib/world-cta";
import { WORLD_SCENE_MEDIA } from "@/lib/world-images";

/**
 * Final conversion beat — cinematic plate + single CTA.
 */
export function FinalCTASection() {
  const { openAssessment } = useAssessmentModal();
  const media = WORLD_SCENE_MEDIA.brotherhood;

  return (
    <section
      id="apply"
      data-conversion-zone="final"
      className="world-cta-section world-atmosphere-rail world-continuum-rail relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-[#0d0d0d] px-5 py-[clamp(4rem,12vh,10rem)]"
      aria-labelledby="final-cta-heading"
    >
      <div className="world-cta-backdrop absolute inset-0" aria-hidden>
        <div className="world-cta-media">
          <WorldSceneImage media={media} objectFit="cover" />
        </div>
        <div className="world-cta-film absolute inset-0" />
        <div className="world-cta-gradient absolute inset-0" />
      </div>

      <WorldPanelAtmosphere grid="fine" vignette />

      <div className="world-cta-panel world-copy-enter relative z-10 mx-auto max-w-[clamp(20rem,90vw,32rem)] text-center">
        <p className="world-cta-brand mb-[clamp(1.75rem,5vh,2.75rem)]">ASCEND THEORY</p>

        <h2 id="final-cta-heading" className="world-display world-display--cta mb-10 text-balance">
          Ready To Ascend?
        </h2>

        <WorldButton variant="solid-cta" onClick={() => openAssessment()}>
          {WORLD_CTA.beginTheAscent}
        </WorldButton>

        <p className="world-cta-final-line text-balance">
          In a distracted world, focus becomes power.
        </p>
      </div>
    </section>
  );
}
