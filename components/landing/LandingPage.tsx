"use client";

import { BrotherhoodSection } from "./BrotherhoodSection";
import { FinalCTASection } from "./FinalCTASection";
import { HeroSection } from "./HeroSection";
import { PhilosophySection } from "./PhilosophySection";
import { PricingSection } from "./PricingSection";
import { SystemSection } from "./SystemSection";
import { TransformationSection } from "./TransformationSection";

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <PhilosophySection />
      <SystemSection />
      <BrotherhoodSection />
      <TransformationSection />
      <PricingSection />
      <FinalCTASection />
    </>
  );
}
