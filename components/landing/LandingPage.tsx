"use client";

import { FinalCTASection } from "./FinalCTASection";
import { HeroSection } from "./HeroSection";
import { MidAscentGate } from "./MidAscentGate";
import { PricingSection } from "./PricingSection";
import { StoryJourney } from "./StoryJourney";

export function LandingPage() {
  return (
    <div className="world-canvas world-atmosphere world-continuum">
      <HeroSection />
      <StoryJourney />
      <MidAscentGate />
      <PricingSection />
      <FinalCTASection />
    </div>
  );
}
