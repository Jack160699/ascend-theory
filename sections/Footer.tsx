"use client";

import Link from "next/link";

const quick = [
  { href: "#philosophy", label: "Philosophy" },
  { href: "#programs", label: "Method" },
  { href: "#pricing", label: "Entry" },
  { href: "#mentorship-depth", label: "Depth" },
  { href: "#testimonials", label: "Proof" },
] as const;

export function Footer() {
  return (
    <footer
      id="site-footer"
      className="border-t border-white/[0.06] bg-black px-6 py-14 sm:px-10 lg:px-12"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500">
            Ascend Theory
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-600">
            Private transformation architecture · identity-grade accountability
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
          {quick.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-300"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-white/[0.05] pt-8">
        <p className="text-center text-[11px] text-zinc-700">
          © {new Date().getFullYear()} Ascend Theory. Reserved mentor capacity.
        </p>
      </div>
    </footer>
  );
}
