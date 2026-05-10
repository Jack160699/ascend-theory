import { AscendFilmGrain } from "@/components/AscendFilmGrain";
import { CursorAmbientLight } from "@/components/CursorAmbientLight";
import { TransformationGate } from "@/components/TransformationGate";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import { ConversionExperienceProvider } from "@/contexts/conversion-experience";
import { MobileConversionProvider } from "@/contexts/mobile-conversion";
import { AllPaths } from "@/sections/AllPaths";
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
    <AssessmentModalProvider>
      <ConversionExperienceProvider>
        <MobileConversionProvider>
          <TransformationGate />
          <main className="ascend-main-depth min-h-screen overflow-x-clip bg-black pb-[max(5.25rem,env(safe-area-inset-bottom)+4rem)] text-white antialiased sm:pb-28 lg:pb-32">
            <AscendFilmGrain />
            <CursorAmbientLight />
            <Hero />
            <Philosophy />
            <Problem />
            <System />
            <Journey />
            <MentorshipDepth />
            <Pricing />
            <Testimonials />
            <AssessmentEntry />
            <FinalDecisionCTA />
            <AllPaths />
          </main>
          <Footer />
        </MobileConversionProvider>
      </ConversionExperienceProvider>
    </AssessmentModalProvider>
  );
}
