import { JournalPage } from "@/components/pages/JournalPage";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal | Ascend Theory",
  description: "Notes from the ascent — field notes and editorials.",
};

export default function JournalRoute() {
  return (
    <AssessmentModalProvider>
      <JournalPage />
    </AssessmentModalProvider>
  );
}
