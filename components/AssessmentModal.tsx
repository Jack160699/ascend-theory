"use client";

import {
  useIsMobileConversion,
} from "@/contexts/mobile-conversion";
import { cn } from "@/lib/utils";
import type { TierKey } from "@/lib/lead-context";
import {
  DURATION_OVERLAY_SLOW,
  TAP_SPRING,
  txReveal,
} from "@/lib/motion";
import {
  buildWebsiteApplicationWhatsAppUrl,
  type WebsiteApplicationFields,
} from "@/lib/whatsapp";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const inputClass = cn(
  "w-full rounded-xl border border-[color:var(--ascend-border)] bg-ascend-elevated/90 px-3.5 py-2.5 text-[13px] text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition-[border-color,box-shadow] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] sm:px-4 sm:py-3 sm:text-sm",
  "placeholder:text-zinc-600 focus:border-[color:rgba(95,115,134,0.45)] focus:shadow-[0_0_0_1px_var(--ascend-accent-glow),0_0_28px_-8px_var(--ascend-accent-glow)]",
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
  const isMobile = useIsMobileConversion();
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
            "fixed inset-0 z-[200] flex",
            isMobile
              ? "items-stretch justify-stretch"
              : "items-center justify-center p-4 sm:p-6",
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
            className="absolute inset-0 bg-black/[0.78] backdrop-blur-sm sm:bg-black/[0.68] sm:backdrop-blur-md"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={txReveal(DURATION_OVERLAY_SLOW)}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              "ascend-surface relative z-10 flex w-full flex-col overflow-hidden border border-[color:var(--ascend-border)] shadow-[0_20px_64px_-28px_rgba(0,0,0,0.55)]",
              isMobile
                ? "h-[100dvh] max-h-[100dvh] rounded-none"
                : "max-h-[min(28rem,calc(100dvh-2rem))] max-w-md rounded-2xl",
            )}
            initial={{ opacity: 0, y: isMobile ? 0 : 16, scale: isMobile ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isMobile ? 0 : 10, scale: isMobile ? 1 : 0.99 }}
            transition={txReveal(DURATION_OVERLAY_SLOW)}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent opacity-50"
              aria-hidden
            />

            <div
              className={cn(
                "relative z-10 flex min-h-0 flex-1 flex-col",
                isMobile ? "pt-[max(0.75rem,env(safe-area-inset-top))]" : "",
              )}
            >
              <div
                className={cn(
                  "flex shrink-0 items-start justify-between gap-3 border-b border-[color:var(--ascend-border)] px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5",
                )}
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-zinc-500">
                    Ascend Theory
                  </p>
                  <h2
                    id="assessment-modal-title"
                    className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl"
                  >
                    Private application
                  </h2>
                  <p className="mt-1 max-w-md text-[11px] leading-snug text-zinc-500 sm:text-[12px] sm:leading-relaxed">
                    A few lines — we read everything before we reply.
                  </p>
                </div>
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="ascend-button-ghost flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-white sm:size-10"
                  whileHover={{ scale: 1.012 }}
                  whileTap={{ scale: 0.988 }}
                  transition={TAP_SPRING}
                  aria-label="Close"
                >
                  <X className="size-[17px]" />
                </motion.button>
              </div>

              <div
                className={cn(
                  "flex min-h-0 flex-1 flex-col gap-2.5 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4",
                  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                  isMobile ? "overflow-y-auto overscroll-contain" : "overflow-hidden",
                )}
              >
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
                <div>
                  <label htmlFor="app-goal" className="sr-only">
                    What are you trying to change?
                  </label>
                  <textarea
                    id="app-goal"
                    rows={2}
                    className={cn(inputClass, "resize-none leading-snug")}
                    placeholder="What are you trying to change?"
                    value={fields.goal}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, goal: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="app-challenge" className="sr-only">
                    What keeps repeating?
                  </label>
                  <textarea
                    id="app-challenge"
                    rows={2}
                    className={cn(inputClass, "resize-none leading-snug")}
                    placeholder="What keeps repeating?"
                    value={fields.challenge}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, challenge: e.target.value }))
                    }
                  />
                </div>

                {error ? (
                  <p
                    className="text-[12px] text-red-400/90"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
              </div>

              <div
                className={cn(
                  "relative z-10 flex shrink-0 flex-col gap-2 border-t border-[color:var(--ascend-border)] bg-ascend-elevated/95 px-4 py-3 backdrop-blur-md sm:flex-row sm:justify-end sm:gap-3 sm:px-6 sm:py-4",
                  "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
                )}
              >
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-full border border-white/[0.1] px-4 text-[13px] font-medium text-zinc-300 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:border-white/[0.16] hover:bg-white/[0.04] hover:text-white sm:h-11 sm:px-5 sm:text-sm"
                  whileHover={{ scale: 1.012 }}
                  whileTap={{ scale: 0.988 }}
                  transition={TAP_SPRING}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  onClick={submitForm}
                  className="h-10 rounded-full bg-white px-6 text-[13px] font-medium text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_-12px_rgba(255,255,255,0.2)] sm:h-11 sm:px-7 sm:text-sm"
                  whileHover={{ scale: 1.012 }}
                  whileTap={{ scale: 0.988 }}
                  transition={TAP_SPRING}
                >
                  Request private entry
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
