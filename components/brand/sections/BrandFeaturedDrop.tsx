import { FEATURED_DROP } from "@/lib/brand/content";
import { BRAND_SECTION_IDS } from "@/lib/brand/sections";
import { BRAND_IMAGES } from "@/lib/brand/images";
import Image from "next/image";

export function BrandFeaturedDrop() {
  return (
    <section
      id={BRAND_SECTION_IDS.drop}
      data-brand-section
      className="brand-section"
      aria-labelledby="brand-drop-heading"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        data-brand-depth
      >
        <Image
          src={BRAND_IMAGES.drop}
          alt=""
          fill
          className="object-cover object-center opacity-55"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/75" />
        <div className="brand-vignette" />
      </div>

      <div className="brand-shell relative z-10 flex min-h-[100dvh] min-h-[100svh] flex-col justify-center py-24">
        <div data-brand-reveal className="max-w-xl">
          <p className="brand-eyebrow">{FEATURED_DROP.eyebrow}</p>
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.32em] text-white/40">
            {FEATURED_DROP.name}
          </p>
          <h2 id="brand-drop-heading" className="brand-display mt-8">
            {FEATURED_DROP.headline}
          </h2>
          <p className="brand-body mt-8 max-w-md">{FEATURED_DROP.body}</p>
          <p className="brand-prose-tight mt-12 uppercase tracking-[0.22em] text-white/50">
            {FEATURED_DROP.status}
          </p>
        </div>
      </div>
      <div className="brand-rail-bottom" aria-hidden />
    </section>
  );
}
