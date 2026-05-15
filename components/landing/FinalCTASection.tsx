"use client";

import { WorldButton } from "@/components/landing/world/WorldButton";
import { WorldPanelAtmosphere } from "@/components/landing/world/WorldPanelAtmosphere";
import { WorldSceneImage } from "@/components/landing/world/WorldSceneImage";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import { WORLD_CTA } from "@/lib/world-cta";
import { WORLD_SCENE_MEDIA } from "@/lib/world-images";

const BULLETS = [
  "Doctrine-first execution architecture",
  "AI-era intelligence married to discipline",
  "Private surface — scarce, accountable, exacting",
] as const;

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
        <p className="world-cta-brand mb-[clamp(2rem,6vh,3rem)]">ASCEND THEORY</p>
        <p className="world-cta-subline mb-[clamp(1.5rem,5vh,2.5rem)]">
          Operating system for the relentlessly serious
        </p>

        <h2 id="final-cta-heading" className="world-display world-display--cta mb-7">
          The ascent
          <br />
          is earned.
          <br />
          Admission is rare.
        </h2>

        <p className="world-body mx-auto mb-10 max-w-md">
          If you trade in leverage, patience, and long-range outcomes — step
          forward. Humans read signal — not vanity metrics.
        </p>

        <ul className="world-cta-list mx-auto mb-12 max-w-sm">
          {BULLETS.map((item) => (
            <li key={item} className="world-cta-list-item">
              <span className="world-cta-bullet" aria-hidden />
              <span className="world-body--muted">{item}</span>
            </li>
          ))}
        </ul>

        <WorldButton variant="solid-cta" onClick={() => openAssessment()}>
          {WORLD_CTA.beginTheAscent}
        </WorldButton>

        <p className="world-cta-footnote">
          Manual review · Silence is also information
        </p>
      </div>
    </section>
  );
}
