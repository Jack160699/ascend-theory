import { PhilosophyPage } from "@/components/pages/PhilosophyPage";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Philosophy | Ascend Theory",
  description: "A standard you carry before you wear it.",
};

export default function PhilosophyRoute() {
  return (
    <AssessmentModalProvider>
      <PhilosophyPage />
    </AssessmentModalProvider>
  );
}
