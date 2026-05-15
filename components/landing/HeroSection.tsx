"use client";

import { SceneContent } from "@/components/landing/world/SceneContent";
import { StickyScene } from "@/components/landing/world/StickyScene";
import { HERO_SCENES } from "@/lib/figma-world-content";

export function HeroSection() {
  const scene = HERO_SCENES.hero;

  return (
    <StickyScene
      id="hero"
      image={scene.image}
      imageAlt={scene.imageAlt}
      imageClass={scene.imageClass}
      imagePosition="center 38%"
      priority
      contentClassName="flex flex-col justify-between px-5 py-7 sm:py-8"
    >
      <p className="world-brand-mark world-hero-in relative z-10">ASCEND THEORY</p>

      <SceneContent layout="bottom" innerClassName="pb-2 sm:pb-4">
        <h1 className="world-display world-display--hero world-hero-in world-hero-in--delay">
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
