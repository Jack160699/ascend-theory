"use client";

import { HeroCinematicBackground } from "@/components/brand/hero/HeroCinematicBackground";
import { BRAND, HERO_LINES } from "@/lib/brand/content";
import { brandMotionAttr } from "@/lib/brand/motion";
import { BRAND_SECTION_IDS } from "@/lib/brand/sections";
import Link from "next/link";

export function BrandHero() {
  return (
    <section
      id={BRAND_SECTION_IDS.hero}
      {...brandMotionAttr("hero")}
      data-brand-section
      data-brand-hero
      className="brand-section"
      aria-label="Introduction"
    >
      <HeroCinematicBackground />

      <div className="brand-shell relative z-10 flex min-h-[100dvh] min-h-[100svh] flex-col justify-between pb-12 pt-28 sm:pb-16 sm:pt-32">
        <p className="brand-mark">{BRAND.mark}</p>

        <div className="max-w-4xl">
          <h1 className="brand-display">
            {HERO_LINES.map((line) => (
              <span key={line} className="hero-line block">
                {line}
              </span>
            ))}
          </h1>
          <p data-brand-hero-sub className="brand-body mt-8 max-w-md">
            {BRAND.tagline} A luxury movement for discipline, ambition, and
            modern performance life.
          </p>
        </div>

        <div className="flex items-end justify-between gap-6">
          <Link
            href={`#${BRAND_SECTION_IDS.philosophy}`}
            data-brand-hero-scroll
            className="flex flex-col items-center gap-2"
            aria-label="Scroll to philosophy"
          >
            <span className="brand-prose-tight uppercase tracking-[0.24em]">
              Scroll
            </span>
            <span className="brand-scroll-line" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="brand-rail-bottom" aria-hidden />
    </section>
  );
}
