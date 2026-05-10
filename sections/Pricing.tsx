"use client";

import { SectionContinuity } from "@/components/SectionContinuity";
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
import { cn } from "@/lib/utils";
import type { TierKey } from "@/lib/lead-context";
import { ascendWhatsAppUrl } from "@/lib/whatsapp";
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
  cta: string;
  badge?: string;
}[] = [
  {
    key: "core",
    name: "Ascend Core",
    label: "Foundation access",
    purpose:
      "Full philosophy — foundation mentor rhythm, structured accountability, and room to earn density.",
    price: "₹7,000 + GST / month",
    features: [
      "Training, voice, discipline, lifestyle — one system",
      "Structured check-ins and execution reviews",
      "Mentor touchpoints inside the shared container",
      "Peer field with a serious bar",
      "Intake read manually before invite",
    ],
    cta: "Start application",
  },
  {
    key: "pro",
    name: "Ascend Pro",
    label: "High-accountability mentorship",
    purpose:
      "Same philosophy — more proximity, faster feedback, and priority when decisions cannot wait.",
    price: "₹15,000 + GST / month",
    features: [
      "Tighter accountability loops",
      "Priority response windows",
      "Deeper personalization across domains",
      "Private calibration when stakes demand it",
      "Reserved onboarding pacing",
    ],
    cta: "Start application",
    badge: "Primary allocation",
  },
  {
    key: "black",
    name: "Ascend Black",
    label: "Private transformation architecture",
    purpose:
      "Highest access — discretion-first, invitation-only after manual review.",
    price: "₹55,000 + GST / month",
    priceNote:
      "Private · discretion-first · manually reviewed · invitation only",
    features: [
      "Highest mentor proximity",
      "Confidential communication rails",
      "Bespoke cadence and accountability depth",
      "Executive-tempo support across domains",
      "Same philosophy — maximum private attention",
    ],
    cta: "Start application",
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
      className="ascend-surface-soft mt-7 max-w-2xl rounded-full px-5 py-2.5 text-left sm:mt-10"
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
  const rootRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const conv = useConversionExperienceOptional();
  const slotLine = conv?.urgencyForTier(0) ?? "";
  const { key } = tier;
  const applyHref = ascendWhatsAppUrl(`Ascend Theory — applying for ${tier.name}.`);

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

  const sheenSpeed = key === "pro" ? 16 : key === "black" ? 26 : 22;

  return (
    <motion.article
      ref={rootRef}
      variants={cardVariants}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "group relative h-full [perspective:1600px]",
        key === "pro" &&
          "z-10 scale-[1.01] shadow-[0_30px_80px_-48px_rgba(255,255,255,0.2)] lg:z-20 lg:-my-5 lg:scale-[1.06] lg:shadow-[0_60px_120px_-60px_rgba(0,0,0,0.85)]",
        key === "black" &&
          "ring-1 ring-amber-950/25 lg:opacity-[0.99] lg:shadow-[0_0_100px_-48px_rgba(160,120,70,0.12)]",
      )}
      whileHover={{ y: key === "pro" ? -3 : key === "black" ? -2.5 : -2 }}
      transition={SURFACE_SPRING}
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[1.35rem] opacity-0 blur-2xl transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.82]",
          key === "pro" &&
            "bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.2),transparent_62%)]",
          key === "core" &&
            "bg-[radial-gradient(ellipse_at_40%_0%,rgba(255,255,255,0.1),transparent_70%)]",
          key === "black" &&
            "bg-[radial-gradient(ellipse_at_50%_20%,rgba(120,100,80,0.12),transparent_65%)]",
        )}
      />
      <div
        className={cn(
          "relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.25rem] border shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-2xl transition-[border-color,box-shadow,transform] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
          key === "core" &&
            "border-white/[0.09] bg-white/[0.025] p-5 group-hover:border-white/[0.14] group-hover:shadow-[0_28px_90px_-48px_rgba(0,0,0,0.88)] sm:p-7",
          key === "pro" &&
            "border-white/[0.2] bg-white/[0.06] p-5 shadow-[0_34px_95px_-52px_rgba(0,0,0,0.88),0_0_90px_-28px_rgba(255,255,255,0.12)] group-hover:border-white/[0.24] group-hover:shadow-[0_48px_120px_-56px_rgba(0,0,0,0.92),0_0_110px_-24px_rgba(255,255,255,0.14)] sm:p-7 lg:p-9",
          key === "black" &&
            "border-amber-950/20 bg-gradient-to-b from-zinc-950/95 via-[#030303] to-black p-5 group-hover:border-amber-900/35 group-hover:shadow-[0_40px_120px_-52px_rgba(0,0,0,0.95),0_0_72px_-24px_rgba(180,150,100,0.08)] sm:p-7 lg:p-8",
        )}
      >
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] group-hover:opacity-[0.9]"
          style={{ background: glowSpot }}
        />
        <motion.div
          className={cn(
            "pointer-events-none absolute inset-0",
            key === "black" ? "opacity-[0.2]" : "opacity-[0.14]",
          )}
          animate={{
            backgroundPosition: ["0% 45%", "100% 55%", "0% 45%"],
          }}
          transition={{
            duration: sheenSpeed,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            background:
              key === "black"
                ? "linear-gradient(118deg, transparent 38%, rgba(180,160,120,0.05) 50%, transparent 62%)"
                : "linear-gradient(125deg, transparent 35%, rgba(255,255,255,0.07) 50%, transparent 65%)",
            backgroundSize: "200% 200%",
          }}
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

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3
                className={cn(
                  "font-semibold tracking-tight text-white",
                  key === "pro" && "text-xl lg:text-2xl",
                  key === "core" && "text-lg lg:text-xl",
                  key === "black" &&
                    "font-semibold tracking-[0.1em] text-stone-100 lg:text-xl",
                )}
              >
                {tier.name}
              </h3>
              <p
                className={cn(
                  "mt-1.5 text-[11px] font-medium uppercase tracking-[0.26em]",
                  key === "black" ? "text-zinc-600" : "text-zinc-500",
                )}
              >
                {tier.label}
              </p>
            </div>
            {tier.badge ? (
              <span
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em]",
                  key === "pro" &&
                    "border-white/[0.14] bg-white/[0.08] text-zinc-100 shadow-[0_0_24px_-8px_rgba(255,255,255,0.12)]",
                  key === "black" &&
                    "border-amber-950/30 bg-amber-950/10 text-amber-200/70",
                )}
              >
                {tier.badge}
              </span>
            ) : null}
          </div>

          <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">
            {tier.purpose}
          </p>

          <div className="mt-5 border-t border-white/[0.06] pt-5">
            {tier.priceLead ? (
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.26em] text-zinc-600">
                {tier.priceLead}
              </p>
            ) : null}
            <p
              className={cn(
                "font-mono font-semibold tracking-tight text-white",
                key === "pro" && "text-3xl lg:text-4xl",
                key === "core" && "text-2xl lg:text-3xl",
                key === "black" &&
                  "text-2xl tracking-tight text-stone-100 sm:text-3xl lg:text-[2rem]",
              )}
            >
              {tier.price}
            </p>
            {key === "black" ? (
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/40">
                Private allocation
              </p>
            ) : null}
            {tier.priceNote ? (
              <p
                className={cn(
                  "mt-2 max-w-sm text-[12px] leading-relaxed",
                  key === "black" ? "text-zinc-500" : "text-zinc-600",
                )}
              >
                {tier.priceNote}
              </p>
            ) : (
              <p className="mt-2 text-[12px] leading-relaxed text-zinc-600">
                Reserved mentor capacity · manual review · GST as applicable.
              </p>
            )}
          </div>

          <ul className="mt-5 flex flex-1 flex-col gap-2 sm:mt-6 sm:gap-2.5">
            {tier.features.map((f) => (
              <li
                key={f}
                className="flex gap-3 text-[13px] leading-snug text-zinc-400"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border",
                    key === "pro" &&
                      "border-white/[0.14] bg-white/[0.07] text-emerald-400/90",
                    key === "core" &&
                      "border-white/[0.08] bg-zinc-950/40 text-zinc-300",
                    key === "black" &&
                      "border-zinc-800 bg-zinc-950/80 text-amber-200/50",
                  )}
                >
                  <Check className="size-3" strokeWidth={2.25} />
                </span>
                <span
                  className={cn(
                    "text-zinc-300",
                    key === "black" && "text-zinc-400",
                  )}
                >
                  {f}
                </span>
              </li>
            ))}
          </ul>

          {slotLine ? (
            <p className="mt-4 border-t border-white/[0.06] pt-3 text-[10px] font-medium uppercase leading-relaxed tracking-[0.2em] text-zinc-600">
              {slotLine}
            </p>
          ) : null}

          <motion.a
            href={applyHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-6 inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full text-sm font-medium tracking-tight transition-[box-shadow,transform,color,border-color,background-color] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] sm:mt-8",
              key === "pro" && "ascend-button-primary bg-white text-zinc-950",
              key === "core" &&
                "ascend-button-ghost border border-white/[0.12] bg-white/[0.05] text-white hover:border-white/[0.2] hover:bg-white/[0.09]",
              key === "black" &&
                "ascend-button-ghost border border-zinc-700/80 bg-zinc-950/80 text-zinc-200 hover:border-amber-950/40 hover:bg-zinc-900/90 hover:text-white",
            )}
            whileHover={{ scale: 1.012 }}
            whileTap={{ scale: 0.988 }}
            transition={TAP_SPRING}
          >
            {tier.cta}
          </motion.a>
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
      className="ascend-section-world relative scroll-mt-28 overflow-hidden border-t border-white/[0.028] bg-[#050505] py-12 sm:py-24 lg:py-[8.75rem]"
      aria-labelledby="pricing-heading"
    >
      <SectionContinuity />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-black" />
        <div className="absolute left-1/2 top-0 h-[26rem] w-[min(100%,56rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.065),transparent_72%)] blur-3xl" />
        <div className="absolute -right-[24%] top-[38%] h-[32rem] w-[32rem] rounded-full bg-white/[0.03] blur-[130px]" />
        <div className="absolute -left-[20%] bottom-[8%] h-[28rem] w-[28rem] rounded-full bg-zinc-600/[0.045] blur-[120px]" />
        <div className="absolute left-[42%] top-[52%] h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-amber-950/[0.05] blur-[90px]" />
        <motion.div
          className="absolute right-[18%] top-[22%] h-72 w-72 rounded-full bg-emerald-950/[0.05] blur-[95px]"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.52)_78%)]" />
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
            className="ascend-type-eyebrow mb-4 text-zinc-500 sm:mb-5"
          >
            Pricing
          </motion.p>
          <motion.h2
            id="pricing-heading"
            variants={fadeMain}
            className="ascend-type-section-sm text-white"
          >
            Pick the depth that matches your season.
          </motion.h2>
          <motion.p
            variants={fadeMain}
            className="ascend-prose-calm mt-6 max-w-[34rem] text-pretty text-zinc-500 sm:mt-8"
          >
            Same philosophy on every tier. What changes is mentor proximity,
            how fast we respond, and how private the calibration can go.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-6 max-w-2xl space-y-2 text-left text-[12px] leading-[1.72] text-zinc-600 sm:mt-8 sm:text-[13px] sm:leading-[1.75]"
          variants={fadeMain}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <p>Limited seats · manual intake · structured methodology.</p>
          <p>Serious environment — not mass-market coaching.</p>
        </motion.div>

        <PricingCapacityRibbon viewport={viewport} />

        <motion.div
          className="relative mx-auto mt-10 max-w-6xl sm:mt-12 lg:mt-16"
          variants={gridStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <div
            className="pointer-events-none absolute left-[10%] right-[10%] top-[42%] hidden h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent lg:block"
            aria-hidden
          />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-end lg:gap-4 xl:gap-6">
            <div className="relative order-2 lg:order-1 lg:pb-10">
              <p className="mb-3 hidden text-left font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-zinc-600 lg:block lg:pl-1">
                I — Foundation access
              </p>
              <PricingCard tier={tiers[0]} cardVariants={cardVariants} />
            </div>
            <div className="relative order-1 lg:order-2 lg:z-20 lg:px-1">
              <p className="mb-3 hidden text-left font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-zinc-400 lg:block lg:pl-1">
                II — High accountability
              </p>
              <PricingCard tier={tiers[1]} cardVariants={cardVariants} />
            </div>
            <div className="relative order-3 lg:order-3 lg:pb-10">
              <p className="mb-3 hidden text-left font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-zinc-600 lg:block lg:pl-1">
                III — Private architecture
              </p>
              <PricingCard tier={tiers[2]} cardVariants={cardVariants} />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-9 max-w-2xl space-y-2.5 text-left text-[13px] leading-[1.72] text-zinc-500 sm:mt-12 sm:leading-[1.75] lg:pl-1"
          variants={fadeMain}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <p>
            Depth scales with access and calibration — not with entitlement.
          </p>
          <p className="text-zinc-600">
            Same lane everywhere. Tiers change how close mentorship sits to
            your week.
          </p>
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/48 via-black/14 to-transparent sm:h-32"
        aria-hidden
      />
    </section>
  );
}
