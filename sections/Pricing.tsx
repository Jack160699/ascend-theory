"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import { useConversionExperienceOptional } from "@/contexts/conversion-experience";
import {
  useIsMobileConversion,
  useRevealViewport,
} from "@/contexts/mobile-conversion";
import {
  DURATION_REVEAL,
  SURFACE_SPRING,
  TAP_SPRING,
  getCardRevealMobile,
  getFadeUpReveal,
  getGridStaggerParent,
  getHeaderStaggerParent,
  txReveal,
} from "@/lib/motion";
import { leadLeft, shellWide } from "@/lib/editorial-layout";
import { FINAL_SECTION_CTA_LABEL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import type { TierKey } from "@/lib/lead-context";
import { motion, type Variants } from "framer-motion";
import { Check } from "lucide-react";
import { useMemo, useRef } from "react";

const tiers: {
  key: TierKey;
  name: string;
  label: string;
  purpose: string;
  priceLead?: string;
  price: string;
  priceNote?: string;
  features: string[];
  badge?: string;
}[] = [
  {
    key: "core",
    name: "Ascend Core",
    label: "Foundation",
    purpose: "Shared lane. Firm structure.",
    price: "₹7,000 + GST / month",
    features: [
      "Standard accountability rhythm",
      "Cohort mentor access",
      "Replies within business hours",
      "Structured private depth",
      "Manual review before entry",
    ],
  },
  {
    key: "pro",
    name: "Ascend Pro",
    label: "Accelerated",
    purpose: "Closer access when decisions cannot wait.",
    price: "₹15,000 + GST / month",
    features: [
      "Higher accountability rhythm",
      "Priority mentor access",
      "Faster reply windows",
      "Deeper private support",
      "Tighter weekly structure",
    ],
    badge: "Primary allocation",
  },
  {
    key: "black",
    name: "Ascend Black",
    label: "Private",
    purpose: "Discretion-first. Invitation after review.",
    price: "₹55,000 + GST / month",
    priceNote:
      "Private · discretion-first · manually reviewed · invitation only",
    features: [
      "Maximum accountability",
      "Closest private mentor access",
      "Fastest replies where possible",
      "Fully bespoke private support",
      "Discretion-first communication",
    ],
    badge: "Invitation only",
  },
];

function PricingCapacityRibbon({
  viewport,
}: {
  viewport: { once: boolean; margin?: string };
}) {
  const conv = useConversionExperienceOptional();
  const msg = conv?.urgencyMessage;
  if (!msg) return null;
  return (
    <motion.div
      className="ascend-surface-soft mt-5 max-w-2xl rounded-full px-4 py-2 text-left sm:mt-8"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={txReveal(DURATION_REVEAL)}
    >
      <p className="text-[10px] font-medium uppercase leading-relaxed tracking-[0.22em] text-zinc-500">
        {msg}
      </p>
    </motion.div>
  );
}

function PricingCard({
  tier,
  cardVariants,
}: {
  tier: (typeof tiers)[number];
  cardVariants: Variants;
}) {
  const { openAssessment } = useAssessmentModal();
  const rootRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobileConversion();
  const conv = useConversionExperienceOptional();
  const slotLine = conv?.urgencyForTier(0) ?? "";
  const { key } = tier;
  const featureList = tier.features.slice(0, 5);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const root = rootRef.current;
    const glow = glowRef.current;
    if (!root || !glow) return;
    const r = root.getBoundingClientRect();
    glow.style.setProperty(
      "--spot-x",
      `${((e.clientX - r.left) / r.width) * 100}%`,
    );
    glow.style.setProperty(
      "--spot-y",
      `${((e.clientY - r.top) / r.height) * 100}%`,
    );
  };

  const onLeave = () => {
    const glow = glowRef.current;
    if (!glow) return;
    glow.style.setProperty("--spot-x", "50%");
    glow.style.setProperty("--spot-y", "50%");
  };

  const glowSpot =
    key === "black"
      ? "radial-gradient(680px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(212,196,168,0.09), transparent 58%)"
      : key === "pro"
        ? "radial-gradient(720px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,0.14), transparent 58%)"
        : "radial-gradient(560px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,0.1), transparent 58%)";

  return (
    <motion.article
      ref={rootRef}
      variants={cardVariants}
      onMouseMove={isMobile ? undefined : onMove}
      onMouseLeave={isMobile ? undefined : onLeave}
      className={cn(
        "group relative flex h-full min-h-0 flex-col [perspective:1600px]",
        key === "pro" &&
          "z-10 shadow-[0_24px_64px_-44px_rgba(255,255,255,0.15)] lg:z-20 lg:shadow-[0_48px_100px_-52px_rgba(0,0,0,0.82)]",
        key === "black" &&
          "ring-1 ring-amber-950/25 lg:opacity-[0.99] lg:shadow-[0_0_100px_-48px_rgba(160,120,70,0.12)]",
      )}
      whileHover={{ y: isMobile ? 0 : key === "pro" ? -3 : key === "black" ? -2.5 : -2 }}
      transition={SURFACE_SPRING}
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[1.25rem] opacity-0 transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.72] max-lg:hidden sm:rounded-[1.35rem]",
          key === "pro" &&
            "bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.2),transparent_62%)] blur-2xl",
          key === "core" &&
            "bg-[radial-gradient(ellipse_at_40%_0%,rgba(255,255,255,0.1),transparent_70%)] blur-2xl",
          key === "black" &&
            "bg-[radial-gradient(ellipse_at_50%_20%,rgba(120,100,80,0.12),transparent_65%)] blur-2xl",
        )}
      />
      <div
        className={cn(
          "relative flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[1.1rem] border shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] transition-[border-color,box-shadow,transform] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] sm:rounded-[1.25rem]",
          "backdrop-blur-md sm:backdrop-blur-xl",
          key === "core" &&
            "border-[color:var(--ascend-border)] bg-ascend-elevated/95 p-3 group-hover:border-[color:rgba(95,115,134,0.22)] group-hover:shadow-[0_16px_48px_-32px_rgba(0,0,0,0.5)] sm:p-5 lg:p-6",
          key === "pro" &&
            "border-[color:rgba(95,115,134,0.35)] bg-ascend-elevated p-3 shadow-[0_20px_56px_-40px_rgba(0,0,0,0.55),0_0_40px_-20px_var(--ascend-accent-glow)] group-hover:border-[color:rgba(95,115,134,0.48)] group-hover:shadow-[0_24px_64px_-40px_rgba(0,0,0,0.58),0_0_52px_-18px_var(--ascend-accent-glow)] sm:p-5 lg:p-7",
          key === "black" &&
            "border-amber-950/22 bg-gradient-to-b from-ascend-elevated via-ascend-surface to-ascend-canvas p-3 group-hover:border-amber-900/38 group-hover:shadow-[0_24px_64px_-44px_rgba(0,0,0,0.58),0_0_48px_-20px_rgba(180,150,100,0.06)] sm:p-5 lg:p-6",
        )}
      >
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.85]"
          style={{ background: glowSpot }}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            key === "black" ? "opacity-[0.12]" : "opacity-[0.09]",
          )}
          style={{
            background:
              key === "black"
                ? "linear-gradient(118deg, transparent 40%, rgba(180,160,120,0.04) 50%, transparent 60%)"
                : key === "pro"
                  ? "linear-gradient(125deg, transparent 40%, rgba(95,115,134,0.06) 50%, transparent 60%)"
                  : "linear-gradient(125deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
          }}
          aria-hidden
        />
        {key === "black" ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04), transparent 55%)",
            }}
          />
        ) : null}

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3
                className={cn(
                  "font-semibold tracking-tight text-[rgb(249,249,247)]",
                  key === "pro" && "text-[13px] sm:text-lg lg:text-xl",
                  key === "core" && "text-[12px] sm:text-base lg:text-lg",
                  key === "black" &&
                    "text-[12px] font-semibold tracking-[0.04em] text-stone-100 sm:text-base lg:text-lg",
                )}
              >
                {tier.name}
              </h3>
              <p
                className={cn(
                  "mt-0.5 text-[9px] font-medium uppercase leading-tight tracking-[0.2em] sm:mt-1 sm:text-[10px] sm:tracking-[0.24em]",
                  key === "black" ? "text-zinc-600" : "text-zinc-500",
                )}
              >
                {tier.label}
              </p>
            </div>
            {tier.badge ? (
              <span
                className={cn(
                  "hidden shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.12em] sm:inline-flex sm:px-2.5 sm:py-0.5 sm:text-[9px] sm:tracking-[0.16em]",
                  key === "pro" &&
                    "border-white/[0.14] bg-white/[0.08] text-zinc-100",
                  key === "black" &&
                    "border-amber-950/30 bg-amber-950/10 text-amber-200/70",
                )}
              >
                {tier.badge}
              </span>
            ) : null}
          </div>

          <p className="mt-1.5 line-clamp-2 text-[10px] leading-snug text-zinc-400 sm:mt-2 sm:text-[12px] sm:leading-relaxed">
            {tier.purpose}
          </p>

          <div className="mt-2.5 border-t border-white/[0.06] pt-2.5 sm:mt-4 sm:pt-4">
            {tier.priceLead ? (
              <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.24em] text-zinc-600 sm:text-[10px]">
                {tier.priceLead}
              </p>
            ) : null}
            <p
              className={cn(
                "font-mono font-semibold tracking-tight text-white",
                key === "pro" && "text-[15px] sm:text-2xl lg:text-3xl",
                key === "core" && "text-sm sm:text-xl lg:text-2xl",
                key === "black" &&
                  "text-sm tracking-tight text-stone-100 sm:text-2xl lg:text-[1.75rem]",
              )}
            >
              {tier.price}
            </p>
            {key === "black" ? (
              <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-amber-200/40 sm:text-[10px]">
                Private allocation
              </p>
            ) : null}
            {tier.priceNote ? (
              <p
                className={cn(
                  "mt-1.5 max-w-sm text-[11px] leading-snug sm:text-[12px] sm:leading-relaxed",
                  key === "black" ? "text-zinc-500" : "text-zinc-600",
                )}
              >
                {tier.priceNote}
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] leading-snug text-zinc-600 sm:text-[12px]">
                Reserved capacity · manual review · GST as applicable.
              </p>
            )}
          </div>

          <ul className="mt-2 flex min-h-0 flex-1 flex-col gap-1 sm:mt-3 sm:gap-1.5">
            {featureList.map((f) => (
              <li
                key={f}
                className="flex gap-1.5 text-[10px] leading-snug text-zinc-400 sm:gap-2 sm:text-[12px]"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-3 shrink-0 items-center justify-center rounded border sm:size-4 sm:rounded-md",
                    key === "pro" &&
                      "border-white/[0.12] bg-white/[0.05] text-[color:var(--ascend-accent)]",
                    key === "core" &&
                      "border-white/[0.08] bg-zinc-950/40 text-zinc-300",
                    key === "black" &&
                      "border-zinc-800 bg-zinc-950/80 text-amber-200/50",
                  )}
                >
                  <Check className="size-2 sm:size-2.5" strokeWidth={2.25} />
                </span>
                <span
                  className={cn(
                    "min-w-0 text-zinc-300",
                    key === "black" && "text-zinc-400",
                  )}
                >
                  {f}
                </span>
              </li>
            ))}
          </ul>

          {slotLine ? (
            <p className="mt-2 hidden border-t border-white/[0.06] pt-2 text-[10px] font-medium uppercase leading-relaxed tracking-[0.2em] text-zinc-600 sm:block sm:pt-2.5">
              {slotLine}
            </p>
          ) : null}

          <div className="mt-auto flex shrink-0 flex-col pt-3 sm:pt-4">
            <motion.button
              type="button"
              onClick={() => openAssessment(tier.key)}
              className={cn(
                "h-10 w-full rounded-full border border-white/[0.1] bg-white/[0.06] text-center text-[12px] font-medium text-zinc-100 transition-colors",
                "hover:border-white/[0.16] hover:bg-white/[0.1]",
                key === "pro" &&
                  "border-[color:rgba(95,115,134,0.35)] bg-white/[0.08]",
                key === "black" &&
                  "border-amber-950/35 bg-amber-950/15 text-amber-100/90",
              )}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.987 }}
              transition={TAP_SPRING}
            >
              {FINAL_SECTION_CTA_LABEL}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function Pricing() {
  const viewport = useRevealViewport();
  const isMobile = useIsMobileConversion();
  const headerStagger = useMemo(
    () => getHeaderStaggerParent(isMobile),
    [isMobile],
  );
  const fadeMain = useMemo(() => getFadeUpReveal(isMobile), [isMobile]);
  const gridStagger = useMemo(() => getGridStaggerParent(isMobile), [isMobile]);
  const cardVariants = useMemo(
    () => getCardRevealMobile(isMobile),
    [isMobile],
  );

  return (
    <section
      id="pricing"
      data-conversion-zone="pricing"
      className="ascend-section-world relative scroll-mt-28 overflow-x-clip overflow-y-visible border-t border-[color:var(--ascend-border)] bg-ascend-surface py-6 sm:py-12 lg:py-16"
      aria-labelledby="pricing-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-ascend-canvas via-ascend-surface to-ascend-canvas" />
        {!isMobile ? (
          <>
            <div className="absolute left-1/2 top-0 h-[22rem] w-[min(100%,56rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.055),transparent_72%)] blur-3xl" />
            <div className="absolute -right-[24%] top-[38%] h-[28rem] w-[28rem] rounded-full bg-white/[0.03] blur-[110px]" />
            <div className="absolute -left-[20%] bottom-[8%] h-[24rem] w-[24rem] rounded-full bg-zinc-600/[0.04] blur-[100px]" />
          </>
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,6,0.46)_78%)]" />
      </div>

      <div className={shellWide}>
        <motion.div
          className={leadLeft}
          variants={headerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.p
            variants={fadeMain}
            className="ascend-type-eyebrow mb-2 text-zinc-500 sm:mb-4"
          >
            Membership
          </motion.p>
          <motion.h2
            id="pricing-heading"
            variants={fadeMain}
            className="ascend-type-section-sm ascend-headline"
          >
            Choose the depth that fits this season.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-3 max-w-[34rem] text-pretty text-zinc-500 sm:mt-5"
          >
            Same standards. What changes is how close the support sits, how fast
            we reply, and how private the work can go.
          </motion.p>
        </motion.div>

        <motion.p
          className="mt-3 max-w-2xl text-left text-[11px] leading-snug text-zinc-600 sm:mt-5 sm:text-[13px] sm:leading-relaxed"
          variants={fadeMain}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          Limited seats · manual intake · serious room only.
        </motion.p>

        <PricingCapacityRibbon viewport={viewport} />

        <motion.div
          className="relative mx-auto mt-5 max-w-6xl sm:mt-8 lg:mt-10"
          variants={gridStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <div
            className="pointer-events-none absolute left-[10%] right-[10%] top-[42%] hidden h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent lg:block"
            aria-hidden
          />
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:items-stretch lg:gap-4 xl:gap-5">
            {tiers.map((t) => (
              <div key={t.key} className="relative flex min-h-0 min-w-0">
                <PricingCard tier={t} cardVariants={cardVariants} />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.p
          className="mt-5 max-w-2xl text-left text-[11px] leading-snug text-zinc-600 sm:mt-7 sm:text-[13px] sm:leading-relaxed lg:pl-1"
          variants={fadeMain}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          Depth follows the tier you enter — not entitlement.
        </motion.p>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-ascend-canvas/40 to-transparent sm:h-20"
        aria-hidden
      />
    </section>
  );
}
