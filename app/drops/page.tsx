import { CommerceShell } from "@/components/cart/CommerceShell";
import { DropsPage } from "@/components/pages/DropsPage";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drops | Ascend Theory",
  description: "Limited releases. No restock. Enter each drop.",
};

export default function DropsRoute() {
  return (
    <AssessmentModalProvider>
      <CommerceShell>
        <DropsPage />
      </CommerceShell>
    </AssessmentModalProvider>
  );
}
