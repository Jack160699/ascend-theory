import { WEARABLES } from "@/lib/brand/content";
import { brandMotionAttr } from "@/lib/brand/motion";
import { BRAND_SECTION_IDS } from "@/lib/brand/sections";
import { BRAND_IMAGES } from "@/lib/brand/images";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const imageMap = {
  lifestyleGolf: BRAND_IMAGES.apparel,
  lifestyleAirport: BRAND_IMAGES.eyewear,
  lifestyleCoastal: BRAND_IMAGES.accessories,
} as const;

type Category = (typeof WEARABLES.categories)[number];

function WearableEditorialRow({
  category,
  reverse,
}: {
  category: Category;
  reverse: boolean;
}) {
  const src = imageMap[category.imageKey];

  return (
    <li
      className={cn(
        "brand-wearables-row group",
        reverse && "brand-wearables-row--reverse",
      )}
    >
      <article className="brand-wearables-row__inner">
        <div className="brand-wearables-row__media">
          <Image
            src={src}
            alt={category.title}
            fill
            className="brand-wearables-row__image object-cover object-center"
            sizes="(max-width: 1023px) 100vw, 48vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-black/45 lg:via-transparent lg:to-transparent"
            aria-hidden
          />
        </div>

        <div className="brand-wearables-row__copy">
          <p className="brand-eyebrow text-white/50">Collection</p>
          <h3 className="brand-headline mt-5 max-w-[12ch]">{category.title}</h3>
          <p className="brand-body mt-6 max-w-md text-pretty">{category.line}</p>
          <Link href={`#${category.id}`} className="brand-wearables-cta">
            {category.cta}
          </Link>
        </div>
      </article>
    </li>
  );
}

export function BrandWearables() {
  return (
    <section
      id={BRAND_SECTION_IDS.wearables}
      {...brandMotionAttr("wearables")}
      data-brand-section
      className="brand-section brand-section--compact brand-wearables-section"
      aria-labelledby="brand-wearables-heading"
    >
      <div className="brand-shell relative z-10">
        <header className="brand-wearables-header max-w-2xl border-b border-white/[0.07] pb-10 sm:pb-12">
          <p className="brand-eyebrow">{WEARABLES.eyebrow}</p>
          <h2 id="brand-wearables-heading" className="brand-headline mt-6">
            {WEARABLES.headline}
          </h2>
        </header>

        <ul className="brand-wearables-list mt-14 sm:mt-20 lg:mt-24">
          {WEARABLES.categories.map((cat, i) => (
            <WearableEditorialRow
              key={cat.id}
              category={cat}
              reverse={i % 2 === 1}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
