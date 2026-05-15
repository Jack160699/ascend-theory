import { LandingPage } from "@/components/landing";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import { ConversionExperienceProvider } from "@/contexts/conversion-experience";
import { MobileConversionProvider } from "@/contexts/mobile-conversion";

export default function Home() {
  return (
    <AssessmentModalProvider>
      <ConversionExperienceProvider>
        <MobileConversionProvider>
          <main
            id="ascend-main"
            className="min-h-screen overflow-x-clip bg-[#0d0d0d] text-white antialiased"
          >
            <LandingPage />
          </main>
        </MobileConversionProvider>
      </ConversionExperienceProvider>
    </AssessmentModalProvider>
  );
}
