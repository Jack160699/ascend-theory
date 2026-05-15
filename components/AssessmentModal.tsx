"use client";

import { WorldButton } from "@/components/landing/world/WorldButton";
import { WorldPanelAtmosphere } from "@/components/landing/world/WorldPanelAtmosphere";
import { useCinematicScrollLock } from "@/contexts/cinematic-scroll";
import { WORLD_PRICING_TIERS } from "@/lib/figma-world-content";
import type { TierKey } from "@/lib/lead-context";
import { DURATION_OVERLAY_SLOW, txReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  buildWebsiteApplicationWhatsAppUrl,
  MODAL_WHATSAPP_CTA_LABEL,
  type WebsiteApplicationFields,
} from "@/lib/whatsapp";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const tierLine = useMemo(() => tierInterestLine(tier), [tier]);

  useCinematicScrollLock(open);

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
            "world-intake-root fixed inset-0 z-[200] flex items-center justify-center overflow-hidden p-4 sm:p-6",
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
          <motion.button
            type="button"
            className="world-intake-scrim"
            aria-label="Close application"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={txReveal(DURATION_OVERLAY_SLOW)}
            onClick={onClose}
          />

          <motion.div
            className="world-intake-panel relative z-10"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={txReveal(DURATION_OVERLAY_SLOW)}
            onClick={(e) => e.stopPropagation()}
          >
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
              <p className="world-body mt-3 max-w-xs">
                A few honest lines. We respond personally.
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
                Responses are reviewed manually · No obligation
              </p>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
