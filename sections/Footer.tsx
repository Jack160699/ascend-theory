"use client";

import { useAssessmentModal } from "@/contexts/assessment-modal";
import { PRIMARY_CTA_LABEL } from "@/lib/whatsapp";
import Link from "next/link";

const quick = [
  { href: "#philosophy", label: "Philosophy" },
  { href: "#programs", label: "Method" },
  { href: "#pricing", label: "View pricing" },
  { href: "#mentorship-depth", label: "Depth" },
  { href: "#testimonials", label: "Proof" },
] as const;

export function Footer() {
  const { openAssessment } = useAssessmentModal();
  return (
    <footer
      id="site-footer"
      className="ascend-section-world relative overflow-hidden border-t border-white/[0.045] bg-black px-6 py-10 sm:px-10 sm:py-16 lg:pl-14 lg:pr-12 lg:py-22"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#050505]/45 via-transparent to-transparent"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10 lg:gap-12">
        <div className="max-w-sm">
          <p className="ascend-type-eyebrow text-zinc-500">Ascend Theory</p>
          <p className="mt-4 text-sm leading-[1.72] text-zinc-600 sm:leading-[1.75]">
            Private transformation architecture · selective accountability
            environment
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-7 gap-y-3.5 sm:justify-end"
        >
          {quick.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium tracking-tight text-zinc-500 transition-colors hover:text-zinc-300"
            >
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => openAssessment()}
            className="rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-[13px] font-medium tracking-tight text-zinc-300 transition-colors hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white"
          >
            {PRIMARY_CTA_LABEL}
          </button>
        </nav>
      </div>
      <div className="relative z-10 mx-auto mt-14 max-w-6xl border-t border-white/[0.05] pt-8 sm:mt-16">
        <p
          className="text-left text-[11px] leading-relaxed text-zinc-700 sm:text-right"
          suppressHydrationWarning
        >
          © {new Date().getFullYear()} Ascend Theory. Mentor capacity intentionally
          limited.
        </p>
      </div>
    </footer>
  );
}
