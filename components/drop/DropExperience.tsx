"use client";

import type { Drop } from "@/lib/data/drops";
import { DropClosingCta } from "./DropClosingCta";
import { DropDetails } from "./DropDetails";
import { DropHero } from "./DropHero";
import { BrandNav } from "@/components/brand/BrandNav";
import { DropProductProvider } from "./DropProductContext";
import { DropScarcity } from "./DropScarcity";
import { DropStickyBar } from "./DropStickyBar";
import { DropStory } from "./DropStory";
import { DropVisuals } from "./DropVisuals";

export function DropExperience({ product }: { product: Drop }) {
  return (
    <DropProductProvider product={product}>
      <div className="drop-canvas min-h-screen overflow-x-clip pb-24 antialiased">
        <BrandNav />
        <DropHero />
        <DropStory />
        <DropVisuals />
        <DropDetails />
        <DropScarcity />
        <DropClosingCta />
        <DropStickyBar />
      </div>
    </DropProductProvider>
  );
}
