"use client";

import { PageExploreLinks } from "@/components/brand/PageExploreLinks";
import { BrandSiteLayout } from "@/components/brand/layout/BrandSiteLayout";
import { BrandWearables } from "@/components/brand/sections/BrandWearables";
import { BRAND_ROUTES } from "@/lib/brand/routes";
import { WEARABLES_INDEX } from "@/lib/data/wearables";
import { STOCK_IMAGES } from "@/lib/stock-media";
import Image from "next/image";
import Link from "next/link";

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
