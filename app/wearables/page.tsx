import { WearablesPage } from "@/components/pages/WearablesPage";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wearables | Ascend Theory",
  description: "Objects for the focused life — apparel, eyewear, and accessories.",
};

export default function WearablesRoute() {
  return (
    <AssessmentModalProvider>
      <WearablesPage />
    </AssessmentModalProvider>
  );
}
