"use client";

import { useAssessmentModal } from "@/contexts/assessment-modal";
import { MENTORSHIP } from "@/lib/brand/content";
import { brandMotionAttr } from "@/lib/brand/motion";
import { BRAND_SECTION_IDS } from "@/lib/brand/sections";
import { BRAND_IMAGES } from "@/lib/brand/images";
import { HERO_CTA_LABEL } from "@/lib/whatsapp";
import Image from "next/image";

export function BrandMentorship() {
  const { openAssessment } = useAssessmentModal();

  return (
    <section
      id={BRAND_SECTION_IDS.mentorship}
      {...brandMotionAttr("fade")}
      data-brand-section
      className="brand-section brand-section--compact"
      aria-labelledby="brand-mentorship-heading"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <Image
          src={BRAND_IMAGES.mentorship}
          alt=""
          fill
          className="object-cover object-center opacity-45"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/92 to-[#0a0a0a]/70" />
      </div>

      <div
        data-brand-fade
        className="brand-shell relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16"
      >
        <div>
          <p className="brand-eyebrow">{MENTORSHIP.eyebrow}</p>
          <h2 id="brand-mentorship-heading" className="brand-headline mt-6">
            {MENTORSHIP.headline}
          </h2>
          <p className="brand-body mt-8 max-w-lg">{MENTORSHIP.body}</p>
          <p className="brand-prose-tight mt-6 uppercase tracking-[0.2em]">
            {MENTORSHIP.note}
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => openAssessment()}
            className="inline-flex min-h-12 w-full max-w-sm items-center justify-center border border-white/[0.14] bg-white/[0.04] px-8 text-sm font-medium tracking-wide text-white/90 transition-[opacity,border-color] duration-500 hover:border-white/[0.22] hover:opacity-95 sm:w-auto"
          >
            {HERO_CTA_LABEL}
          </button>
        </div>
      </div>
    </section>
  );
}
