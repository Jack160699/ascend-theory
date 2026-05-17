import { BrandNav } from "@/components/brand/BrandNav";
import { CommerceShell } from "@/components/cart/CommerceShell";
import { CheckoutExperience } from "@/components/cart/CheckoutExperience";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Ascend Theory",
  description: "Complete your limited drop order. Secure checkout with cash on delivery available.",
};

export default function CheckoutPage() {
  return (
    <AssessmentModalProvider>
      <CommerceShell>
        <main className="drop-canvas min-h-screen overflow-x-clip antialiased">
          <BrandNav />
          <CheckoutExperience />
        </main>
      </CommerceShell>
    </AssessmentModalProvider>
  );
}
