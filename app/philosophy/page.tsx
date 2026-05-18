import { PhilosophyPage } from "@/components/pages/PhilosophyPage";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Philosophy | Ascend Theory",
  description:
    "Most people want to change. They never do. Apply for Ascend — limited intake, selection based.",
};

export default function PhilosophyRoute() {
  return (
    <AssessmentModalProvider>
      <PhilosophyPage />
    </AssessmentModalProvider>
  );
}
