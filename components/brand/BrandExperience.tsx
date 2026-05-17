"use client";

import { BrandNav } from "@/components/brand/BrandNav";
import { BrandOrchestrator } from "@/components/brand/BrandOrchestrator";
import { BrandFeaturedDrop } from "@/components/brand/sections/BrandFeaturedDrop";
import { BrandHero } from "@/components/brand/sections/BrandHero";
import { BrandJournal } from "@/components/brand/sections/BrandJournal";
import { BrandMentorship } from "@/components/brand/sections/BrandMentorship";
import { BrandPhilosophy } from "@/components/brand/sections/BrandPhilosophy";
import { BrandWearables } from "@/components/brand/sections/BrandWearables";
import { CinematicScrollProvider } from "@/contexts/cinematic-scroll";

export function BrandExperience() {
  return (
    <CinematicScrollProvider>
      <BrandOrchestrator />
      <BrandNav />
      <div id="ascend-brand-canvas" className="brand-canvas brand-motion-pending">
        <BrandHero />
        <BrandPhilosophy />
        <BrandWearables />
        <BrandFeaturedDrop />
        <BrandJournal />
        <BrandMentorship />
      </div>
    </CinematicScrollProvider>
  );
}
