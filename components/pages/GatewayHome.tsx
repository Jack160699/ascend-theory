"use client";

import { CinematicPortalHero } from "@/components/brand/hero/CinematicPortalHero";
import { BrandSiteLayout } from "@/components/brand/layout/BrandSiteLayout";
import { usePortalScrollLock } from "@/lib/hooks/use-portal-scroll-lock";

export function GatewayHome() {
  usePortalScrollLock();

  return (
    <BrandSiteLayout
      className="gateway-page gateway-page--portal h-full overflow-hidden"
      canvasClassName="min-h-0 h-full overflow-hidden"
    >
      <CinematicPortalHero />
    </BrandSiteLayout>
  );
}
