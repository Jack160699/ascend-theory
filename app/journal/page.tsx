import { JournalPage } from "@/components/pages/JournalPage";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal | Ascend Theory",
  description:
    "A luxury interactive publication — issue-based editorials with cinematic pacing.",
};

export default function JournalRoute() {
  return (
    <AssessmentModalProvider>
      <JournalPage />
    </AssessmentModalProvider>
  );
}
