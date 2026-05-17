"use client";

import { BrandSiteLayout } from "@/components/brand/layout/BrandSiteLayout";
import { JOURNAL_ARTICLES, JOURNAL_INDEX } from "@/lib/data/journal";
import { BRAND_ROUTES } from "@/lib/brand/routes";
import Image from "next/image";
import Link from "next/link";

export function JournalPage() {
  const [featured, ...rest] = JOURNAL_ARTICLES;

  return (
    <BrandSiteLayout className="page-journal">
      <div className="brand-shell journal-page">
        <header className="journal-page__header">
          <p className="brand-eyebrow">{JOURNAL_INDEX.eyebrow}</p>
          <h1 className="journal-page__title">{JOURNAL_INDEX.headline}</h1>
          <p className="brand-prose-tight mt-4 uppercase tracking-[0.2em]">
            Magazine · field notes
          </p>
        </header>

        {featured ? (
          <Link
            href={BRAND_ROUTES.journalArticle(featured.slug)}
            className="journal-featured group block"
          >
            <div className="journal-featured__media">
              <Image
                src={featured.image}
                alt={featured.imageAlt}
                fill
                priority
                className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 900px) 100vw, 900px"
              />
            </div>
            <div className="journal-featured__copy">
              <p className="brand-eyebrow">{featured.date}</p>
              <h2 className="journal-featured__headline">{featured.title}</h2>
              <p className="brand-body mt-4 max-w-lg">{featured.excerpt}</p>
              <p className="brand-prose-tight mt-6 uppercase tracking-[0.18em]">
                {featured.readTime} read →
              </p>
            </div>
          </Link>
        ) : null}

        <ul className="journal-list">
          {rest.map((article) => (
            <li key={article.slug}>
              <Link
                href={BRAND_ROUTES.journalArticle(article.slug)}
                className="journal-list__item group"
              >
                <div className="journal-list__thumb">
                  <Image
                    src={article.image}
                    alt={article.imageAlt}
                    fill
                    className="object-cover"
                    sizes="120px"
                    loading="lazy"
                  />
                </div>
                <div className="journal-list__meta">
                  <p className="brand-prose-tight">{article.date}</p>
                  <h3 className="journal-list__title group-hover:text-white">
                    {article.title}
                  </h3>
                </div>
                <p className="journal-list__read">{article.readTime}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </BrandSiteLayout>
  );
}
