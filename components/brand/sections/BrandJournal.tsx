import { JOURNAL } from "@/lib/brand/content";
import { brandMotionAttr } from "@/lib/brand/motion";
import { BRAND_SECTION_IDS } from "@/lib/brand/sections";
import { STOCK_IMAGES } from "@/lib/stock-media";
import Image from "next/image";

const journalImages = {
  editorialArchitecture: STOCK_IMAGES.editorialArchitecture,
  teamStudio: STOCK_IMAGES.teamStudio,
  lifestyleAirport: STOCK_IMAGES.lifestyleAirport,
} as const;

export function BrandJournal() {
  return (
    <section
      id={BRAND_SECTION_IDS.journal}
      {...brandMotionAttr("static")}
      data-brand-section
      className="brand-section brand-section--compact border-t border-white/[0.06]"
      aria-labelledby="brand-journal-heading"
    >
      <div className="brand-shell relative z-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="brand-eyebrow">{JOURNAL.eyebrow}</p>
            <h2 id="brand-journal-heading" className="brand-headline mt-6">
              {JOURNAL.headline}
            </h2>
          </div>
          <p className="brand-prose-tight max-w-xs uppercase tracking-[0.2em]">
            Magazine · field notes
          </p>
        </div>

        <ul className="mt-14 divide-y divide-white/[0.07]">
          {JOURNAL.entries.map((entry) => (
            <li key={entry.title}>
              <article className="group flex gap-5 py-8 transition-opacity hover:opacity-90 sm:gap-8 sm:py-10">
                <div className="relative hidden h-20 w-16 shrink-0 overflow-hidden border border-white/[0.07] sm:block sm:h-24 sm:w-20">
                  <Image
                    src={journalImages[entry.imageKey]}
                    alt=""
                    fill
                    className="object-cover object-center"
                    sizes="80px"
                    loading="lazy"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
                  <div>
                    <p className="brand-prose-tight">{entry.date}</p>
                    <h3 className="mt-2 text-lg font-medium tracking-tight text-white/90 sm:text-xl">
                      {entry.title}
                    </h3>
                  </div>
                  <p className="brand-prose-tight shrink-0 uppercase tracking-[0.18em]">
                    {entry.read}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
