"use client";

import {
  DURATION_OPACITY,
  DURATION_OVERLAY,
  DURATION_OVERLAY_SLOW,
  DURATION_REVEAL,
  EASE_CINEMATIC,
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
  { href: "#assessment", label: "Assessment" },
  { href: "#testimonials", label: "Proof" },
  {
    href: "#pricing",
    label: "View pricing",
    ariaLabel: "Allocation and structured entry",
  },
] as const;

export function Navbar() {
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
            ? "border-b border-[color:var(--ascend-border)] bg-[color:rgba(11,11,12,0.94)] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl backdrop-saturate-125"
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
            className="relative z-10 text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:text-zinc-300"
          >
            Ascend Theory
          </Link>

          <div className="relative z-10 hidden items-center gap-8 lg:ml-auto lg:flex xl:gap-10">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-label={"ariaLabel" in item ? item.ariaLabel : undefined}
                className={cn(
                  "group relative pb-0.5 text-[13px] font-medium tracking-tight text-zinc-500 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)]",
                  "hover:text-zinc-200",
                  "after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:rounded-full after:bg-[var(--ascend-accent)] after:opacity-80 after:transition-[width] after:duration-300 after:ease-[var(--ascend-hover-ease)]",
                  "hover:after:w-full",
                )}
              >
                <span className="relative z-10">{item.label}</span>
              </Link>
            ))}
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
            className="fixed inset-0 z-40 lg:hidden"
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
              initial={{ y: -8, opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={txReveal(DURATION_OVERLAY_SLOW)}
            >
              <div className="flex flex-1 flex-col justify-center gap-1.5">
                {links.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={txReveal(DURATION_OPACITY, 0.06 + i * 0.04)}
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
