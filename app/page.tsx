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
            className="min-h-screen overflow-x-clip bg-ascend-canvas pb-[max(3.25rem,env(safe-area-inset-bottom)+2.75rem)] text-white antialiased sm:pb-16 lg:pb-20"
          >
            <LandingPage />
          </main>
        </MobileConversionProvider>
      </ConversionExperienceProvider>
    </AssessmentModalProvider>
  );
}
