"use client";

import { WorldButton } from "@/components/landing/world/WorldButton";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import { WORLD_PRICING_TIERS } from "@/lib/figma-world-content";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

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
  const borderClass =
    tier.key === "pro"
      ? "border-white/15"
      : tier.key === "black"
        ? "border-white/12"
        : "border-white/10";

  return (
    <motion.article
      className={cn("relative border-t pt-10", borderClass)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: tier.key === "pro" ? 0.15 : tier.key === "black" ? 0.3 : 0 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      {tier.recommended ? (
        <div className="absolute -top-3 left-0">
          <span className="world-recommended">Recommended</span>
        </div>
      ) : null}

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h3 className="world-tier-name mb-2">{tier.name}</h3>
          <p className="max-w-xs text-xs font-light leading-relaxed tracking-wide text-white/45">
            {tier.tagline}
          </p>
        </div>
        <div className="text-right">
          <p className="world-tier-price">{tier.price}</p>
          {tier.priceAlt ? (
            <p className="mt-1 text-xs font-light tracking-wider text-white/40">
              {tier.priceAlt}
            </p>
          ) : null}
        </div>
      </div>

      {tier.description ? (
        <div className="mb-8 space-y-3">
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
        <p className="mt-6 text-[10px] font-light tracking-[0.1em] text-white/35">
          {tier.footnote}
        </p>
      ) : null}
    </motion.article>
  );
}

export function PricingSection() {
  const { openAssessment } = useAssessmentModal();
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="pricing"
      data-conversion-zone="pricing"
      className="relative min-h-screen w-full bg-[#0d0d0d] py-32"
      aria-labelledby="pricing-heading"
    >
      <div
        className="world-dot-grid pointer-events-none absolute inset-0 opacity-[0.012]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          background:
            "radial-gradient(ellipse 50% 35% at 50% 40%, rgba(255, 215, 170, 0.15) 0%, transparent 75%)",
        }}
        aria-hidden
      />

      <motion.div
        className="relative z-10 px-5"
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="mb-24 text-center">
          <p className="world-eyebrow mb-5 tracking-[0.2em]">Levels of Entry</p>
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
        </div>

        <div className="mx-auto max-w-2xl space-y-16">
          {WORLD_PRICING_TIERS.map((tier) => (
            <PricingTierCard
              key={tier.key}
              tier={tier}
              onApply={(key) => openAssessment(key)}
            />
          ))}
        </div>

        <p className="world-body mx-auto mt-32 max-w-lg text-center text-white/35">
          All tiers require application. We build environments
          <br />
          for men who are serious about transformation.
        </p>
      </motion.div>
    </section>
  );
}
