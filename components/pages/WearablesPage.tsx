"use client";

import { PageExploreLinks } from "@/components/brand/PageExploreLinks";
import { BrandSiteLayout } from "@/components/brand/layout/BrandSiteLayout";
import { BrandWearables } from "@/components/brand/sections/BrandWearables";
import { BRAND_ROUTES } from "@/lib/brand/routes";
import { WEARABLES_INDEX } from "@/lib/data/wearables";
import { AscendImage } from "@/components/AscendImage";
import { ASCEND_PRODUCT_IMAGES } from "@/lib/product-images";
import Link from "next/link";

export function WearablesPage() {
  return (
    <BrandSiteLayout className="page-wearables">
      <header className="wearables-page-hero">
        <div className="wearables-page-hero__media" aria-hidden>
          <AscendImage
            src={ASCEND_PRODUCT_IMAGES.lifestyleAirport}
            alt="Ascend Theory wearables"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="wearables-page-hero__overlay" />
        </div>
        <div className="brand-shell wearables-page-hero__copy">
          <p className="brand-eyebrow">{WEARABLES_INDEX.eyebrow}</p>
          <h1 className="brand-display mt-6 max-w-[14ch]">
            {WEARABLES_INDEX.headline}
          </h1>
          <p className="brand-body mt-6 max-w-lg">{WEARABLES_INDEX.description}</p>
          <Link href={BRAND_ROUTES.drops} className="brand-wearables-cta mt-8 inline-flex">
            View all drops →
          </Link>
        </div>
      </header>
      <BrandWearables />
      <div className="brand-shell pb-16">
        <PageExploreLinks excludeHref={BRAND_ROUTES.wearables} />
      </div>
    </BrandSiteLayout>
  );
}
