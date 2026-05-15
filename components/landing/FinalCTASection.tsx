"use client";

import { WorldButton } from "@/components/landing/world/WorldButton";
import { useAssessmentModal } from "@/contexts/assessment-modal";

const BULLETS = [
  "Daily structured routines",
  "Weekly accountability calls",
  "Private curated community",
] as const;

export function FinalCTASection() {
  const { openAssessment } = useAssessmentModal();

  return (
    <section
      id="apply"
      data-conversion-zone="final"
      className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#0d0d0d] px-5 py-32"
      aria-labelledby="final-cta-heading"
    >
      <div
        className="world-dot-grid world-dot-grid--fine pointer-events-none absolute inset-0 opacity-[0.015]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 45%, rgba(255, 220, 180, 0.12) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-lg text-center">
        <p className="world-brand-mark mb-12">ASCEND THEORY</p>
        <p className="mb-10 text-xs font-light uppercase tracking-[0.12em] text-white/55">
          A Structured Environment for Men
        </p>

        <h2 id="final-cta-heading" className="world-display world-display--cta mb-7">
          Ready to
          <br />
          rebuild yourself?
        </h2>

        <p className="world-body mx-auto mb-10 max-w-md">
          We help ambitious men build discipline,
          <br />
          accountability, and confidence through
          <br />
          structured systems and brotherhood.
        </p>

        <ul className="mx-auto mb-12 max-w-sm space-y-2.5 text-left">
          {BULLETS.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span
                className="mt-1.5 size-1 shrink-0 rounded-full bg-white/40"
                aria-hidden
              />
              <span className="world-body--muted">{item}</span>
            </li>
          ))}
        </ul>

        <WorldButton variant="solid-cta" onClick={() => openAssessment()}>
          APPLY NOW
        </WorldButton>

        <p className="mt-5 text-[10px] font-light tracking-[0.08em] text-white/35">
          Limited spaces · Application required
        </p>
      </div>

      <p
        className="absolute bottom-10 text-[7px] font-light tracking-[0.35em] text-white/12"
        suppressHydrationWarning
      >
        © {new Date().getFullYear()}
      </p>
    </section>
  );
}
