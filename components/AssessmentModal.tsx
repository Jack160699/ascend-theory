"use client";

import { cn } from "@/lib/utils";
import { tierLabel, type TierKey } from "@/lib/lead-context";
import {
  DURATION_OPACITY,
  DURATION_OVERLAY_SLOW,
  TAP_SPRING,
  txReveal,
} from "@/lib/motion";
import {
  buildPremiumIntakeWhatsAppUrl,
  type PremiumIntakePayload,
} from "@/lib/whatsapp";
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

const emptyFields = {
  fullName: "",
  age: "",
  whatsapp: "",
  goal: "",
  frustration: "",
  instagram: "",
};

function validate(fields: typeof emptyFields): string | null {
  if (!fields.fullName.trim()) return "Add your name.";
  if (!fields.age.trim()) return "Add your age.";
  if (!fields.whatsapp.trim()) return "Add your WhatsApp number.";
  if (!fields.goal.trim()) return "State your main goal.";
  if (!fields.frustration.trim()) return "Name your biggest current frustration.";
  return null;
}

export function AssessmentModal({ tier, open, onClose }: Props) {
  const [fields, setFields] = useState(emptyFields);
  const [error, setError] = useState<string | null>(null);

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
    if (!open) return;
    setFields(emptyFields);
    setError(null);
  }, [open, tier]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const submitForm = useCallback(() => {
    const err = validate(fields);
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    const payload: PremiumIntakePayload = {
      name: fields.fullName.trim(),
      age: fields.age.trim(),
      phone: fields.whatsapp.trim(),
      goal: fields.goal.trim(),
      frustration: fields.frustration.trim(),
      instagram: fields.instagram.trim() || undefined,
      tierInterest: tier ? tierLabel(tier) : undefined,
    };

    const url = buildPremiumIntakeWhatsAppUrl(payload);
    onClose();
    window.open(url, "_blank", "noopener,noreferrer");
  }, [fields, tier, onClose]);

  const eyebrow =
    tier === "core"
      ? "Ascend Core"
      : tier === "pro"
        ? "Ascend Pro"
        : tier === "black"
          ? "Ascend Black"
          : "Ascend Theory";

  return (
    <AnimatePresence>
      {open ? (
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
            className="absolute inset-0 bg-black/[0.72] backdrop-blur-sm sm:bg-black/[0.68] sm:backdrop-blur-md"
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
                  {eyebrow}
                </p>
                <h2
                  id="assessment-modal-title"
                  className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-2xl"
                >
                  Private application
                </h2>
                <p className="mt-2 max-w-md text-[12px] leading-relaxed text-zinc-500 sm:text-[13px]">
                  Short context — we read every submission before any reply.
                </p>
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
              <div>
                <label className={labelClass} htmlFor="app-name">
                  Name
                </label>
                <input
                  id="app-name"
                  className={inputClass}
                  value={fields.fullName}
                  onChange={(e) =>
                    setFields((s) => ({ ...s, fullName: e.target.value }))
                  }
                  autoComplete="name"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="app-age">
                  Age
                </label>
                <input
                  id="app-age"
                  inputMode="numeric"
                  className={inputClass}
                  value={fields.age}
                  onChange={(e) =>
                    setFields((s) => ({ ...s, age: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="app-wa">
                  WhatsApp number
                </label>
                <input
                  id="app-wa"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className={inputClass}
                  value={fields.whatsapp}
                  onChange={(e) =>
                    setFields((s) => ({ ...s, whatsapp: e.target.value }))
                  }
                  placeholder="Include country code if outside India"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="app-goal">
                  Main goal
                </label>
                <textarea
                  id="app-goal"
                  rows={3}
                  className={cn(inputClass, "resize-none")}
                  value={fields.goal}
                  onChange={(e) =>
                    setFields((s) => ({ ...s, goal: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="app-friction">
                  Biggest current frustration
                </label>
                <textarea
                  id="app-friction"
                  rows={3}
                  className={cn(inputClass, "resize-none")}
                  value={fields.frustration}
                  onChange={(e) =>
                    setFields((s) => ({ ...s, frustration: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="app-ig">
                  Instagram handle{" "}
                  <span className="normal-case tracking-normal text-zinc-600">
                    (optional)
                  </span>
                </label>
                <input
                  id="app-ig"
                  className={inputClass}
                  value={fields.instagram}
                  onChange={(e) =>
                    setFields((s) => ({ ...s, instagram: e.target.value }))
                  }
                  placeholder="@handle"
                />
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
                  className="h-11 rounded-full border border-white/[0.1] px-5 text-sm font-medium text-zinc-300 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:border-white/[0.16] hover:bg-white/[0.04] hover:text-white"
                  whileHover={{ scale: 1.012 }}
                  whileTap={{ scale: 0.988 }}
                  transition={TAP_SPRING}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  onClick={submitForm}
                  className="h-11 rounded-full bg-white px-7 text-sm font-medium text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_48px_-16px_rgba(255,255,255,0.22)]"
                  whileHover={{ scale: 1.012 }}
                  whileTap={{ scale: 0.988 }}
                  transition={TAP_SPRING}
                >
                  Continue to WhatsApp
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
