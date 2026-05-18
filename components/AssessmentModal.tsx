"use client";

import { useCinematicScrollLock } from "@/contexts/cinematic-scroll";
import { BRAND } from "@/lib/brand/content";
import { event } from "@/lib/fpixel";
import { lockModalScroll } from "@/lib/modal-scroll-lock";
import { cn } from "@/lib/utils";
import {
  buildWebsiteApplicationWhatsAppUrl,
  MODAL_WHATSAPP_CTA_LABEL,
  type WebsiteApplicationFields,
} from "@/lib/whatsapp";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

const emptyFields = {
  name: "",
  age: "",
  instagram: "",
  needsChange: "",
};

function validate(fields: typeof emptyFields): string | null {
  if (!fields.name.trim()) return "Add your name.";
  if (!fields.age.trim()) return "Add your age.";
  if (!/^\d{1,3}$/.test(fields.age.trim())) return "Enter a valid age.";
  if (!fields.instagram.trim()) return "Add your Instagram.";
  if (!fields.needsChange.trim()) return "Tell us what needs to change.";
  return null;
}

export function AssessmentModal({ open, onClose }: Props) {
  const [fields, setFields] = useState(emptyFields);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
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
    if (open) return;
    const resetTimer = window.setTimeout(() => {
      setFields(emptyFields);
      setError(null);
    }, 0);
    return () => window.clearTimeout(resetTimer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submitForm = useCallback(() => {
    const err = validate(fields);
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    const payload: WebsiteApplicationFields = {
      name: fields.name.trim(),
      age: fields.age.trim(),
      instagram: fields.instagram.trim(),
      needsChange: fields.needsChange.trim(),
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
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        >
          <button
            type="button"
            className="apply-modal__backdrop"
            aria-label="Close screening"
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

            <div className="apply-modal__frame">
              <header className="apply-modal__header">
                <p className="apply-modal__eyebrow">Private screening</p>
                <h2 id="assessment-modal-title" className="apply-modal__title">
                  Apply
                </h2>
              </header>

              <div className="apply-modal__fields space-y-5">
                <label className="apply-modal__field" htmlFor="app-name">
                  <span className="apply-modal__label">Name</span>
                  <input
                    id="app-name"
                    className="apply-modal__input"
                    value={fields.name}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, name: e.target.value }))
                    }
                    autoComplete="name"
                  />
                </label>
                <label className="apply-modal__field" htmlFor="app-age">
                  <span className="apply-modal__label">Age</span>
                  <input
                    id="app-age"
                    className="apply-modal__input"
                    inputMode="numeric"
                    value={fields.age}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, age: e.target.value }))
                    }
                  />
                </label>
                <label className="apply-modal__field" htmlFor="app-ig">
                  <span className="apply-modal__label">Instagram</span>
                  <input
                    id="app-ig"
                    className="apply-modal__input"
                    placeholder="@username"
                    value={fields.instagram}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, instagram: e.target.value }))
                    }
                    autoComplete="username"
                  />
                </label>
                <label className="apply-modal__field" htmlFor="app-change">
                  <span className="apply-modal__label">What needs to change?</span>
                  <textarea
                    id="app-change"
                    rows={2}
                    className={cn("apply-modal__input", "apply-modal__input--area")}
                    value={fields.needsChange}
                    onChange={(e) =>
                      setFields((s) => ({ ...s, needsChange: e.target.value }))
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
                <button
                  type="button"
                  className="apply-modal__cta drop-cta w-full"
                  onClick={submitForm}
                >
                  {MODAL_WHATSAPP_CTA_LABEL}
                </button>
                <div className="apply-modal__brand">
                  <p className="apply-modal__mark">{BRAND.mark}</p>
                  <p className="apply-modal__tagline">{BRAND.tagline}</p>
                </div>
              </footer>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
