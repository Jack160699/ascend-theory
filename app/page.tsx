import { AscendFilmGrain } from "@/components/AscendFilmGrain";
import { CursorAmbientLight } from "@/components/CursorAmbientLight";
import { TransformationGate } from "@/components/TransformationGate";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import { ConversionExperienceProvider } from "@/contexts/conversion-experience";
import { MobileConversionProvider } from "@/contexts/mobile-conversion";
import { FinalDecisionCTA } from "@/sections/FinalDecisionCTA";
import { Footer } from "@/sections/Footer";
import { Hero } from "@/sections/Hero";
import { Journey } from "@/sections/Journey";
import { OneSystem } from "@/sections/OneSystem";
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
          <main className="ascend-main-depth min-h-screen overflow-x-clip bg-ascend-canvas pb-[max(3.75rem,env(safe-area-inset-bottom)+3.25rem)] text-white antialiased sm:pb-20 lg:pb-24">
            <AscendFilmGrain />
            <CursorAmbientLight />
            <Hero />
            <Philosophy />
            <OneSystem />
            <System />
            <Journey />
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
