"use client";

import { CinematicPortalHero } from "@/components/brand/hero/CinematicPortalHero";
import { BrandSiteLayout } from "@/components/brand/layout/BrandSiteLayout";

export function GatewayHome() {
  return (
    <BrandSiteLayout className="gateway-page gateway-page--portal">
      <CinematicPortalHero />
    </BrandSiteLayout>
  );
}
