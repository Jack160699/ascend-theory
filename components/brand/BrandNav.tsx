"use client";

import { useAssessmentModal } from "@/contexts/assessment-modal";
import { BRAND_NAV } from "@/lib/brand/sections";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

export function BrandNav() {
  const { openAssessment } = useAssessmentModal();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[100] transition-[background-color,border-color] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]",
          scrolled
            ? "border-b border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          className="brand-shell flex h-[4.25rem] items-center justify-between sm:h-[4.5rem]"
          aria-label="Primary"
        >
          <Link href="/" className="brand-mark text-white/50 hover:text-white/80">
            ASCEND THEORY
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {BRAND_NAV.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                className="text-[12px] font-medium tracking-[0.06em] text-white/45 transition-colors hover:text-white/85"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => openAssessment()}
              className="text-[12px] font-medium tracking-[0.06em] text-white/75 transition-opacity hover:opacity-80"
            >
              Apply
            </button>
          </div>

          <button
            type="button"
            className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/55 lg:hidden"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </nav>
      </header>

      {open ? (
        <div
          className="fixed inset-0 z-[95] bg-[#0a0a0a]/96 backdrop-blur-sm lg:hidden"
          role="dialog"
          aria-modal
        >
          <div className="flex min-h-full flex-col justify-center gap-6 px-8">
            {BRAND_NAV.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="text-2xl font-medium tracking-tight text-white/90"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openAssessment();
              }}
              className="mt-4 text-left text-sm font-medium tracking-wide text-white/55"
            >
              Private application
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
