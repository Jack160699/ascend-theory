"use client";

import Link from "next/link";

const quick = [
  { href: "#philosophy", label: "About" },
  { href: "#programs", label: "Outcomes" },
  { href: "#pricing", label: "Membership" },
  { href: "#testimonials", label: "Proof" },
] as const;

export function Footer() {
  return (
    <footer
      id="site-footer"
      className="ascend-section-world relative overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-surface px-5 py-7 sm:px-10 sm:py-12 lg:pl-14 lg:pr-12 lg:py-14"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-ascend-canvas/35 via-transparent to-transparent"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8 lg:gap-10">
        <div className="max-w-sm">
          <p className="ascend-type-eyebrow text-zinc-600">Ascend Theory</p>
          <p className="mt-3 text-sm leading-[1.72] text-zinc-600 sm:leading-[1.75]">
            Private mentorship — selective intake, manual review, serious room
            only.
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-6 gap-y-2.5 sm:justify-end"
        >
          {quick.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium tracking-tight text-zinc-600 transition-colors hover:text-[color:var(--ascend-accent)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="relative z-10 mx-auto mt-8 max-w-6xl border-t border-[color:var(--ascend-border)] pt-5 sm:mt-10">
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
