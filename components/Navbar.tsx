"use client";

import { useConversionExperienceOptional } from "@/contexts/conversion-experience";
import {
  DURATION_OPACITY,
  DURATION_OVERLAY,
  DURATION_OVERLAY_SLOW,
  DURATION_REVEAL,
  EASE_CINEMATIC,
  TAP_SPRING,
  txReveal,
} from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "#about", label: "About" },
  { href: "#philosophy", label: "Philosophy" },
  { href: "#journey", label: "Journey" },
  { href: "#programs", label: "Method" },
  { href: "#mentorship-depth", label: "Depth" },
  { href: "#assessment", label: "Assessment" },
  { href: "#testimonials", label: "Proof" },
  {
    href: "#pricing",
    label: "Entry",
    ariaLabel: "Allocation and structured entry",
  },
] as const;

export function Navbar() {
  const conversion = useConversionExperienceOptional();
  const ctaLabel = conversion?.primaryCtaLabel ?? "Pricing & apply";
  const notice = conversion?.urgencyMessage ?? "";

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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
          "fixed top-0 z-50 w-full transition-[background-color,backdrop-filter,border-color,box-shadow] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
          scrolled
            ? "border-b border-white/[0.06] bg-zinc-950/45 shadow-[0_12px_48px_-12px_rgba(0,0,0,0.65)] backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent bg-transparent",
        )}
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION_REVEAL, ease: EASE_CINEMATIC }}
      >
        <nav
          className="relative mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-3 px-4 sm:h-[4.25rem] sm:gap-4 sm:px-8 lg:px-10"
          aria-label="Primary"
        >
          <Link
            href="/"
            className="relative z-10 text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-400 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:text-zinc-300"
          >
            Ascend Theory
          </Link>

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 hidden w-[min(20rem,calc(100vw-14rem))] -translate-x-1/2 -translate-y-1/2 lg:block">
            <AnimatePresence mode="wait">
              {notice ? (
                <motion.p
                  key={notice}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={txReveal(DURATION_OPACITY)}
                  className="truncate text-center text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600"
                >
                  {notice}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="relative z-10 hidden items-center gap-10 lg:flex">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={"ariaLabel" in item ? item.ariaLabel : undefined}
                className={cn(
                  "group relative text-[13px] font-medium tracking-tight text-zinc-400 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
                  "hover:text-zinc-200",
                )}
              >
                <span className="relative z-10">{item.label}</span>
                <span
                  className={cn(
                    "pointer-events-none absolute -inset-x-3 -inset-y-2 rounded-lg opacity-0 shadow-[0_0_40px_-2px_rgba(255,255,255,0.14)] transition-opacity duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
                    "group-hover:opacity-[0.72]",
                  )}
                  aria-hidden
                />
              </Link>
            ))}
          </div>

          <div className="relative z-10 flex items-center gap-3 sm:gap-4">
            <motion.div
              whileHover={{ scale: 1.012 }}
              whileTap={{ scale: 0.988 }}
              transition={TAP_SPRING}
            >
              <Link
                href="#pricing"
                aria-label={ctaLabel}
                className={cn(
                  "ascend-button-primary relative inline-flex max-w-[9rem] overflow-hidden rounded-full px-3.5 py-2.5 text-center text-[10px] font-medium leading-tight tracking-tight text-zinc-950 sm:max-w-[16rem] sm:px-5 sm:text-[12px] sm:leading-snug lg:max-w-[18rem] lg:text-[12px]",
                  "bg-white",
                )}
              >
                <span className="sm:hidden">Request</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={ctaLabel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={txReveal(DURATION_OVERLAY)}
                    className="hidden max-w-full truncate sm:inline"
                  >
                    {ctaLabel}
                  </motion.span>
                </AnimatePresence>
              </Link>
            </motion.div>

            <button
              type="button"
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-white backdrop-blur-md transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
                "hover:border-white/[0.16] hover:bg-white/[0.07] lg:hidden",
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
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={txReveal(DURATION_OVERLAY)}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
              aria-label="Close menu"
              onClick={close}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 top-0 flex flex-col bg-zinc-950/94 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[5.75rem]"
              initial={{ y: -8, opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={txReveal(DURATION_OVERLAY_SLOW)}
            >
              <div className="flex flex-1 flex-col justify-center gap-2.5">
                {links.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={txReveal(DURATION_OPACITY, 0.08 + i * 0.06)}
                  >
                    <Link
                      href={item.href}
                      onClick={close}
                      className="ascend-surface-soft block rounded-xl px-4 py-4 text-[1.06rem] font-medium tracking-tight text-zinc-200 transition-colors hover:border-white/[0.12] hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={txReveal(DURATION_OPACITY, 0.22)}
              >
                <Link
                  href="#pricing"
                  onClick={close}
                  aria-label={ctaLabel}
                  className="ascend-button-primary flex min-h-12 w-full max-w-full items-center justify-center rounded-full bg-white px-4 py-3 text-center text-[12px] font-medium leading-snug tracking-tight text-zinc-950"
                >
                  <span className="line-clamp-2">{ctaLabel}</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
