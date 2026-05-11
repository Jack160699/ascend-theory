"use client";

import { cn } from "@/lib/utils";
import type { TierKey } from "@/lib/lead-context";
import {
  DURATION_OVERLAY_SLOW,
  TAP_SPRING,
  txReveal,
} from "@/lib/motion";
import {
  buildWebsiteApplicationWhatsAppUrl,
  MODAL_WHATSAPP_CTA_LABEL,
  type WebsiteApplicationFields,
} from "@/lib/whatsapp";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const inputClass = cn(
  "w-full rounded-lg border border-[color:var(--ascend-border)] bg-ascend-elevated/95 px-3 py-2 text-[12px] leading-snug text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition-[border-color,box-shadow] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] sm:text-[13px]",
  "placeholder:text-zinc-600 focus:border-[color:rgba(95,115,134,0.4)] focus:shadow-[0_0_0_1px_var(--ascend-accent-glow),0_0_20px_-8px_var(--ascend-accent-glow)]",
);

type Props = {
  tier: TierKey | null;
  open: boolean;
  onClose: () => void;
};

const emptyFields = {
  fullName: "",
  instagram: "",
  goal: "",
  challenge: "",
};

function validate(fields: typeof emptyFields): string | null {
  if (!fields.fullName.trim()) return "Add your name.";
  if (!fields.goal.trim()) return "Share what you are trying to change.";
  if (!fields.challenge.trim()) return "Name what keeps repeating.";
  return null;
}

export function AssessmentModal({ tier: _tier, open, onClose }: Props) {
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
  }, [open, _tier]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const submitForm = useCallback(() => {
    const err = validate(fields);
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    const payload: WebsiteApplicationFields = {
      name: fields.fullName.trim(),
      instagram: fields.instagram.trim(),
      goal: fields.goal.trim(),
      challenge: fields.challenge.trim(),
    };

    const url = buildWebsiteApplicationWhatsAppUrl(payload);
    onClose();
    window.open(url, "_blank", "noopener,noreferrer");
  }, [fields, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={cn(
            "fixed inset-0 z-[200] flex items-center justify-center overflow-hidden p-3 sm:p-6",
            "pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          )}
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
            className="absolute inset-0 bg-black/[0.72] backdrop-blur-[6px] sm:bg-black/[0.65] sm:backdrop-blur-[10px]"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={txReveal(DURATION_OVERLAY_SLOW)}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              "ascend-surface relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[color:var(--ascend-border)]",
              "max-h-[min(calc(100dvh-1.5rem),36rem)] shadow-[0_20px_56px_-28px_rgba(0,0,0,0.55)]",
              "bg-[color:rgba(14,14,15,0.92)] backdrop-blur-md",
            )}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={txReveal(DURATION_OVERLAY_SLOW)}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.035] via-transparent to-transparent opacity-40"
              aria-hidden
            />

            <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[color:var(--ascend-border)] px-3 pb-2.5 pt-3 sm:px-4 sm:pb-3 sm:pt-4">
                <div className="min-w-0 pr-2">
                  <h2
                    id="assessment-modal-title"
                    className="text-base font-semibold tracking-tight text-white sm:text-lg"
                  >
                    Private entry
                  </h2>
                  <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 sm:text-[12px]">
                    A few honest lines. We reply personally.
                  </p>
                </div>
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="ascend-button-ghost flex size-8 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-zinc-400 transition-colors hover:border-white/[0.14] hover:text-white"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={TAP_SPRING}
                  aria-label="Close"
                >
                  <X className="size-4" />
                </motion.button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-3 py-2.5 sm:gap-2 sm:px-4 sm:py-3">
                <div>
                  <label htmlFor="app-name" className="sr-only">
                    Your name
                  </label>
                  <input
                    id="app-name"
                    className={inputClass}
                    placeholder="Your name"
                    value={fields.fullName}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, fullName: e.target.value }))
                    }
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="app-ig" className="sr-only">
                    Instagram (optional)
                  </label>
                  <input
                    id="app-ig"
                    className={inputClass}
                    placeholder="Instagram (optional)"
                    value={fields.instagram}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, instagram: e.target.value }))
                    }
                    autoComplete="username"
                  />
                </div>
                <div className="min-h-0 flex-1">
                  <label htmlFor="app-goal" className="sr-only">
                    What are you trying to change?
                  </label>
                  <textarea
                    id="app-goal"
                    rows={2}
                    className={cn(inputClass, "h-[4.25rem] resize-none")}
                    placeholder="What are you trying to change?"
                    value={fields.goal}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, goal: e.target.value }))
                    }
                  />
                </div>
                <div className="min-h-0 flex-1">
                  <label htmlFor="app-challenge" className="sr-only">
                    What keeps repeating?
                  </label>
                  <textarea
                    id="app-challenge"
                    rows={2}
                    className={cn(inputClass, "h-[4.25rem] resize-none")}
                    placeholder="What keeps repeating?"
                    value={fields.challenge}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, challenge: e.target.value }))
                    }
                  />
                </div>

                {error ? (
                  <p className="text-[11px] text-red-400/90" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>

              <div
                className={cn(
                  "relative z-10 flex shrink-0 flex-col gap-2 border-t border-[color:var(--ascend-border)] bg-ascend-elevated/90 px-3 py-2.5 backdrop-blur-sm sm:flex-row sm:justify-end sm:px-4 sm:py-3",
                )}
              >
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="h-9 rounded-full border border-white/[0.1] px-4 text-[12px] font-medium text-zinc-300 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white sm:h-10 sm:text-[13px]"
                  whileHover={{ scale: 1.012 }}
                  whileTap={{ scale: 0.988 }}
                  transition={TAP_SPRING}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  onClick={submitForm}
                  className="h-9 rounded-full bg-white px-5 text-[12px] font-medium text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_32px_-12px_rgba(255,255,255,0.18)] sm:h-10 sm:px-6 sm:text-[13px]"
                  whileHover={{ scale: 1.012 }}
                  whileTap={{ scale: 0.988 }}
                  transition={TAP_SPRING}
                >
                  {MODAL_WHATSAPP_CTA_LABEL}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
