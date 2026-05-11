import { AtmosphereLayers, MasterSceneOrchestrator } from "@/components/cinematic-v2";
import { CinematicHomeStory } from "@/components/cinematic-scenes";
import { CursorAmbientLight } from "@/components/CursorAmbientLight";
import { TransformationGate } from "@/components/TransformationGate";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import { CinematicScrollProvider } from "@/contexts/cinematic-scroll";
import { ConversionExperienceProvider } from "@/contexts/conversion-experience";
import { MobileConversionProvider } from "@/contexts/mobile-conversion";

export default function Home() {
  return (
    <CinematicScrollProvider>
      <AssessmentModalProvider>
        <ConversionExperienceProvider>
          <MobileConversionProvider>
            <MasterSceneOrchestrator />
            <TransformationGate />
            <main
              id="ascend-cinematic-main"
              className="ascend-main-depth min-h-screen overflow-x-clip bg-ascend-canvas pb-[max(3.25rem,env(safe-area-inset-bottom)+2.75rem)] text-white antialiased sm:pb-16 lg:pb-20"
            >
            <AtmosphereLayers />
            <CursorAmbientLight />
            <CinematicHomeStory />
            </main>
          </MobileConversionProvider>
        </ConversionExperienceProvider>
      </AssessmentModalProvider>
    </CinematicScrollProvider>
  );
}
