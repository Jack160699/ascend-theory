import { brandMotionAttr } from "@/lib/brand/motion";
import { BRAND_SECTION_IDS } from "@/lib/brand/sections";
import { JOURNAL_ARTICLES, JOURNAL_INDEX } from "@/lib/data/journal";
import { BRAND_ROUTES } from "@/lib/brand/routes";
import Image from "next/image";
import Link from "next/link";

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
            <p className="brand-eyebrow">{JOURNAL_INDEX.eyebrow}</p>
            <h2 id="brand-journal-heading" className="brand-headline mt-6">
              {JOURNAL_INDEX.headline}
            </h2>
          </div>
          <p className="brand-prose-tight max-w-xs uppercase tracking-[0.2em]">
            Magazine · field notes
          </p>
        </div>

        <ul className="mt-14 divide-y divide-white/[0.07]">
          {JOURNAL_ARTICLES.map((article) => (
            <li key={article.slug}>
              <Link
                href={BRAND_ROUTES.journalArticle(article.slug)}
                className="group flex gap-5 py-8 transition-opacity hover:opacity-90 sm:gap-8 sm:py-10"
              >
                <div className="relative hidden h-20 w-16 shrink-0 overflow-hidden border border-white/[0.07] sm:block sm:h-24 sm:w-20">
                  <Image
                    src={article.image}
                    alt={article.imageAlt}
                    fill
                    className="object-cover object-center"
                    sizes="80px"
                    loading="lazy"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
                  <div>
                    <p className="brand-prose-tight">{article.date}</p>
                    <h3 className="mt-2 text-lg font-medium tracking-tight text-white/90 sm:text-xl">
                      {article.title}
                    </h3>
                  </div>
                  <p className="brand-prose-tight shrink-0 uppercase tracking-[0.18em]">
                    {article.readTime} read →
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
