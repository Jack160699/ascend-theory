"use client";

import { useAssessmentModal } from "@/contexts/assessment-modal";
import { useConversionExperienceOptional } from "@/contexts/conversion-experience";
import { cn } from "@/lib/utils";
import type { TierKey } from "@/lib/lead-context";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useRef } from "react";

const viewport = { once: true, margin: "-100px" } as const;

const headerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.78, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const cardsStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.14 },
  },
};

const cardReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.78, ease: [0.16, 1, 0.3, 1] as const },
  },
};

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
      "Disciplined, structured entry — same transformation philosophy with foundation mentorship proximity and execution calibration.",
    price: "₹7,000 + GST / month",
    features: [
      "Identity-grade systems across physique, communication, discipline, lifestyle",
      "Structured accountability architecture and reserved mentor capacity",
      "Foundation cadence — calibrated depth before maximum proximity",
      "Personalization through frameworks, audits, and weekly execution reviews",
      "Response priority aligned to foundation allocation",
      "Premium peer field — standards without noise",
      "Private assessment routing — manually reviewed",
    ],
    cta: "Apply For Core Access",
  },
  {
    key: "pro",
    name: "Ascend Pro",
    label: "High-accountability mentorship",
    purpose:
      "Accelerated identity upgrade — closest balance of scale and private attention. Same philosophy; materially higher proximity and response priority.",
    price: "₹15,000 + GST / month",
    features: [
      "Elevated mentor proximity with high-frequency accountability loops",
      "Priority response architecture for time-sensitive leadership decisions",
      "Deeper personalization across communication, lifestyle, and execution",
      "Integrated private calibration when stakes require it",
      "Identity-grade transformation held with elite mentorship density",
      "Selective cohort pacing — limited onboarding slots",
      "Same methodology as Core — different access cadence",
    ],
    cta: "Request Pro Assessment",
    badge: "Primary offer",
  },
  {
    key: "black",
    name: "Ascend Black",
    label: "Private transformation architecture",
    purpose:
      "Confidential, executive-level allocation — highest-access mentorship, discretion-first, application-only.",
    price: "₹55,000 + GST / month",
    priceNote:
      "Private allocation · Discretion-first · Manually reviewed · Application only",
    features: [
      "Reserved private rails — not a mass-market container",
      "Highest mentor proximity and bespoke execution calibration",
      "Confidential communication and offline-grade attention windows",
      "Executive-tempo orchestration across domains",
      "Full personalization of cadence, access, and accountability depth",
      "Selective acceptance — alignment over volume",
      "Same philosophy — maximum private attention architecture",
    ],
    cta: "Request Private Allocation",
    badge: "Application only",
  },
];

function PricingCapacityRibbon() {
  const conv = useConversionExperienceOptional();
  const msg = conv?.urgencyMessage;
  if (!msg) return null;
  return (
    <motion.div
      className="mx-auto mt-10 max-w-2xl rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-md sm:mt-12"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }}
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={msg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-[10px] font-medium uppercase leading-relaxed tracking-[0.22em] text-zinc-500"
        >
          {msg}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}

function PricingCard({
  tier,
  onOpenAssessment,
  urgencySlot,
}: {
  tier: (typeof tiers)[number];
  onOpenAssessment: (key: TierKey) => void;
  urgencySlot: number;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const conv = useConversionExperienceOptional();
  const slotLine = conv?.urgencyForTier(urgencySlot) ?? "";
  const { key } = tier;

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
      variants={cardReveal}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "group relative h-full [perspective:1600px]",
        key === "pro" &&
          "z-10 scale-[1.01] shadow-[0_30px_80px_-48px_rgba(255,255,255,0.2)] lg:z-20 lg:-my-5 lg:scale-[1.06] lg:shadow-[0_60px_120px_-60px_rgba(0,0,0,0.85)]",
        key === "black" &&
          "ring-1 ring-amber-950/25 lg:opacity-[0.99] lg:shadow-[0_0_100px_-48px_rgba(160,120,70,0.12)]",
      )}
      whileHover={{ y: key === "pro" ? -8 : key === "black" ? -5 : -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[1.35rem] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100",
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
          "relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.25rem] border shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-2xl transition-[border-color,box-shadow] duration-500",
          key === "core" &&
            "border-white/[0.09] bg-white/[0.025] p-7 group-hover:border-white/[0.14] group-hover:shadow-[0_28px_90px_-48px_rgba(0,0,0,0.88)]",
          key === "pro" &&
            "border-white/[0.2] bg-white/[0.06] p-7 shadow-[0_34px_95px_-52px_rgba(0,0,0,0.88),0_0_90px_-28px_rgba(255,255,255,0.12)] group-hover:border-white/[0.24] group-hover:shadow-[0_48px_120px_-56px_rgba(0,0,0,0.92),0_0_110px_-24px_rgba(255,255,255,0.14)] sm:p-8 lg:p-9",
          key === "black" &&
            "border-amber-950/20 bg-gradient-to-b from-zinc-950/95 via-[#030303] to-black p-7 group-hover:border-amber-900/35 group-hover:shadow-[0_40px_120px_-52px_rgba(0,0,0,0.95),0_0_72px_-24px_rgba(180,150,100,0.08)] lg:p-8",
        )}
      >
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
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

          <p className="mt-4 text-[13px] leading-relaxed text-zinc-400">
            {tier.purpose}
          </p>

          <div className="mt-6 border-t border-white/[0.06] pt-6">
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
                key === "black" && "text-2xl tracking-tight text-stone-100 sm:text-3xl lg:text-[2rem]",
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
                Reserved mentor capacity · selective allocation · GST as
                applicable.
              </p>
            )}
          </div>

          <ul className="mt-7 flex flex-1 flex-col gap-3 sm:mt-8">
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
            <AnimatePresence mode="wait">
              <motion.p
                key={slotLine}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="mt-6 border-t border-white/[0.06] pt-4 text-[10px] font-medium uppercase leading-relaxed tracking-[0.2em] text-zinc-600"
              >
                {slotLine}
              </motion.p>
            </AnimatePresence>
          ) : null}

          <motion.button
            type="button"
            onClick={() => onOpenAssessment(tier.key)}
            className={cn(
              "mt-9 inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full text-sm font-medium tracking-tight transition-[box-shadow,transform,color] duration-300 sm:mt-10",
              key === "pro" &&
                "bg-white text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_22px_64px_-22px_rgba(255,255,255,0.28)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_26px_76px_-18px_rgba(255,255,255,0.34)]",
              key === "core" &&
                "border border-white/[0.12] bg-white/[0.05] text-white hover:border-white/[0.2] hover:bg-white/[0.09]",
              key === "black" &&
                "border border-zinc-700/80 bg-zinc-950/80 text-zinc-200 hover:border-amber-950/40 hover:bg-zinc-900/90 hover:text-white",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tier.cta}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export function Pricing() {
  const { openAssessment } = useAssessmentModal();

  return (
    <section
      id="pricing"
      data-conversion-zone="pricing"
      className="relative scroll-mt-28 overflow-hidden border-t border-white/[0.04] bg-[#050505] py-20 sm:py-28 lg:py-32"
      aria-labelledby="pricing-heading"
    >
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

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={headerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <motion.p
            variants={fadeUp}
          className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500 sm:mb-5 sm:tracking-[0.32em]"
          >
            Entry & allocation
          </motion.p>
          <motion.h2
            id="pricing-heading"
            variants={fadeUp}
            className="text-balance text-[clamp(1.9rem,9vw,2.35rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-4xl sm:leading-[1.08] lg:text-[2.35rem]"
          >
            Select your mentorship depth.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-7 max-w-2xl text-pretty text-[15px] leading-[1.75] text-zinc-500 sm:mt-8 sm:text-base sm:leading-relaxed"
          >
            Same transformation philosophy across every tier. What scales is
            mentor proximity, accountability intensity, response priority, and
            private calibration — never how much change you deserve.
          </motion.p>
        </motion.div>

        <motion.div
          className="mx-auto mt-8 max-w-3xl space-y-2 text-center text-[12px] leading-relaxed text-zinc-600"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <p>Reserved mentor capacity · selective allocation · structured methodology.</p>
          <p>Limited onboarding windows · private accountability architecture.</p>
          <p>Identity-grade seriousness — not mass-market coaching.</p>
        </motion.div>

        <PricingCapacityRibbon />

        <motion.div
          className="relative mx-auto mt-14 max-w-6xl sm:mt-16 lg:mt-20"
          variants={cardsStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <div
            className="pointer-events-none absolute left-[10%] right-[10%] top-[42%] hidden h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent lg:block"
            aria-hidden
          />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-end lg:gap-5 xl:gap-8">
            <div className="relative order-2 lg:order-1 lg:pb-10">
              <p className="mb-3 hidden text-center font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-zinc-600 lg:block">
                I — Foundation access
              </p>
              <PricingCard
                tier={tiers[0]}
                urgencySlot={0}
                onOpenAssessment={openAssessment}
              />
            </div>
            <div className="relative order-1 lg:order-2 lg:z-20 lg:px-1">
              <p className="mb-3 hidden text-center font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-zinc-400 lg:block">
                II — High accountability
              </p>
              <PricingCard
                tier={tiers[1]}
                urgencySlot={1}
                onOpenAssessment={openAssessment}
              />
            </div>
            <div className="relative order-3 lg:order-3 lg:pb-10">
              <p className="mb-3 hidden text-center font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-zinc-600 lg:block">
                III — Private architecture
              </p>
              <PricingCard
                tier={tiers[2]}
                urgencySlot={2}
                onOpenAssessment={openAssessment}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto mt-16 max-w-3xl space-y-4 text-center text-[13px] leading-relaxed text-zinc-500 sm:mt-20"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
        >
          <p>
            Transformation depth scales with proximity, calibration, and
            accountability — not with how much change you deserve.
          </p>
          <p className="text-zinc-600">
            All paths follow the same transformation philosophy. The difference
            is mentor allocation depth and execution architecture.
          </p>
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/85 to-transparent"
        aria-hidden
      />
    </section>
  );
}
