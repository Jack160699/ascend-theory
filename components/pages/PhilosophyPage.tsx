"use client";

import { BrandSiteLayout } from "@/components/brand/layout/BrandSiteLayout";
import { PHILOSOPHY } from "@/lib/brand/content";

export function PhilosophyPage() {
  return (
    <BrandSiteLayout className="page-philosophy page-philosophy--calm">
      <article className="philosophy-page">
        <div className="brand-shell philosophy-page__intro">
          <p className="brand-eyebrow">{PHILOSOPHY.eyebrow}</p>
          <h1 className="philosophy-page__title mt-8">{PHILOSOPHY.headline}</h1>
        </div>

        <div className="brand-shell philosophy-page__body">
          {PHILOSOPHY.body.map((line) => (
            <p key={line} className="philosophy-page__line brand-voice">
              {line}
            </p>
          ))}
        </div>

        <div className="brand-shell philosophy-page__pillars">
          <ul>
            {PHILOSOPHY.pillars.map((pillar, index) => (
              <li key={pillar.title} className="philosophy-pillar">
                <span className="philosophy-pillar__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="philosophy-pillar__title">{pillar.title}</h2>
                  <p className="philosophy-pillar__line">{pillar.line}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </BrandSiteLayout>
  );
}
