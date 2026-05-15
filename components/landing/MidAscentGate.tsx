"use client";

import { WorldButton } from "@/components/landing/world/WorldButton";
import { WorldPanelAtmosphere } from "@/components/landing/world/WorldPanelAtmosphere";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import { WORLD_CTA } from "@/lib/world-cta";

/**
 * Single mid-scroll conversion beat — between narrative and allocation.
 */
export function MidAscentGate() {
  const { openAssessment } = useAssessmentModal();

  return (
    <section
      id="ascent"
      data-conversion-zone="mid"
      className="world-mid-gate world-atmosphere-rail world-continuum-rail relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-[#0d0d0d] px-5 py-24"
      aria-labelledby="mid-ascent-heading"
    >
      <WorldPanelAtmosphere grid="fine" />

      <div className="world-mid-gate-panel world-copy-enter relative z-10 mx-auto max-w-lg text-center">
        <p className="world-eyebrow mb-6">Admission</p>
        <h2
          id="mid-ascent-heading"
          className="world-display world-display--mid-gate mb-8"
        >
          Built for people
          <br />
          who execute.
        </h2>
        <p className="world-body mx-auto mb-12 max-w-md">
          No hype. No audience theater.
          <br />
          If this is your standard, request access.
        </p>
        <WorldButton variant="outline" onClick={() => openAssessment()}>
          {WORLD_CTA.applyToJoin}
        </WorldButton>
      </div>
    </section>
  );
}
