"use client";

import { BRAND_NAV, BRAND_ROUTES } from "@/lib/brand/routes";
import Link from "next/link";
import { usePathname } from "next/navigation";

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refunds", label: "Refunds" },
] as const;

export function Footer() {
  const pathname = usePathname();
  const isPortalHome = pathname === "/";
  if (isPortalHome) return null;

  return (
    <footer
      id="site-footer"
      className="border-t border-white/[0.06] bg-[#0a0a0a] px-5 py-12 sm:py-14"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href={BRAND_ROUTES.home} className="brand-mark text-white/45 hover:text-white/70">
            ASCEND THEORY
          </Link>
          <p className="brand-prose-tight mt-4 max-w-xs normal-case tracking-normal text-white/35">
            Luxury in motion. Built for the focused.
          </p>
        </div>

        <nav
          aria-label="Site"
          className="flex flex-wrap items-center gap-8 text-[12px] font-medium tracking-[0.06em] text-white/40"
        >
          {BRAND_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-white/75"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p
          className="text-[10px] font-light tracking-[0.08em] text-white/28"
          suppressHydrationWarning
        >
          © {new Date().getFullYear()} Ascend Theory
        </p>
        <nav
          aria-label="Legal"
          className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-white/35"
        >
          {legal.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-white/60"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
