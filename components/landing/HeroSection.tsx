"use client";

import { SceneContent } from "@/components/landing/world/SceneContent";
import { StickyScene } from "@/components/landing/world/StickyScene";
import { HERO_SCENES } from "@/lib/figma-world-content";

export function HeroSection() {
  const scene = HERO_SCENES.hero;

  return (
    <StickyScene id="hero" scene={scene} priority>
      <p className="world-brand-mark">ASCEND THEORY</p>
      <SceneContent placement="hero-split">
        <h1 className="world-display world-display--hero">
          You know
          <br />
          you&apos;re wasting
          <br />
          your potential.
        </h1>
      </SceneContent>
    </StickyScene>
  );
}
