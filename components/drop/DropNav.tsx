"use client";

import { CartNavButton } from "@/components/cart/CartNavButton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

export function DropNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[100] transition-[background-color,border-color] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]",
        scrolled
          ? "border-b border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        className="drop-shell flex h-[4.25rem] items-center justify-between sm:h-[4.5rem]"
        aria-label="Drop"
      >
        <Link
          href="/"
          className="text-[12px] font-medium tracking-[0.08em] text-white/45 transition-colors hover:text-white/80"
        >
          ← Ascend Theory
        </Link>
        <div className="flex items-center gap-5">
          <p className="brand-mark hidden text-white/35 sm:block">Limited Release</p>
          <CartNavButton />
        </div>
      </nav>
    </header>
  );
}
