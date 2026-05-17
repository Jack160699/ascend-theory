"use client";

import { HeroCinematicBackground } from "@/components/brand/hero/HeroCinematicBackground";
import { BrandSiteLayout } from "@/components/brand/layout/BrandSiteLayout";
import { HERO_LINES } from "@/lib/brand/content";
import { PORTAL_LINKS } from "@/lib/brand/routes";
import Link from "next/link";

export function GatewayHome() {
  return (
    <BrandSiteLayout orchestrate className="gateway-page gateway-page--portal">
      <section className="portal-screen" aria-label="Ascend Theory entry">
        <HeroCinematicBackground />

        <div className="portal-screen__content brand-shell">
          <div className="portal-screen__intro">
            <h1 className="portal-screen__title">
              <span className="hero-line block">{HERO_LINES[0]}</span>
              <span className="hero-line block portal-screen__title-line">
                {HERO_LINES[1]}
              </span>
            </h1>
          </div>

          <nav className="portal-nav" aria-label="Enter the brand">
            <ul className="portal-nav__list">
              {PORTAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="portal-nav__link group">
                    <span className="portal-nav__label">{link.label}</span>
                    <span className="portal-nav__arrow" aria-hidden>
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </BrandSiteLayout>
  );
}
