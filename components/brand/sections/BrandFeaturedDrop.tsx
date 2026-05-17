import { brandMotionAttr } from "@/lib/brand/motion";
import { BRAND_SECTION_IDS } from "@/lib/brand/sections";
import { getFeaturedDrop } from "@/lib/data/drops";
import { BRAND_ROUTES } from "@/lib/brand/routes";
import Image from "next/image";
import Link from "next/link";

const featured = getFeaturedDrop();

export function BrandFeaturedDrop() {
  return (
    <section
      id={BRAND_SECTION_IDS.drop}
      {...brandMotionAttr("cinematic")}
      data-brand-section
      className="brand-section"
      aria-labelledby="brand-drop-heading"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        data-brand-depth-active
      >
        <Image
          src={featured.hero.image}
          alt={featured.hero.alt}
          fill
          className="object-cover object-center opacity-55"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/75" />
        <div className="brand-vignette" />
      </div>

      <div className="brand-shell relative z-10 flex min-h-[100dvh] min-h-[100svh] flex-col justify-center py-24">
        <div data-brand-cinematic className="max-w-xl">
          <p className="brand-eyebrow">{featured.dropName}</p>
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.32em] text-white/40">
            {featured.name}
          </p>
          <h2 id="brand-drop-heading" className="brand-display mt-8">
            {featured.tagline}
          </h2>
          <p className="brand-body mt-8 max-w-md">{featured.description}</p>
          <p className="brand-prose-tight mt-12 uppercase tracking-[0.22em] text-white/50">
            {featured.scarcity.labels[0]} · {featured.price.display}
          </p>
          <Link
            href={BRAND_ROUTES.drop(featured.slug)}
            className="brand-wearables-cta mt-10 inline-flex"
          >
            Enter the drop →
          </Link>
        </div>
      </div>
      <div className="brand-rail-bottom" aria-hidden />
    </section>
  );
}
