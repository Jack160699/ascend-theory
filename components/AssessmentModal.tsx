"use client";

import { useCinematicScrollLock } from "@/contexts/cinematic-scroll";
import { WORLD_PRICING_TIERS } from "@/lib/figma-world-content";
import type { TierKey } from "@/lib/lead-context";
import { event } from "@/lib/fpixel";
import { lockModalScroll } from "@/lib/modal-scroll-lock";
import { cn } from "@/lib/utils";
import {
  buildWebsiteApplicationWhatsAppUrl,
  MODAL_WHATSAPP_CTA_LABEL,
  type WebsiteApplicationFields,
} from "@/lib/whatsapp";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

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

function tierInterestLine(tier: TierKey | null): string | null {
  if (!tier) return null;
  const match = WORLD_PRICING_TIERS.find((t) => t.key === tier);
  return match ? `Interest · ${match.name}` : null;
}

export function AssessmentModal({ tier, open, onClose }: Props) {
  const [fields, setFields] = useState(emptyFields);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const tierLine = useMemo(() => tierInterestLine(tier), [tier]);
  useCinematicScrollLock(open);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    return lockModalScroll();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

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

    event("Lead", { content_name: "website_application_submitted" });
    event("Contact", { content_name: "whatsapp_handoff_clicked" });

    const url = buildWebsiteApplicationWhatsAppUrl(payload);
    onClose();
    window.open(url, "_blank", "noopener,noreferrer");
  }, [fields, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="apply-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assessment-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
        >
          <button
            type="button"
            className="apply-modal__backdrop"
            aria-label="Close application"
            onClick={onClose}
          />

          <div className="apply-modal__panel">
            <button
              type="button"
              className="apply-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              Close
            </button>

            <div className="apply-modal__content">
              <header className="apply-modal__header">
                <p className="brand-mark text-white/45">ASCEND THEORY</p>
                <p className="brand-eyebrow mt-4">Private screening</p>
                <h2 id="assessment-modal-title" className="brand-headline mt-6">
                  Your application
                </h2>
                <p className="brand-body mt-4 max-w-md">
                  Sparse fields — maximum signal. Answers read before any reply.
                </p>
                {tierLine ? (
                  <p className="brand-prose-tight mt-3 uppercase tracking-[0.18em]">
                    {tierLine}
                  </p>
                ) : null}
              </header>

              <div className="apply-modal__fields">
                <label className="apply-modal__field" htmlFor="app-name">
                  <span className="apply-modal__label">Name</span>
                  <input
                    id="app-name"
                    className="apply-modal__input"
                    placeholder="Your name"
                    value={fields.fullName}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, fullName: e.target.value }))
                    }
                    autoComplete="name"
                  />
                </label>
                <label className="apply-modal__field" htmlFor="app-ig">
                  <span className="apply-modal__label">Instagram</span>
                  <input
                    id="app-ig"
                    className="apply-modal__input"
                    placeholder="Optional"
                    value={fields.instagram}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, instagram: e.target.value }))
                    }
                    autoComplete="username"
                  />
                </label>
                <label className="apply-modal__field" htmlFor="app-goal">
                  <span className="apply-modal__label">Direction</span>
                  <textarea
                    id="app-goal"
                    rows={3}
                    className={cn("apply-modal__input", "apply-modal__input--area")}
                    placeholder="What are you trying to change?"
                    value={fields.goal}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, goal: e.target.value }))
                    }
                  />
                </label>
                <label className="apply-modal__field" htmlFor="app-challenge">
                  <span className="apply-modal__label">Pattern</span>
                  <textarea
                    id="app-challenge"
                    rows={3}
                    className={cn("apply-modal__input", "apply-modal__input--area")}
                    placeholder="What keeps repeating?"
                    value={fields.challenge}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, challenge: e.target.value }))
                    }
                  />
                </label>

                {error ? (
                  <p className="apply-modal__error" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>

              <footer className="apply-modal__footer">
                <button type="button" className="drop-cta w-full" onClick={submitForm}>
                  {MODAL_WHATSAPP_CTA_LABEL}
                </button>
                <button
                  type="button"
                  className="apply-modal__dismiss"
                  onClick={onClose}
                >
                  Return
                </button>
              </footer>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
