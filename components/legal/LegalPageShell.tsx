import Link from "next/link";
import type { ReactNode } from "react";
import { shellLegal } from "@/lib/editorial-layout";
import { LegalPageMotion } from "./LegalPageMotion";

type LegalPageShellProps = {
  title: string;
  updatedLabel: string;
  children: ReactNode;
};

export function LegalPageShell({
  title,
  updatedLabel,
  children,
}: LegalPageShellProps) {
  return (
    <main className="ascend-main-depth min-h-screen overflow-x-clip bg-ascend-canvas pb-[max(3.25rem,env(safe-area-inset-bottom)+2.75rem)] text-white antialiased sm:pb-16 lg:pb-20">
      <LegalPageMotion>
        <article className={shellLegal}>
          <p className="ascend-type-eyebrow text-zinc-600">
            <Link
              href="/"
              className="text-zinc-500 transition-colors duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:text-zinc-300"
            >
              Ascend Theory
            </Link>
          </p>
          <h1 className="ascend-type-section-sm ascend-headline mt-10 max-w-[18ch] text-pretty sm:mt-12">
            {title}
          </h1>
          <p className="ascend-type-eyebrow mt-6 text-zinc-700">{updatedLabel}</p>
          <div className="mt-14 border-t border-[color:var(--ascend-border)] pt-12">
            {children}
          </div>
        </article>
      </LegalPageMotion>
    </main>
  );
}
