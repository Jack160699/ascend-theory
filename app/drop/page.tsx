import { CommerceShell } from "@/components/cart/CommerceShell";
import { DropExperience } from "@/components/drop";
import { DROP_PRODUCT } from "@/lib/brand/drop-product";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${DROP_PRODUCT.productName} — ${DROP_PRODUCT.dropName} | Ascend Theory`,
  description: `${DROP_PRODUCT.tagline} Limited release. No restock.`,
};

export default function DropPage() {
  return (
    <CommerceShell>
      <main
        id="ascend-drop-main"
        className="min-h-screen overflow-x-clip bg-[#0a0a0a] text-white"
      >
        <DropExperience />
      </main>
    </CommerceShell>
  );
}
