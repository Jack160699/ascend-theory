"use client";

import { WorldPanelAtmosphere } from "@/components/landing/world/WorldPanelAtmosphere";
import { WORLD_PRICING_TIERS } from "@/lib/figma-world-content";
import { cn } from "@/lib/utils";

function FeatureRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="world-bullet" aria-hidden />
      <p className="world-body">{text}</p>
    </div>
  );
}

function PricingTierCard({ tier }: { tier: (typeof WORLD_PRICING_TIERS)[number] }) {
  const featured = Boolean(tier.recommended);

  return (
    <article
      className={cn(
        "world-pricing-card world-copy-enter relative",
        featured && "world-pricing-card--featured",
      )}
    >
      {featured ? (
        <div className="absolute -top-3 left-0">
          <span className="world-recommended">Recommended</span>
        </div>
      ) : null}

      <div className="mb-8 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h3 className="world-tier-name mb-2">{tier.name}</h3>
          <p className="world-tier-tagline">{tier.tagline}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="world-tier-price">{tier.price}</p>
          {tier.priceAlt ? (
            <p className="world-tier-price-alt">{tier.priceAlt}</p>
          ) : null}
        </div>
      </div>

      {tier.description ? (
        <div className="mb-8">
          <p className="world-body">{tier.description}</p>
        </div>
      ) : null}

      {tier.features.length > 0 ? (
        <div className="space-y-4">
          {tier.features.map((f) => (
            <FeatureRow key={f} text={f} />
          ))}
        </div>
      ) : null}

      {tier.footnote ? (
        <p className="world-pricing-footnote mt-8">{tier.footnote}</p>
      ) : null}
      <p className="world-pricing-tier-note mt-6">Application required · Tier assigned on review</p>
    </article>
  );
}

export function PricingSection() {
  return (
    <section
      id="pricing"
      data-conversion-zone="pricing"
      className="world-pricing-section world-atmosphere-rail world-continuum-rail relative min-h-[100svh] w-full bg-[#0d0d0d] py-[clamp(4rem,12vh,9rem)]"
      aria-labelledby="pricing-heading"
    >
      <WorldPanelAtmosphere grid="standard" />

      <div className="relative z-10 px-5">
        <header className="world-pricing-intro world-copy-enter mb-[clamp(4rem,10vh,8rem)] text-center">
          <p className="world-eyebrow world-eyebrow--pricing mb-5">Allocation</p>
          <h2
            id="pricing-heading"
            className="world-display world-display--pricing mx-auto mb-6 max-w-[clamp(20rem,90vw,42rem)]"
          >
            Three depths
            <br />
            of commitment.
          </h2>
          <p className="world-body mx-auto max-w-md">
            Not a SKU list — structured entry points
            <br />
            into the same standard.
          </p>
        </header>

        <div className="world-pricing-stack mx-auto max-w-[clamp(20rem,92vw,36rem)]">
          {WORLD_PRICING_TIERS.map((tier) => (
            <PricingTierCard key={tier.key} tier={tier} />
          ))}
        </div>

        <p className="world-pricing-closer world-copy-enter">
          Selection is intentional.
          <br />
          We work with operators, not spectators.
        </p>
      </div>
    </section>
  );
}
