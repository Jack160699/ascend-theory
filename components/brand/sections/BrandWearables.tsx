import { WEARABLES } from "@/lib/brand/content";
import { BRAND_SECTION_IDS } from "@/lib/brand/sections";
import { BRAND_IMAGES } from "@/lib/brand/images";
import Image from "next/image";

const imageMap = {
  lifestyleGolf: BRAND_IMAGES.apparel,
  lifestyleAirport: BRAND_IMAGES.eyewear,
  lifestyleCoastal: BRAND_IMAGES.accessories,
} as const;

export function BrandWearables() {
  return (
    <section
      id={BRAND_SECTION_IDS.wearables}
      data-brand-section
      className="brand-section brand-section--compact"
      aria-labelledby="brand-wearables-heading"
    >
      <div className="brand-shell relative z-10">
        <div data-brand-reveal className="max-w-2xl">
          <p className="brand-eyebrow">{WEARABLES.eyebrow}</p>
          <h2 id="brand-wearables-heading" className="brand-headline mt-6">
            {WEARABLES.headline}
          </h2>
        </div>

        <ul className="mt-16 space-y-6 lg:mt-20 lg:space-y-0 lg:divide-y lg:divide-white/[0.07]">
          {WEARABLES.categories.map((cat, i) => (
            <li
              key={cat.id}
              data-brand-reveal
              data-brand-reveal-delay={String(i)}
              className="brand-editorial-card lg:grid lg:grid-cols-[1.15fr_1fr] lg:gap-0 lg:rounded-none lg:border-0 lg:bg-transparent lg:transition-none lg:hover:transform-none"
            >
              <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/11] lg:aspect-auto lg:min-h-[22rem]">
                <Image
                  src={imageMap[cat.imageKey]}
                  alt={cat.title}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width:1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-black/50" />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:border-l lg:border-white/[0.07] lg:pl-10">
                <p className="brand-eyebrow">{cat.title}</p>
                <p className="brand-body mt-4 max-w-sm">{cat.line}</p>
                <p className="brand-prose-tight mt-8 uppercase tracking-[0.2em]">
                  View collection
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
