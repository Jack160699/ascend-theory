import { BrandNav } from "@/components/brand/BrandNav";
import { OrderConfirmation } from "@/components/cart/OrderConfirmation";
import { AssessmentModalProvider } from "@/contexts/assessment-modal";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Order Confirmed | Ascend Theory",
  description: "Your Ascend Theory order has been received.",
};

export default function OrderConfirmationPage() {
  return (
    <AssessmentModalProvider>
      <main className="drop-canvas drop-canvas--focused min-h-screen overflow-x-clip antialiased">
        <BrandNav />
        <Suspense
          fallback={
            <div className="drop-shell py-32">
              <p className="brand-body text-white/50">Loading…</p>
            </div>
          }
        >
          <OrderConfirmation />
        </Suspense>
      </main>
    </AssessmentModalProvider>
  );
}
