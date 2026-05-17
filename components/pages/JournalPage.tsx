"use client";

import { BrandSiteLayout } from "@/components/brand/layout/BrandSiteLayout";
import { JOURNAL } from "@/lib/brand/content";
import { STOCK_IMAGES } from "@/lib/stock-media";
import Image from "next/image";

const journalImages = {
  editorialArchitecture: STOCK_IMAGES.editorialArchitecture,
  teamStudio: STOCK_IMAGES.teamStudio,
  lifestyleAirport: STOCK_IMAGES.lifestyleAirport,
} as const;

export function JournalPage() {
  const [featured, ...rest] = JOURNAL.entries;

  return (
    <BrandSiteLayout className="page-journal">
      <div className="brand-shell journal-page">
        <header className="journal-page__header">
          <p className="brand-eyebrow">{JOURNAL.eyebrow}</p>
          <h1 className="journal-page__title">{JOURNAL.headline}</h1>
          <p className="brand-prose-tight mt-4 uppercase tracking-[0.2em]">
            Magazine · field notes
          </p>
        </header>

        {featured ? (
          <article className="journal-featured">
            <div className="journal-featured__media">
              <Image
                src={journalImages[featured.imageKey]}
                alt=""
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 900px) 100vw, 900px"
              />
            </div>
            <div className="journal-featured__copy">
              <p className="brand-eyebrow">{featured.date}</p>
              <h2 className="journal-featured__headline">{featured.title}</h2>
              <p className="brand-prose-tight mt-6 uppercase tracking-[0.18em]">
                {featured.read} read
              </p>
            </div>
          </article>
        ) : null}

        <ul className="journal-list">
          {rest.map((entry) => (
            <li key={entry.title}>
              <article className="journal-list__item">
                <div className="journal-list__thumb">
                  <Image
                    src={journalImages[entry.imageKey]}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="120px"
                    loading="lazy"
                  />
                </div>
                <div className="journal-list__meta">
                  <p className="brand-prose-tight">{entry.date}</p>
                  <h3 className="journal-list__title">{entry.title}</h3>
                </div>
                <p className="journal-list__read">{entry.read}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </BrandSiteLayout>
  );
}
