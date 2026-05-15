"use client";

import { useAssessmentModal } from "@/contexts/assessment-modal";
import { shellWide } from "@/lib/editorial-layout";
import { PRICING_TIERS } from "@/lib/pricing-tiers";
import { FINAL_SECTION_CTA_LABEL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function PricingSection() {
  const { openAssessment } = useAssessmentModal();

  return (
    <section
      id="pricing"
      data-conversion-zone="pricing"
      className="scroll-mt-24 border-t border-[color:var(--ascend-border)] bg-ascend-surface py-16 sm:py-20 lg:py-24"
      aria-labelledby="pricing-heading"
    >
      <div className={shellWide}>
        <Reveal>
          <p className="ascend-type-eyebrow mb-3 text-zinc-600">Membership</p>
          <h2
            id="pricing-heading"
            className="ascend-type-section-sm ascend-headline max-w-xl"
          >
            Choose the depth that fits this season.
          </h2>
          <p className="ascend-prose-calm mt-4 max-w-lg text-pretty text-zinc-500">
            Same standards. What changes is how close the support sits and how
            private the work can go. Apply privately — we review by hand.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:mt-12 lg:grid-cols-3 lg:gap-6">
          {PRICING_TIERS.map((tier, i) => (
            <Reveal key={tier.key} delay={i * 0.06}>
              <article
                className={cn(
                  "flex h-full flex-col rounded-lg border p-5 sm:rounded-xl sm:p-6",
                  tier.featured
                    ? "border-[color:rgba(95,115,134,0.32)] bg-ascend-elevated"
                    : "border-white/[0.08] bg-ascend-canvas/60",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-zinc-100 sm:text-lg">
                      {tier.name}
                    </h3>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                      {tier.label}
                    </p>
                  </div>
                  {tier.badge ? (
                    <span className="hidden text-right text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-500 sm:block">
                      {tier.badge}
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-[13px] leading-snug text-zinc-400">
                  {tier.purpose}
                </p>

                <p className="mt-4 border-t border-white/[0.06] pt-4 font-mono text-lg font-semibold tracking-tight text-white sm:text-xl">
                  {tier.price}
                </p>
                {tier.priceNote ? (
                  <p className="mt-2 text-[11px] leading-snug text-zinc-600">
                    {tier.priceNote}
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] text-zinc-600">
                    Manual review · GST as applicable.
                  </p>
                )}

                <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="border-l border-white/[0.08] pl-3 text-[12px] leading-relaxed text-zinc-500 sm:text-[13px]"
                    >
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => openAssessment(tier.key)}
                  className={cn(
                    "mt-6 min-h-11 w-full rounded-md border text-[13px] font-medium transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
                    tier.featured
                      ? "border-[color:rgba(95,115,134,0.35)] bg-white/[0.06] text-zinc-100 hover:bg-white/[0.09]"
                      : "border-white/[0.09] bg-white/[0.03] text-zinc-200 hover:bg-white/[0.06]",
                  )}
                >
                  {FINAL_SECTION_CTA_LABEL}
                </button>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
