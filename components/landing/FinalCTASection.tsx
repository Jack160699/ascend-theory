"use client";

import { WorldButton } from "@/components/landing/world/WorldButton";
import { WorldPanelAtmosphere } from "@/components/landing/world/WorldPanelAtmosphere";
import { WorldSceneImage } from "@/components/landing/world/WorldSceneImage";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import { WORLD_CTA } from "@/lib/world-cta";
import { WORLD_SCENE_MEDIA } from "@/lib/world-images";

const BULLETS = [
  "Daily structured routines",
  "Weekly accountability calls",
  "Private curated community",
] as const;

/**
 * Figma final CTA — minimal layout, layered darkness + subtle brotherhood atmosphere.
 */
export function FinalCTASection() {
  const { openAssessment } = useAssessmentModal();
  const media = WORLD_SCENE_MEDIA.brotherhood;

  return (
    <section
      id="apply"
      data-conversion-zone="final"
      className="world-cta-section world-atmosphere-rail world-continuum-rail relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0d0d0d] px-5 py-32"
      aria-labelledby="final-cta-heading"
    >
      <div className="world-cta-backdrop absolute inset-0" aria-hidden>
        <div className="world-cta-media">
          <WorldSceneImage media={media} />
        </div>
        <div className="world-cta-film absolute inset-0" />
        <div className="world-cta-gradient absolute inset-0" />
      </div>

      <WorldPanelAtmosphere grid="fine" vignette />

      <div className="world-cta-panel world-copy-enter relative z-10 mx-auto max-w-lg text-center">
        <p className="world-cta-brand mb-12">ASCEND THEORY</p>
        <p className="world-cta-subline mb-10">A Structured Environment for Men</p>

        <h2 id="final-cta-heading" className="world-display world-display--cta mb-7">
          Ready to
          <br />
          rebuild yourself?
        </h2>

        <p className="world-body mx-auto mb-10 max-w-md">
          We help ambitious men build discipline,
          <br />
          accountability, and confidence through
          <br />
          structured systems and brotherhood.
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
          {WORLD_CTA.privateApplication}
        </WorldButton>

        <p className="world-cta-footnote">Limited spaces · Application required</p>
      </div>
    </section>
  );
}
