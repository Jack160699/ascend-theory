"use client";

import { WorldButton } from "@/components/landing/world/WorldButton";
import { WorldSceneImage } from "@/components/landing/world/WorldSceneImage";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import { useIsMobileConversion } from "@/contexts/mobile-conversion";
import { WORLD_CTA } from "@/lib/world-cta";
import { WORLD_SCENE_MEDIA } from "@/lib/world-images";
import { FIGMA_SCENE_SCROLL, sceneScrollHeight } from "@/lib/world-scene-metrics";

/**
 * Figma WORLD SYSTEM hero — single restrained entry CTA.
 */
export function HeroScene() {
  const isMobile = useIsMobileConversion();
  const { openAssessment } = useAssessmentModal();
  const railHeight = sceneScrollHeight(FIGMA_SCENE_SCROLL.hero, isMobile);
  const media = WORLD_SCENE_MEDIA.hero;

  return (
    <section
      id="hero"
      className="world-hero-rail world-atmosphere-rail world-continuum-rail relative w-full bg-[#0d0d0d]"
      style={{ height: railHeight }}
    >
      <div className="world-sticky-frame sticky top-0 w-full overflow-hidden bg-[#0d0d0d]">
        <div className="world-hero-backdrop absolute inset-0" aria-hidden>
          <div className="world-hero-media">
            <WorldSceneImage media={media} priority />
          </div>

          <div className="world-hero-film absolute inset-0" />
          <div className="world-hero-arch-lift absolute inset-0" />
          <div className="world-hero-gradient absolute inset-0" />
          <div className="world-hero-warm absolute inset-0" />
          <div className="world-hero-vignette absolute inset-0" />
          <div className="world-hero-continuity absolute inset-0" />
          <div className="world-scene-handoff world-scene-handoff--bottom" aria-hidden />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between px-5 py-8">
          <p className="world-hero-brand">ASCEND THEORY</p>
          <div className="world-hero-headline pb-12">
            <h1 className="world-hero-display">
              Built For People Who
              <br />
              Want More
            </h1>
            <p className="world-hero-subline mt-5 max-w-[clamp(18rem,90vw,24rem)] text-balance">
              Discipline. Focus. Systems. Growth.
            </p>
            <div className="world-hero-cta">
              <WorldButton variant="outline" onClick={() => openAssessment()}>
                {WORLD_CTA.enterTheSystem}
              </WorldButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
