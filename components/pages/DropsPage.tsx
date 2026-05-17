"use client";

import { PageExploreLinks } from "@/components/brand/PageExploreLinks";
import { BrandSiteLayout } from "@/components/brand/layout/BrandSiteLayout";
import { DROPS } from "@/lib/data/drops";
import { BRAND_ROUTES } from "@/lib/brand/routes";
import Image from "next/image";
import Link from "next/link";

export function DropsPage() {
  return (
    <BrandSiteLayout className="page-drops">
      <div className="brand-shell drops-page">
        <header className="drops-page__header">
          <p className="brand-eyebrow">Drops</p>
          <h1 className="brand-display mt-6 max-w-[16ch]">
            Limited releases. No restock.
          </h1>
          <p className="brand-body mt-6 max-w-lg">
            Each drop is intentional — a single run, then closed. Select a release
            to enter.
          </p>
        </header>

        <ul className="drops-grid">
          {DROPS.map((drop) => (
            <li key={drop.slug}>
              <Link href={BRAND_ROUTES.drop(drop.slug)} className="drops-card group">
                <div className="drops-card__media">
                  <Image
                    src={drop.image}
                    alt={drop.imageAlt}
                    fill
                    className="object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="drops-card__shade" />
                </div>
                <div className="drops-card__copy">
                  <p className="brand-eyebrow">{drop.dropName}</p>
                  <h2 className="drops-card__title">{drop.productName}</h2>
                  <p className="brand-body mt-3 line-clamp-2">{drop.description}</p>
                  <p className="drops-card__price mt-4">{drop.price.display}</p>
                  <span className="drops-card__cta">Enter drop →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <PageExploreLinks excludeHref={BRAND_ROUTES.drops} />
      </div>
    </BrandSiteLayout>
  );
}
