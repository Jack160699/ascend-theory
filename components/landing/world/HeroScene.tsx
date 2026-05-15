"use client";

import { WorldSceneImage } from "@/components/landing/world/WorldSceneImage";
import { useIsMobileConversion } from "@/contexts/mobile-conversion";
import { WORLD_SCENE_MEDIA } from "@/lib/world-images";
import { FIGMA_SCENE_SCROLL, sceneScrollHeight } from "@/lib/world-scene-metrics";

/**
 * Figma WORLD SYSTEM hero — film-frame stack (no flat full-bleed scrims).
 */
export function HeroScene() {
  const isMobile = useIsMobileConversion();
  const railHeight = sceneScrollHeight(FIGMA_SCENE_SCROLL.hero, isMobile);
  const media = WORLD_SCENE_MEDIA.hero;

  return (
    <section
      id="hero"
      className="world-hero-rail world-atmosphere-rail relative w-full bg-[#0d0d0d]"
      style={{ height: railHeight }}
    >
      <div className="sticky top-0 h-screen min-h-[100svh] w-full overflow-hidden bg-[#0d0d0d]">
        <div className="world-hero-backdrop absolute inset-0" aria-hidden>
          <div className="world-hero-media">
            <WorldSceneImage media={media} priority />
          </div>

          {/* Figma: solid #0d0d0d film base (~75% at rest) */}
          <div className="world-hero-film absolute inset-0" />
          {/* Keeps architectural midtones — not a flat wash */}
          <div className="world-hero-arch-lift absolute inset-0" />
          {/* Figma: br transparent → via 60% → 90% */}
          <div className="world-hero-gradient absolute inset-0" />
          {/* Figma: warm directional glow upper-right */}
          <div className="world-hero-warm absolute inset-0" />
          {/* Subtle edge vignette — film frame */}
          <div className="world-hero-vignette absolute inset-0" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between px-5 py-8">
          <p className="world-hero-brand">ASCEND THEORY</p>
          <div className="world-hero-headline pb-12">
            <h1 className="world-hero-display">
              You know
              <br />
              you&apos;re wasting
              <br />
              your potential.
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
