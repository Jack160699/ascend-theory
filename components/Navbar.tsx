"use client";

import { useAssessmentModal } from "@/contexts/assessment-modal";
import {
  DURATION_OPACITY,
  DURATION_OVERLAY,
  DURATION_OVERLAY_SLOW,
  DURATION_REVEAL,
  EASE_CINEMATIC,
  NAV_INLINE_HOVER_SCALE,
  NAV_INLINE_TAP_SCALE,
  TAP_SPRING,
  txReveal,
} from "@/lib/motion";
import { HERO_CTA_LABEL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const links = [
  { href: "#philosophy", label: "About" },
  { href: "#brotherhood", label: "Brotherhood" },
  { href: "#programs", label: "Outcomes" },
  { href: "#testimonials", label: "Proof" },
  { href: "#pricing", label: "Membership" },
  { href: "#assessment", label: "Apply" },
] as const;

export function Navbar() {
  const { openAssessment } = useAssessmentModal();
  const [scrolled, setScrolled] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setShowCta(y > window.innerHeight * 0.35);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback(() => setOpen(false), []);

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
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 z-[100] isolate w-full transition-[background-color,backdrop-filter,border-color,box-shadow] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
          scrolled
            ? "border-b border-[color:var(--ascend-border)] bg-[color:rgba(11,11,12,0.94)] shadow-[0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-xl backdrop-saturate-125"
            : "border-b border-transparent bg-[color:rgba(5,5,6,0.35)] backdrop-blur-md",
        )}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION_REVEAL, ease: EASE_CINEMATIC }}
      >
        <nav
          className="relative mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-3 px-4 sm:h-[4.25rem] sm:gap-4 sm:px-8 lg:px-10"
          aria-label="Primary"
        >
          <Link
            href="/"
            className="relative z-10 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:text-zinc-300"
          >
            Ascend Theory
          </Link>

          <div className="relative z-10 hidden items-center gap-6 lg:ml-auto lg:flex xl:gap-8">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative pb-0.5 text-[13px] font-medium tracking-tight text-zinc-500 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
                  "hover:text-zinc-200",
                  "after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[var(--ascend-accent)] after:opacity-80 after:transition-[width] after:duration-500 after:ease-[var(--ascend-hover-ease)]",
                  "hover:after:w-full",
                )}
              >
                <span className="relative z-10">{item.label}</span>
              </Link>
            ))}
            {showCta ? (
              <motion.button
                type="button"
                onClick={() => openAssessment()}
                className="ml-2 inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.05] px-4 text-[12px] font-medium tracking-tight text-zinc-100 transition-colors hover:border-white/[0.15] hover:bg-white/[0.08]"
                whileHover={{ scale: NAV_INLINE_HOVER_SCALE }}
                whileTap={{ scale: NAV_INLINE_TAP_SCALE }}
                transition={TAP_SPRING}
              >
                {HERO_CTA_LABEL}
              </motion.button>
            ) : null}
          </div>

          <div className="relative z-10 flex items-center lg:hidden">
            <button
              type="button"
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-white backdrop-blur-md transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
                "hover:border-white/[0.16] hover:bg-white/[0.07]",
              )}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <X className="size-[18px]" />
              ) : (
                <Menu className="size-[18px]" />
              )}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav"
            className="fixed inset-0 z-[95] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={txReveal(DURATION_OVERLAY)}
          >
            <button
              type="button"
              className="absolute inset-0 bg-ascend-canvas/88 backdrop-blur-md"
              aria-label="Close menu"
              onClick={close}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 top-0 flex flex-col border-r border-[color:var(--ascend-border)] bg-[color:rgba(11,11,12,0.98)] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[5rem]"
              initial={{ y: -5, opacity: 0.72 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              transition={txReveal(DURATION_OVERLAY_SLOW)}
            >
              <div className="flex flex-1 flex-col justify-center gap-1.5">
                {links.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={txReveal(DURATION_OPACITY, 0.08 + i * 0.055)}
                  >
                    <Link
                      href={item.href}
                      onClick={close}
                      className="ascend-surface-soft block rounded-xl border border-transparent px-3.5 py-2.5 text-[0.9375rem] font-medium tracking-tight text-zinc-300 transition-colors hover:border-[color:rgba(95,115,134,0.35)] hover:text-zinc-100"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
