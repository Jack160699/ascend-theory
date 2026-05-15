"use client";

import { WorldButton } from "@/components/landing/world/WorldButton";
import { WorldPanelAtmosphere } from "@/components/landing/world/WorldPanelAtmosphere";
import { useCinematicScrollLock } from "@/contexts/cinematic-scroll";
import { WORLD_PRICING_TIERS } from "@/lib/figma-world-content";
import type { TierKey } from "@/lib/lead-context";
import { event } from "@/lib/fpixel";
import { lockModalScroll } from "@/lib/modal-scroll-lock";
import { DURATION_OVERLAY_SLOW, txReveal } from "@/lib/motion";
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

  /* eslint-disable react-hooks/set-state-in-effect -- portal requires document.body */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!open) return;
    return lockModalScroll();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const main = document.getElementById("ascend-main");
    const footer = document.getElementById("site-footer");
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");
    main?.setAttribute("aria-hidden", "true");
    footer?.setAttribute("aria-hidden", "true");

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      main?.removeAttribute("aria-hidden");
      footer?.removeAttribute("aria-hidden");
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

    const payload: WebsiteApplicationFields = {
      name: fields.fullName.trim(),
      instagram: fields.instagram.trim(),
      goal: fields.goal.trim(),
      challenge: fields.challenge.trim(),
    };

    /* Meta Pixel — qualified lead captured; WhatsApp is the exit contact surface. */
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
          className={cn(
            "world-intake-root",
            "fixed inset-0 flex items-center justify-center overflow-hidden p-4 sm:p-6",
            "pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]",
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="assessment-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={txReveal(DURATION_OVERLAY_SLOW)}
        >
          <div className="world-intake-backdrop" aria-hidden>
            <div className="world-intake-backdrop-blur" />
            <div className="world-intake-backdrop-dim" />
            <div className="world-intake-backdrop-vignette" />
            <div className="world-intake-backdrop-warm" />
            <div className="world-intake-backdrop-grain" />
          </div>

          <motion.button
            type="button"
            className="world-intake-scrim-hit"
            aria-label="Close application"
            onClick={onClose}
          />

          <motion.div
            className="world-intake-panel"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={txReveal(DURATION_OVERLAY_SLOW)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="world-intake-panel-base" aria-hidden />
            <WorldPanelAtmosphere grid="fine" vignette />
            <div className="world-intake-panel-edge" aria-hidden />

            <button
              type="button"
              className="world-intake-close"
              onClick={onClose}
              aria-label="Close"
            >
              Close
            </button>

            <header className="world-intake-header">
              <p className="world-brand-mark">ASCEND THEORY</p>
              <p className="world-eyebrow mt-4">Private screening</p>
              <h2 id="assessment-modal-title" className="world-intake-display">
                Your application
              </h2>
            <p className="world-intake-lead mt-3 max-w-xs">
              Sparse fields — maximum signal. Answers read before any reply.
            </p>
              {tierLine ? <p className="world-intake-tier">{tierLine}</p> : null}
            </header>

            <div className="world-intake-body">
              <div className="world-intake-fields">
                <div className="world-intake-field">
                  <label htmlFor="app-name" className="world-intake-label">
                    Name
                  </label>
                  <input
                    id="app-name"
                    className="world-intake-input"
                    placeholder="Your name"
                    value={fields.fullName}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, fullName: e.target.value }))
                    }
                    autoComplete="name"
                  />
                </div>
                <div className="world-intake-field">
                  <label htmlFor="app-ig" className="world-intake-label">
                    Instagram
                  </label>
                  <input
                    id="app-ig"
                    className="world-intake-input"
                    placeholder="Optional"
                    value={fields.instagram}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, instagram: e.target.value }))
                    }
                    autoComplete="username"
                  />
                </div>
                <div className="world-intake-field">
                  <label htmlFor="app-goal" className="world-intake-label">
                    Direction
                  </label>
                  <textarea
                    id="app-goal"
                    rows={3}
                    className={cn("world-intake-input", "world-intake-input--area")}
                    placeholder="What are you trying to change?"
                    value={fields.goal}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, goal: e.target.value }))
                    }
                  />
                </div>
                <div className="world-intake-field">
                  <label htmlFor="app-challenge" className="world-intake-label">
                    Pattern
                  </label>
                  <textarea
                    id="app-challenge"
                    rows={3}
                    className={cn("world-intake-input", "world-intake-input--area")}
                    placeholder="What keeps repeating?"
                    value={fields.challenge}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, challenge: e.target.value }))
                    }
                  />
                </div>
              </div>

              {error ? (
                <p className="world-intake-error" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <footer className="world-intake-footer">
              <div className="world-intake-footer-actions">
                <WorldButton
                  variant="solid"
                  className="world-btn-solid--intake"
                  onClick={submitForm}
                >
                  {MODAL_WHATSAPP_CTA_LABEL}
                </WorldButton>
                <button
                  type="button"
                  className="world-intake-dismiss"
                  onClick={onClose}
                >
                  Return to experience
                </button>
              </div>
              <p className="world-intake-footnote">
                Manual review · No obligation to respond if misaligned
              </p>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
