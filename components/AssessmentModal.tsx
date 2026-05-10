"use client";

import { cn } from "@/lib/utils";
import {
  buildWhatsAppTierAssessmentUrl,
  formatLeadContextForBot,
  formatLeadSummary,
  type TierKey,
  type TierLeadAssessment,
  toTierLeadPayload,
} from "@/lib/lead-context";
import {
  DURATION_OPACITY,
  DURATION_OVERLAY_SLOW,
  TAP_SPRING,
  txReveal,
} from "@/lib/motion";
import {
  interpretAssessment,
  recommendationForStorage,
} from "@/lib/recommendation-engine";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const inputClass = cn(
  "mt-2 w-full rounded-xl border border-white/[0.1] bg-zinc-950/60 px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-[border-color,box-shadow,opacity] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
  "placeholder:text-zinc-600 focus:border-white/[0.18] focus:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_0_40px_-12px_rgba(255,255,255,0.06)]",
);

const labelClass =
  "text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500/88";

type Props = {
  tier: TierKey | null;
  open: boolean;
  onClose: () => void;
};

const emptyCore = {
  fullName: "",
  struggle: "",
  goal: "",
};
const emptyPro = {
  fullName: "",
  misaligned: "",
  transformation: "",
};
const emptyBlack = {
  fullName: "",
  transformationLevel: "",
  whyPrivate: "",
};

function validate(
  tier: TierKey,
  core: typeof emptyCore,
  pro: typeof emptyPro,
  black: typeof emptyBlack,
): string | null {
  if (tier === "core") {
    if (!core.fullName.trim()) return "Add your full name.";
    if (!core.struggle.trim()) return "Name the tension that costs you most today.";
    if (!core.goal.trim()) return "State the transformation you are unwilling to defer.";
  }
  if (tier === "pro") {
    if (!pro.fullName.trim()) return "Add your full name.";
    if (!pro.misaligned.trim()) return "Describe what feels most structurally misaligned.";
    if (!pro.transformation.trim())
      return "Name the transformation that must be true in the next season.";
  }
  if (tier === "black") {
    if (!black.fullName.trim()) return "Add your full name.";
    if (!black.transformationLevel.trim())
      return "Describe the depth of transformation your context demands.";
    if (!black.whyPrivate.trim())
      return "Explain why private allocation matters for your season.";
  }
  return null;
}

function toRecommendationBlock(rec: ReturnType<typeof interpretAssessment>) {
  return {
    recommendedTier: rec.recommendedTier,
    headline: rec.headline,
    summary: rec.summary,
    whyBullets: rec.whyBullets,
    trustNote: rec.trustNote ?? null,
  };
}

export function AssessmentModal({ tier, open, onClose }: Props) {
  const [core, setCore] = useState(emptyCore);
  const [pro, setPro] = useState(emptyPro);
  const [black, setBlack] = useState(emptyBlack);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      return;
    }
    setCore(emptyCore);
    setPro(emptyPro);
    setBlack(emptyBlack);
    setPhone("");
    setEmail("");
    setError(null);
    setIsSubmitting(false);
  }, [open, tier]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const buildLead = useCallback((): TierLeadAssessment | null => {
    if (!tier) return null;
    const contact =
      phone.trim() || email.trim()
        ? {
            ...(phone.trim() ? { phone: phone.trim() } : {}),
            ...(email.trim() ? { email: email.trim() } : {}),
          }
        : {};
    if (tier === "core") {
      return {
        tier: "core",
        answers: {
          fullName: core.fullName.trim(),
          struggle: core.struggle.trim(),
          goal: core.goal.trim(),
          ...contact,
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
          ...contact,
        },
      };
    }
    return {
      tier: "black",
      answers: {
        fullName: black.fullName.trim(),
        transformationLevel: black.transformationLevel.trim(),
        whyPrivate: black.whyPrivate.trim(),
        ...contact,
      },
    };
  }, [tier, core, pro, black, phone, email]);

  const submitForm = useCallback(() => {
    if (!tier || isSubmitting) return;
    const err = validate(tier, core, pro, black);
    if (err) {
      setError(err);
      return;
    }
    const lead = buildLead();
    if (!lead) return;
    setError(null);
    setIsSubmitting(true);

    const recommendation = interpretAssessment(lead);
    const block = toRecommendationBlock(recommendation);
    const payload = toTierLeadPayload(lead, block);

    try {
      sessionStorage.setItem(
        "ascend:leadContext:v3",
        formatLeadContextForBot(payload),
      );
      sessionStorage.setItem("ascend:leadSummary:v3", formatLeadSummary(lead));
      sessionStorage.setItem(
        "ascend:recommendation:v1",
        JSON.stringify(recommendationForStorage(recommendation)),
      );
    } catch {
      /* ignore */
    }

    const url = buildWhatsAppTierAssessmentUrl(lead, block);
    if (!url) {
      setIsSubmitting(false);
      setError(
        "WhatsApp is not configured. Set NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER.",
      );
      return;
    }

    onClose();
    window.location.assign(url);
  }, [tier, core, pro, black, buildLead, isSubmitting, onClose]);

  const title =
    tier === "core"
      ? "Ascend Core · Intake"
      : tier === "pro"
        ? "Ascend Pro · Intake"
        : tier === "black"
          ? "Private Allocation Request"
          : "";

  const tone =
    tier === "core"
      ? "Short context — we read every submission before any invitation."
      : tier === "pro"
        ? "Map stakes to mentorship depth — not packaging."
        : tier === "black"
          ? "Selective, discreet — reviewed manually before invitation."
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
          transition={txReveal(DURATION_OVERLAY_SLOW)}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/[0.68] backdrop-blur-md"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={txReveal(DURATION_OVERLAY_SLOW)}
            onClick={onClose}
          />
          <motion.div
            className="ascend-surface relative z-10 max-h-[min(88dvh,46rem)] w-full max-w-lg overflow-y-auto rounded-[1.25rem] p-4 sm:max-h-[min(92vh,46rem)] sm:p-7"
            initial={{ opacity: 0, y: 26, scale: 0.968 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.985 }}
            transition={txReveal(DURATION_OVERLAY_SLOW)}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-[1.25rem] bg-gradient-to-b from-white/[0.06] via-transparent to-transparent opacity-40"
              aria-hidden
            />

            <div className="relative z-10 flex items-start justify-between gap-3">
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
                  className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-2xl"
                >
                  {title}
                </h2>
                <p className="mt-2 max-w-md text-[12px] leading-relaxed text-zinc-500 sm:text-[13px]">
                  {tone}
                </p>
                {tier === "black" ? (
                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                    Private applications are reviewed manually — invitation
                    follows fit, not urgency.
                  </p>
                ) : null}
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                className="ascend-button-ghost flex size-10 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-white sm:size-10"
                whileHover={{ scale: 1.012 }}
                whileTap={{ scale: 0.988 }}
                transition={TAP_SPRING}
                aria-label="Close"
              >
                <X className="size-[18px]" />
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={txReveal(DURATION_OPACITY)}
              className="relative z-10 mt-6 space-y-4 sm:mt-7 sm:space-y-5"
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
                      Primary tension (today)
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
                      Transformation you refuse to defer
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
                    <label className={labelClass} htmlFor="m-pro-misaligned">
                      Where life feels structurally misaligned
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
                      Transformation the next season must hold
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
                      Depth of transformation your context demands
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
                      Why private allocation matters now
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

              <div className="grid grid-cols-1 gap-4 border-t border-white/[0.06] pt-4 sm:grid-cols-2 sm:gap-3">
                <div>
                  <label className={labelClass} htmlFor="m-contact-phone">
                    Phone (optional)
                  </label>
                  <input
                    id="m-contact-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className={inputClass}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="WhatsApp or mobile"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="m-contact-email">
                    Email (optional)
                  </label>
                  <input
                    id="m-contact-email"
                    type="email"
                    autoComplete="email"
                    className={inputClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                  />
                </div>
              </div>

              {error ? (
                <p
                  className="text-center text-[13px] text-red-400/90"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:justify-end sm:gap-3">
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="h-11 rounded-full border border-white/[0.1] px-5 text-sm font-medium text-zinc-300 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:border-white/[0.16] hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
                  whileHover={{ scale: 1.012 }}
                  whileTap={{ scale: 0.988 }}
                  transition={TAP_SPRING}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  onClick={submitForm}
                  disabled={isSubmitting}
                  className="h-11 rounded-full bg-white px-7 text-sm font-medium text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_48px_-16px_rgba(255,255,255,0.22)] disabled:opacity-60"
                  whileHover={{ scale: isSubmitting ? 1 : 1.012 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.988 }}
                  transition={TAP_SPRING}
                >
                  {isSubmitting ? "Opening WhatsApp…" : "Open WhatsApp"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
