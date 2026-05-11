"use client";

import Link from "next/link";

const quick = [
  { href: "/#philosophy", label: "About" },
  { href: "/#brotherhood", label: "Brotherhood" },
  { href: "/#programs", label: "Outcomes" },
  { href: "/#pricing", label: "Membership" },
  { href: "/#testimonials", label: "Proof" },
] as const;

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refunds", label: "Refunds" },
] as const;

export function Footer() {
  return (
    <footer
      id="site-footer"
      className="ascend-section-world relative overflow-hidden border-t border-[color:var(--ascend-border)] bg-ascend-surface px-6 py-9 sm:px-10 sm:py-12 lg:pl-14 lg:pr-12 lg:py-14"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-ascend-canvas/35 via-transparent to-transparent"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10 lg:gap-12">
        <div className="max-w-md">
          <p className="ascend-type-eyebrow text-zinc-600">Ascend Theory</p>
          <p className="ascend-prose-calm mt-4 text-zinc-600">
            Private mentorship — selective intake, manual review, serious room
            only.
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-8 gap-y-3 sm:justify-end"
        >
          {quick.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[12px] font-medium tracking-[0.02em] text-zinc-600 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:text-zinc-300"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="relative z-10 mx-auto mt-10 max-w-6xl border-t border-[color:var(--ascend-border)] pt-6 sm:mt-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <p
            className="text-left text-[11px] leading-relaxed text-zinc-700"
            suppressHydrationWarning
          >
            © {new Date().getFullYear()} Ascend Theory. Mentor capacity intentionally
            limited.
          </p>
          <nav
            aria-label="Legal and policies"
            className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-[11px] tracking-[0.02em] text-zinc-700"
          >
            {legal.map((item, i) => (
              <span key={item.href} className="inline-flex items-center">
                {i > 0 ? (
                  <span className="px-1.5 text-zinc-800 select-none" aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link
                  href={item.href}
                  className="text-zinc-600 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:text-zinc-400"
                >
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
