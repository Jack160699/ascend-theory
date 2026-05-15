"use client";

import { FinalCTASection } from "./FinalCTASection";
import { HeroSection } from "./HeroSection";
import { PricingSection } from "./PricingSection";
import { StoryJourney } from "./StoryJourney";

export function LandingPage() {
  return (
    <div className="world-canvas world-atmosphere">
      <HeroSection />
      <StoryJourney />
      <PricingSection />
      <FinalCTASection />
    </div>
  );
}
