import { CinematicScrollOrchestrator } from "@/components/cinematic-scroll/CinematicScrollOrchestrator";
import { CursorAmbientLight } from "@/components/CursorAmbientLight";
import { TransformationGate } from "@/components/TransformationGate";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import { CinematicScrollProvider } from "@/contexts/cinematic-scroll";
import { ConversionExperienceProvider } from "@/contexts/conversion-experience";
import { MobileConversionProvider } from "@/contexts/mobile-conversion";
import { Brotherhood } from "@/sections/Brotherhood";
import { FinalDecisionCTA } from "@/sections/FinalDecisionCTA";
import { Hero } from "@/sections/Hero";
import { Philosophy } from "@/sections/Philosophy";
import { Pricing } from "@/sections/Pricing";
import { System } from "@/sections/System";
import { Testimonials } from "@/sections/Testimonials";

export default function Home() {
  return (
    <CinematicScrollProvider>
      <AssessmentModalProvider>
        <ConversionExperienceProvider>
          <MobileConversionProvider>
            <CinematicScrollOrchestrator />
            <TransformationGate />
            <main
              id="ascend-cinematic-main"
              className="ascend-main-depth min-h-screen overflow-x-clip bg-ascend-canvas pb-[max(3.25rem,env(safe-area-inset-bottom)+2.75rem)] text-white antialiased sm:pb-16 lg:pb-20"
            >
            <CursorAmbientLight />
            <Hero />
            <Philosophy />
            <Brotherhood />
            <System />
            <Pricing />
            <Testimonials />
            <FinalDecisionCTA />
            </main>
          </MobileConversionProvider>
        </ConversionExperienceProvider>
      </AssessmentModalProvider>
    </CinematicScrollProvider>
  );
}
