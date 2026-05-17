import { BrandExperience } from "@/components/brand";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";

export default function Home() {
  return (
    <AssessmentModalProvider>
      <main
        id="ascend-brand-main"
        className="min-h-screen overflow-x-clip bg-[#0a0a0a] text-white antialiased"
      >
        <BrandExperience />
      </main>
    </AssessmentModalProvider>
  );
}
