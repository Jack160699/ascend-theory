"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refunds", label: "Refunds" },
] as const;

export function Footer() {
  const pathname = usePathname();
  const isWorldHome = pathname === "/";

  return (
    <footer
      id="site-footer"
      className="border-t border-white/[0.06] bg-[#0d0d0d] px-5 py-10"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="world-brand-mark text-white/40">ASCEND THEORY</p>
          {!isWorldHome ? (
            <p className="mt-3 text-[11px] font-light leading-relaxed text-white/35">
              Private transformation architecture.
            </p>
          ) : null}
        </div>
        <nav
          aria-label="Legal"
          className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-light tracking-wide text-white/40"
        >
          {legal.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-white/65"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <p
        className="mx-auto mt-8 max-w-2xl text-center text-[10px] font-light tracking-[0.08em] text-white/25"
        suppressHydrationWarning
      >
        © {new Date().getFullYear()} Ascend Theory
      </p>
    </footer>
  );
}
