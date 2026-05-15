"use client";

/**
 * Loads the Meta Pixel once via `next/script` and sends extra PageViews on App Router navigations only.
 *
 * Duplicate PageView avoidance:
 * - Inline snippet emits the first PageView on full loads.
 * - This effect skips the first pathname it sees (`window.__FB_PIXEL_ROUTE__` unset), then
 *   emits `pageview()` only when pathname changes afterward (SPA).
 *
 * @see lib/fpixel.ts for helper functions & event taxonomy.
 */

import {
  FACEBOOK_PIXEL_SHOULD_LOAD,
  FB_PIXEL_ID,
  facebookPixelSnippet,
  pageview,
} from "@/lib/fpixel";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    __FB_PIXEL_ROUTE__?: string;
  }
}

export function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    if (!FACEBOOK_PIXEL_SHOULD_LOAD) return;

    const key = pathname ?? "/";
    const prev = window.__FB_PIXEL_ROUTE__;

    if (prev === undefined) {
      window.__FB_PIXEL_ROUTE__ = key;
      return;
    }

    if (prev === key) return;

    window.__FB_PIXEL_ROUTE__ = key;
    pageview();
  }, [pathname]);

  if (!FACEBOOK_PIXEL_SHOULD_LOAD) return null;

  return (
    <>
      <Script
        id="facebook-pixel-snippet"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: facebookPixelSnippet(),
        }}
      />
      <noscript>
        {/* Fallback pixel for users without JS — raw URL per Meta */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${encodeURIComponent(FB_PIXEL_ID)}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
