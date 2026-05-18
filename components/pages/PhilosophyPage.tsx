"use client";

import { BrandSiteLayout } from "@/components/brand/layout/BrandSiteLayout";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import { PHILOSOPHY_PAGE } from "@/lib/brand/content";
import { cn } from "@/lib/utils";

export function PhilosophyPage() {
  const { openAssessment } = useAssessmentModal();
  const copy = PHILOSOPHY_PAGE;

  return (
    <BrandSiteLayout className="page-philosophy">
      <article className="philosophy-page">
        <header className="brand-shell philosophy-page__hook">
          <p className="brand-eyebrow">{copy.eyebrow}</p>
          <h1 className="philosophy-page__hook-title mt-8">
            {copy.hook.map((line) => (
              <span key={line} className="philosophy-page__hook-line">
                {line}
              </span>
            ))}
          </h1>
        </header>

        <section
          className="brand-shell philosophy-page__tension"
          aria-label="Tension"
        >
          {copy.tension.map((line, index) => (
            <p
              key={line}
              className={cn(
                "philosophy-page__tension-line",
                index === copy.tension.length - 1 && "philosophy-page__tension-line--emphasis",
              )}
            >
              {line}
            </p>
          ))}
        </section>

        <section
          className="brand-shell philosophy-page__authority"
          aria-label="Authority"
        >
          <p className="philosophy-page__authority-lead">{copy.authority.lead}</p>
          <p className="philosophy-page__authority-line">{copy.authority.line}</p>
        </section>

        <section
          className="brand-shell philosophy-page__system"
          aria-labelledby="philosophy-system-heading"
        >
          <p id="philosophy-system-heading" className="brand-eyebrow">
            {copy.system.eyebrow}
          </p>
          <ol className="philosophy-page__pillars">
            {copy.system.pillars.map((pillar) => (
              <li key={pillar.index} className="philosophy-pillar">
                <span className="philosophy-pillar__index">{pillar.index}</span>
                <div>
                  <h2 className="philosophy-pillar__title">{pillar.title}</h2>
                  <p className="philosophy-pillar__line">{pillar.line}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="brand-shell philosophy-page__filter"
          aria-label="Filter"
        >
          {copy.filter.map((line) => (
            <p key={line} className="philosophy-page__filter-line">
              {line}
            </p>
          ))}
        </section>

        <section
          className="brand-shell philosophy-page__convert"
          aria-label="Apply"
        >
          <button
            type="button"
            onClick={() => openAssessment()}
            className="philosophy-page__cta drop-cta"
          >
            {copy.cta.label}
          </button>
          <p className="philosophy-page__cta-sub">{copy.cta.subtext}</p>
          <p className="philosophy-page__support">{copy.support}</p>
        </section>
      </article>
    </BrandSiteLayout>
  );
}
