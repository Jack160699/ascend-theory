"use client";

import { cn } from "@/lib/utils";
import {
  buildWhatsAppTierAssessmentUrl,
  formatLeadContextForBot,
  formatLeadSummary,
  type AssessmentRecommendationBlock,
  type BlackAssessmentAnswers,
  type CoreAssessmentAnswers,
  type ProAssessmentAnswers,
  type TierKey,
  type TierLeadAssessment,
  toTierLeadPayload,
} from "@/lib/lead-context";
import {
  DURATION_OVERLAY,
  DURATION_OVERLAY_SLOW,
  TAP_SPRING,
  txReveal,
} from "@/lib/motion";
import {
  interpretAssessment,
  recommendationForStorage,
  type RecommendationOutput,
} from "@/lib/recommendation-engine";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const inputClass = cn(
  "mt-2 w-full rounded-xl border border-white/[0.1] bg-zinc-950/60 px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-[border-color,box-shadow] duration-300",
  "placeholder:text-zinc-600 focus:border-white/[0.2] focus:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_36px_-10px_rgba(255,255,255,0.08)]",
);

const labelClass =
  "text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500";

type Props = {
  tier: TierKey | null;
  open: boolean;
  onClose: () => void;
};

type Phase = "form" | "processing" | "interpretation";

const emptyCore: CoreAssessmentAnswers = {
  fullName: "",
  struggle: "",
  goal: "",
};
const emptyPro: ProAssessmentAnswers = {
  fullName: "",
  misaligned: "",
  transformation: "",
};
const emptyBlack: BlackAssessmentAnswers = {
  fullName: "",
  transformationLevel: "",
  whyPrivate: "",
};

function validate(
  tier: TierKey,
  core: CoreAssessmentAnswers,
  pro: ProAssessmentAnswers,
  black: BlackAssessmentAnswers,
): string | null {
  if (tier === "core") {
    if (!core.fullName.trim()) return "Please add your name.";
    if (!core.struggle.trim()) return "Share your biggest current struggle.";
    if (!core.goal.trim()) return "Share your primary transformation goal.";
  }
  if (tier === "pro") {
    if (!pro.fullName.trim()) return "Please add your name.";
    if (!pro.misaligned.trim()) return "Describe what feels most misaligned.";
    if (!pro.transformation.trim())
      return "Share what transformation matters most.";
  }
  if (tier === "black") {
    if (!black.fullName.trim()) return "Please add your name.";
    if (!black.transformationLevel.trim())
      return "Describe the level of transformation you’re seeking.";
    if (!black.whyPrivate.trim())
      return "Share why private mentorship matters to you.";
  }
  return null;
}

function toRecommendationBlock(
  rec: RecommendationOutput,
): AssessmentRecommendationBlock {
  return {
    recommendedTier: rec.recommendedTier,
    headline: rec.headline,
    summary: rec.summary,
    whyBullets: rec.whyBullets,
    trustNote: rec.trustNote ?? null,
  };
}

export function AssessmentModal({ tier, open, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("form");
  const [core, setCore] = useState(emptyCore);
  const [pro, setPro] = useState(emptyPro);
  const [black, setBlack] = useState(emptyBlack);
  const [error, setError] = useState<string | null>(null);
  const [pendingLead, setPendingLead] = useState<TierLeadAssessment | null>(
    null,
  );
  const [recommendation, setRecommendation] =
    useState<RecommendationOutput | null>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [open]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // This effect intentionally resets form state when modal context changes.
    if (!open) {
      setPhase("form");
      setPendingLead(null);
      setRecommendation(null);
      return;
    }
    setCore(emptyCore);
    setPro(emptyPro);
    setBlack(emptyBlack);
    setError(null);
    setPhase("form");
    setPendingLead(null);
    setRecommendation(null);
  }, [open, tier]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (phase !== "processing" || !pendingLead) return;
    const id = window.setTimeout(() => {
      setRecommendation(interpretAssessment(pendingLead));
      setPhase("interpretation");
    }, 2000);
    return () => window.clearTimeout(id);
  }, [phase, pendingLead]);

  const buildLead = useCallback((): TierLeadAssessment | null => {
    if (!tier) return null;
    if (tier === "core") {
      return {
        tier: "core",
        answers: {
          fullName: core.fullName.trim(),
          struggle: core.struggle.trim(),
          goal: core.goal.trim(),
        },
      };
    }
    if (tier === "pro") {
      return {
        tier: "pro",
        answers: {
          fullName: pro.fullName.trim(),
          misaligned: pro.misaligned.trim(),
          transformation: pro.transformation.trim(),
        },
      };
    }
    return {
      tier: "black",
      answers: {
        fullName: black.fullName.trim(),
        transformationLevel: black.transformationLevel.trim(),
        whyPrivate: black.whyPrivate.trim(),
      },
    };
  }, [tier, core, pro, black]);

  const submitForm = useCallback(() => {
    if (!tier) return;
    const err = validate(tier, core, pro, black);
    if (err) {
      setError(err);
      return;
    }
    const lead = buildLead();
    if (!lead) return;
    setError(null);
    setPendingLead(lead);
    setPhase("processing");
  }, [tier, core, pro, black, buildLead]);

  const goWhatsApp = useCallback(() => {
    if (!pendingLead || !recommendation) return;
    const block = toRecommendationBlock(recommendation);
    const payload = toTierLeadPayload(pendingLead, block);
    try {
      sessionStorage.setItem(
        "ascend:leadContext:v3",
        formatLeadContextForBot(payload),
      );
      sessionStorage.setItem(
        "ascend:leadSummary:v3",
        formatLeadSummary(pendingLead),
      );
      sessionStorage.setItem(
        "ascend:recommendation:v1",
        JSON.stringify(recommendationForStorage(recommendation)),
      );
    } catch {
      /* ignore */
    }
    const url = buildWhatsAppTierAssessmentUrl(pendingLead, block);
    if (!url) {
      setError(
        "WhatsApp is not configured. Set NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER.",
      );
      return;
    }
    onClose();
    window.location.assign(url);
  }, [pendingLead, recommendation, onClose]);

  const title =
    tier === "core"
      ? "Ascend Core Assessment"
      : tier === "pro"
        ? "Ascend Pro Assessment"
        : tier === "black"
          ? "Private Transformation Request"
          : "";

  const tone =
    tier === "core"
      ? "Foundational questions — we read for cadence, structure, and emotional truth."
      : tier === "pro"
        ? "Intentional depth — we map stakes to mentorship density, not packaging."
        : tier === "black"
          ? "Private allocation — selective, discreet, reviewed by humans only."
          : "";

  return (
    <AnimatePresence>
      {open && tier ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assessment-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={txReveal(DURATION_OVERLAY)}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="ascend-surface relative z-10 max-h-[min(88dvh,46rem)] w-full max-w-lg overflow-y-auto rounded-[1.25rem] p-5 sm:max-h-[min(92vh,46rem)] sm:p-8"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={txReveal(DURATION_OVERLAY_SLOW)}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-[1.25rem] bg-gradient-to-b from-white/[0.06] via-transparent to-transparent opacity-40"
              aria-hidden
            />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500">
                  {tier === "black"
                    ? "Ascend Black"
                    : tier === "pro"
                      ? "Ascend Pro"
                      : "Ascend Core"}
                </p>
                <h2
                  id="assessment-modal-title"
                  className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl"
                >
                  {phase === "interpretation"
                    ? "Assessment interpretation"
                    : title}
                </h2>
                <p className="mt-2 max-w-md text-[13px] leading-relaxed text-zinc-500">
                  {phase === "interpretation"
                    ? "A psychologically grounded read — calibrated to mentorship depth, not tiers as trophies."
                    : tone}
                </p>
                {tier === "black" && phase === "form" ? (
                  <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
                    Private applications are reviewed manually.
                  </p>
                ) : null}
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                className="ascend-button-ghost flex size-11 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-white sm:size-10"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={TAP_SPRING}
                aria-label="Close"
              >
                <X className="size-[18px]" />
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {phase === "form" ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={txReveal(DURATION_OVERLAY)}
                  className="relative z-10 mt-8 space-y-5"
                >
                  {tier === "core" ? (
                    <>
                      <div>
                        <label className={labelClass} htmlFor="m-core-name">
                          Full name
                        </label>
                        <input
                          id="m-core-name"
                          className={inputClass}
                          value={core.fullName}
                          onChange={(e) =>
                            setCore((s) => ({ ...s, fullName: e.target.value }))
                          }
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="m-core-struggle">
                          Biggest current struggle
                        </label>
                        <textarea
                          id="m-core-struggle"
                          rows={3}
                          className={cn(inputClass, "resize-none")}
                          value={core.struggle}
                          onChange={(e) =>
                            setCore((s) => ({ ...s, struggle: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="m-core-goal">
                          Primary transformation goal
                        </label>
                        <textarea
                          id="m-core-goal"
                          rows={3}
                          className={cn(inputClass, "resize-none")}
                          value={core.goal}
                          onChange={(e) =>
                            setCore((s) => ({ ...s, goal: e.target.value }))
                          }
                        />
                      </div>
                    </>
                  ) : null}

                  {tier === "pro" ? (
                    <>
                      <div>
                        <label className={labelClass} htmlFor="m-pro-name">
                          Full name
                        </label>
                        <input
                          id="m-pro-name"
                          className={inputClass}
                          value={pro.fullName}
                          onChange={(e) =>
                            setPro((s) => ({ ...s, fullName: e.target.value }))
                          }
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label
                          className={labelClass}
                          htmlFor="m-pro-misaligned"
                        >
                          What area of life feels most misaligned?
                        </label>
                        <textarea
                          id="m-pro-misaligned"
                          rows={3}
                          className={cn(inputClass, "resize-none")}
                          value={pro.misaligned}
                          onChange={(e) =>
                            setPro((s) => ({
                              ...s,
                              misaligned: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="m-pro-transform">
                          What transformation matters most right now?
                        </label>
                        <textarea
                          id="m-pro-transform"
                          rows={3}
                          className={cn(inputClass, "resize-none")}
                          value={pro.transformation}
                          onChange={(e) =>
                            setPro((s) => ({
                              ...s,
                              transformation: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </>
                  ) : null}

                  {tier === "black" ? (
                    <>
                      <div>
                        <label className={labelClass} htmlFor="m-blk-name">
                          Full name
                        </label>
                        <input
                          id="m-blk-name"
                          className={inputClass}
                          value={black.fullName}
                          onChange={(e) =>
                            setBlack((s) => ({
                              ...s,
                              fullName: e.target.value,
                            }))
                          }
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="m-blk-level">
                          What level of transformation are you seeking?
                        </label>
                        <textarea
                          id="m-blk-level"
                          rows={3}
                          className={cn(inputClass, "resize-none")}
                          value={black.transformationLevel}
                          onChange={(e) =>
                            setBlack((s) => ({
                              ...s,
                              transformationLevel: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="m-blk-why">
                          Why is private mentorship important to you?
                        </label>
                        <textarea
                          id="m-blk-why"
                          rows={3}
                          className={cn(inputClass, "resize-none")}
                          value={black.whyPrivate}
                          onChange={(e) =>
                            setBlack((s) => ({
                              ...s,
                              whyPrivate: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </>
                  ) : null}

                  {error ? (
                    <p
                      className="text-center text-[13px] text-red-400/90"
                      role="alert"
                    >
                      {error}
                    </p>
                  ) : null}

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                    <motion.button
                      type="button"
                      onClick={onClose}
                      className="h-12 rounded-full border border-white/[0.1] px-6 text-sm font-medium text-zinc-300 transition-colors hover:border-white/[0.16] hover:bg-white/[0.04] hover:text-white"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={submitForm}
                      className="h-12 rounded-full bg-white px-8 text-sm font-medium text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_48px_-16px_rgba(255,255,255,0.22)]"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue
                    </motion.button>
                  </div>
                </motion.div>
              ) : null}

              {phase === "processing" ? (
                <motion.div
                  key="proc"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="relative z-10 flex flex-col items-center py-14"
                >
                  <div className="relative flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="size-2 rounded-full bg-zinc-500"
                        animate={{
                          opacity: [0.25, 1, 0.25],
                          scale: [0.9, 1.15, 0.9],
                        }}
                        transition={{
                          duration: 1.1,
                          repeat: Infinity,
                          delay: i * 0.18,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                  <motion.div
                    className="mx-auto mt-8 h-px w-44 overflow-hidden rounded-full bg-white/[0.07]"
                    aria-hidden
                  >
                    <motion.div
                      className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                      animate={{ x: ["-120%", "220%"] }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </motion.div>
                  <p className="mt-8 text-center text-sm text-zinc-400">
                    Synthesizing tone, stakes, and structure…
                  </p>
                  <p className="mt-2 max-w-xs text-center text-[12px] leading-relaxed text-zinc-600">
                    Quiet signal extraction — alignment over persuasion.
                  </p>
                </motion.div>
              ) : null}

              {phase === "interpretation" && recommendation ? (
                <motion.div
                  key="interp"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={txReveal(DURATION_OVERLAY_SLOW)}
                  className="relative z-10 mt-8 space-y-6"
                >
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                      Transformation summary
                    </p>
                    <p className="mt-3 text-[14px] leading-relaxed text-zinc-200">
                      {recommendation.summary}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                      Mentorship depth alignment
                    </p>
                    <p className="mt-2 text-lg font-semibold tracking-tight text-white">
                      {recommendation.headline}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                      Why this recommendation?
                    </p>
                    <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-zinc-400">
                      {recommendation.whyBullets.map((b) => (
                        <li key={b} className="flex gap-2">
                          <Sparkles
                            className="mt-0.5 size-3.5 shrink-0 text-zinc-600"
                            strokeWidth={1.25}
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {recommendation.trustNote ? (
                    <p className="rounded-lg border border-white/[0.06] bg-zinc-950/50 px-4 py-3 text-[12px] leading-relaxed text-zinc-500">
                      {recommendation.trustNote}
                    </p>
                  ) : null}

                  {error ? (
                    <p
                      className="text-center text-[13px] text-red-400/90"
                      role="alert"
                    >
                      {error}
                    </p>
                  ) : null}

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setPhase("form");
                        setRecommendation(null);
                        setPendingLead(null);
                      }}
                      className="h-12 rounded-full border border-white/[0.1] px-6 text-sm font-medium text-zinc-300 transition-colors hover:border-white/[0.16] hover:bg-white/[0.04] hover:text-white"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Edit responses
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={goWhatsApp}
                      className="h-12 rounded-full bg-white px-8 text-sm font-medium text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_48px_-16px_rgba(255,255,255,0.22)]"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue on WhatsApp
                    </motion.button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
