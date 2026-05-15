"use client";

import { WorldButton } from "@/components/landing/world/WorldButton";
import { WorldPanelAtmosphere } from "@/components/landing/world/WorldPanelAtmosphere";
import { useAssessmentModal } from "@/contexts/assessment-modal";
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

function PricingTierCard({
  tier,
  onApply,
}: {
  tier: (typeof WORLD_PRICING_TIERS)[number];
  onApply: (key: (typeof WORLD_PRICING_TIERS)[number]["key"]) => void;
}) {
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
        <div className="mb-10 space-y-4">
          {tier.features.map((f) => (
            <FeatureRow key={f} text={f} />
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <WorldButton
          variant={tier.ctaVariant === "solid" ? "solid" : "outline"}
          className={tier.ctaVariant === "solid" ? "w-full sm:w-auto" : undefined}
          onClick={() => onApply(tier.key)}
        >
          {tier.cta}
        </WorldButton>
        {tier.secondaryCta ? (
          <WorldButton variant="outline" onClick={() => onApply(tier.key)}>
            {tier.secondaryCta}
          </WorldButton>
        ) : null}
      </div>

      {tier.footnote ? (
        <p className="world-pricing-footnote">{tier.footnote}</p>
      ) : null}
    </article>
  );
}

export function PricingSection() {
  const { openAssessment } = useAssessmentModal();

  return (
    <section
      id="pricing"
      data-conversion-zone="pricing"
      className="world-pricing-section world-atmosphere-rail relative min-h-screen w-full bg-[#0d0d0d] py-32"
      aria-labelledby="pricing-heading"
    >
      <WorldPanelAtmosphere grid="standard" />

      <div className="relative z-10 px-5">
        <header className="world-pricing-intro world-copy-enter mb-24 text-center">
          <p className="world-eyebrow world-eyebrow--pricing mb-5">Levels of Entry</p>
          <h2
            id="pricing-heading"
            className="world-display world-display--pricing mx-auto mb-6 max-w-2xl"
          >
            Choose your
            <br />
            environment.
          </h2>
          <p className="world-body mx-auto max-w-md">
            This is not a product. This is entry into
            <br />
            a structured transformation system.
          </p>
        </header>

        <div className="world-pricing-stack mx-auto max-w-2xl">
          {WORLD_PRICING_TIERS.map((tier) => (
            <PricingTierCard
              key={tier.key}
              tier={tier}
              onApply={(key) => openAssessment(key)}
            />
          ))}
        </div>

        <p className="world-pricing-closer world-copy-enter">
          All tiers require application. We build environments
          <br />
          for men who are serious about transformation.
        </p>
      </div>
    </section>
  );
}
