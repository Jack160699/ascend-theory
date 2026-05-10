import { TransformationConcierge } from "@/components/TransformationConcierge";
import { TransformationGate } from "@/components/TransformationGate";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import { ConversionExperienceProvider } from "@/contexts/conversion-experience";
import { AssessmentEntry } from "@/sections/AssessmentEntry";
import { FinalDecisionCTA } from "@/sections/FinalDecisionCTA";
import { Footer } from "@/sections/Footer";
import { Hero } from "@/sections/Hero";
import { Journey } from "@/sections/Journey";
import { MentorshipDepth } from "@/sections/MentorshipDepth";
import { Philosophy } from "@/sections/Philosophy";
import { Problem } from "@/sections/Problem";
import { Pricing } from "@/sections/Pricing";
import { System } from "@/sections/System";
import { Testimonials } from "@/sections/Testimonials";

export default function Home() {
  return (
    <ConversionExperienceProvider>
      <AssessmentModalProvider>
        <TransformationGate />
        <main className="min-h-screen overflow-x-clip bg-black pb-40 text-white antialiased sm:pb-36">
          <Hero />
          <Philosophy />
          <Problem />
          <System />
          <Journey />
          <Pricing />
          <MentorshipDepth />
          <AssessmentEntry />
          <FinalDecisionCTA />
          <Testimonials />
        </main>
        <Footer />
        <TransformationConcierge />
      </AssessmentModalProvider>
    </ConversionExperienceProvider>
  );
}
