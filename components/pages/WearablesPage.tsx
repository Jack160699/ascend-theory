"use client";

import { BrandSiteLayout } from "@/components/brand/layout/BrandSiteLayout";
import { BrandWearables } from "@/components/brand/sections/BrandWearables";
import { WEARABLES } from "@/lib/brand/content";
import { STOCK_IMAGES } from "@/lib/stock-media";
import Image from "next/image";

export function WearablesPage() {
  return (
    <BrandSiteLayout className="page-wearables">
      <header className="wearables-page-hero">
        <div className="wearables-page-hero__media" aria-hidden>
          <Image
            src={STOCK_IMAGES.lifestyleAirport}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="wearables-page-hero__overlay" />
        </div>
        <div className="brand-shell wearables-page-hero__copy">
          <p className="brand-eyebrow">{WEARABLES.eyebrow}</p>
          <h1 className="brand-display mt-6 max-w-[14ch]">{WEARABLES.headline}</h1>
          <p className="brand-body mt-6 max-w-lg">
            Three collections. One visual language. Hover to feel the edit.
          </p>
        </div>
      </header>
      <BrandWearables />
    </BrandSiteLayout>
  );
}
