import { AscendFilmGrain } from "@/components/AscendFilmGrain";
import { CursorAmbientLight } from "@/components/CursorAmbientLight";
import { TransformationGate } from "@/components/TransformationGate";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import { ConversionExperienceProvider } from "@/contexts/conversion-experience";
import { MobileConversionProvider } from "@/contexts/mobile-conversion";
import { Brotherhood } from "@/sections/Brotherhood";
import { FinalDecisionCTA } from "@/sections/FinalDecisionCTA";
import { Footer } from "@/sections/Footer";
import { Hero } from "@/sections/Hero";
import { Philosophy } from "@/sections/Philosophy";
import { Pricing } from "@/sections/Pricing";
import { System } from "@/sections/System";
import { Testimonials } from "@/sections/Testimonials";

export default function Home() {
  return (
    <AssessmentModalProvider>
      <ConversionExperienceProvider>
        <MobileConversionProvider>
          <TransformationGate />
          <main className="ascend-main-depth min-h-screen overflow-x-clip bg-ascend-canvas pb-[max(3.25rem,env(safe-area-inset-bottom)+2.75rem)] text-white antialiased sm:pb-16 lg:pb-20">
            <AscendFilmGrain />
            <CursorAmbientLight />
            <Hero />
            <Philosophy />
            <Brotherhood />
            <System />
            <Pricing />
            <Testimonials />
            <FinalDecisionCTA />
          </main>
          <Footer />
        </MobileConversionProvider>
      </ConversionExperienceProvider>
    </AssessmentModalProvider>
  );
}
