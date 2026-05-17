import { JOURNAL } from "@/lib/brand/content";
import { BRAND_SECTION_IDS } from "@/lib/brand/sections";

export function BrandJournal() {
  return (
    <section
      id={BRAND_SECTION_IDS.journal}
      data-brand-section
      className="brand-section brand-section--compact border-t border-white/[0.06]"
      aria-labelledby="brand-journal-heading"
    >
      <div className="brand-shell relative z-10">
        <div
          data-brand-reveal
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
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
          {JOURNAL.entries.map((entry, i) => (
            <li
              key={entry.title}
              data-brand-reveal
              data-brand-reveal-delay={String(i)}
            >
              <article className="group flex flex-col gap-3 py-8 transition-opacity hover:opacity-90 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10 sm:py-10">
                <div>
                  <p className="brand-prose-tight">{entry.date}</p>
                  <h3 className="mt-2 text-lg font-medium tracking-tight text-white/90 sm:text-xl">
                    {entry.title}
                  </h3>
                </div>
                <p className="brand-prose-tight shrink-0 uppercase tracking-[0.18em]">
                  {entry.read}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
