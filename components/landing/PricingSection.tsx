"use client";

import { WorldButton } from "@/components/landing/world/WorldButton";
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
        "world-pricing-card",
        featured && "world-pricing-card--featured",
      )}
    >
      {featured ? (
        <div className="mb-6">
          <span className="world-recommended">Recommended</span>
        </div>
      ) : null}

      <div className="mb-7 flex flex-col gap-6 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="world-tier-name mb-2">{tier.name}</h3>
          <p className="max-w-xs text-xs font-light leading-relaxed tracking-wide text-white/48">
            {tier.tagline}
          </p>
        </div>
        <div className="shrink-0 sm:text-right">
          <p className="world-tier-price">{tier.price}</p>
          {tier.priceAlt ? (
            <p className="mt-1 text-xs font-light tracking-wider text-white/42">
              {tier.priceAlt}
            </p>
          ) : null}
        </div>
      </div>

      {tier.description ? (
        <div className="mb-7 sm:mb-8">
          <p className="world-body">{tier.description}</p>
        </div>
      ) : null}

      {tier.features.length > 0 ? (
        <div className="mb-8 space-y-3.5 sm:mb-10 sm:space-y-4">
          {tier.features.map((f) => (
            <FeatureRow key={f} text={f} />
          ))}
        </div>
      ) : null}

      <div className={cn("flex flex-col gap-3", tier.secondaryCta && "mb-0")}>
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
        <p className="mt-5 text-[10px] font-light tracking-[0.1em] text-white/35 sm:mt-6">
          {tier.footnote}
        </p>
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
      className="world-section-pricing relative min-h-screen w-full bg-[#0d0d0d]"
      aria-labelledby="pricing-heading"
    >
      <div
        className="world-dot-grid pointer-events-none absolute inset-0 opacity-[0.01]"
        aria-hidden
      />

      <div className="relative z-10 px-5">
        <div className="mb-14 text-center sm:mb-20 md:mb-24">
          <p className="world-eyebrow mb-4 tracking-[0.2em] sm:mb-5">
            Levels of Entry
          </p>
          <h2
            id="pricing-heading"
            className="world-display world-display--pricing mx-auto mb-5 max-w-2xl sm:mb-6"
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
        </div>

        <div className="world-pricing-stack mx-auto flex max-w-2xl flex-col gap-12 sm:gap-16">
          {WORLD_PRICING_TIERS.map((tier) => (
            <PricingTierCard
              key={tier.key}
              tier={tier}
              onApply={(key) => openAssessment(key)}
            />
          ))}
        </div>

        <p className="world-body mx-auto mt-16 max-w-lg text-center text-white/35 sm:mt-24 md:mt-28">
          All tiers require application. We build environments
          <br />
          for men who are serious about transformation.
        </p>
      </div>
    </section>
  );
}
