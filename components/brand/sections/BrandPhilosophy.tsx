import { PHILOSOPHY } from "@/lib/brand/content";
import { brandMotionAttr } from "@/lib/brand/motion";
import { BRAND_SECTION_IDS } from "@/lib/brand/sections";
import { BRAND_IMAGES } from "@/lib/brand/images";
import Image from "next/image";

export function BrandPhilosophy() {
  return (
    <section
      id={BRAND_SECTION_IDS.philosophy}
      {...brandMotionAttr("philosophy")}
      data-brand-section
      className="brand-section brand-section--compact"
      aria-labelledby="brand-philosophy-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      >
        <Image
          src={BRAND_IMAGES.philosophy}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/88" />
      </div>

      <div
        data-brand-fade
        className="brand-shell relative z-10 grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-20"
      >
        <div>
          <p className="brand-eyebrow">{PHILOSOPHY.eyebrow}</p>
          <h2 id="brand-philosophy-heading" className="brand-headline mt-6">
            {PHILOSOPHY.headline}
          </h2>
        </div>
        <div className="space-y-6">
          {PHILOSOPHY.body.map((p) => (
            <p key={p} className="brand-body max-w-lg">
              {p}
            </p>
          ))}
        </div>
        <ul className="lg:col-span-2 lg:grid lg:grid-cols-3 lg:gap-10 lg:border-t lg:border-white/[0.07] lg:pt-12">
          {PHILOSOPHY.pillars.map((pillar) => (
            <li
              key={pillar.title}
              className="border-t border-white/[0.07] py-8 lg:border-t-0 lg:py-0"
            >
              <p className="brand-eyebrow text-white/55">{pillar.title}</p>
              <p className="brand-body mt-3">{pillar.line}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
