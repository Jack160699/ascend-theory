"use client";

import { useAssessmentModal } from "@/contexts/assessment-modal";
import { FINAL_SECTION_CTA_LABEL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { SceneShell } from "./SceneShell";

const voices = [
  "I wanted something that would not negotiate with my standards.",
  "The shift was quieter: fewer exceptions I had to explain away.",
] as const;

export function SceneTransformation() {
  const { openAssessment } = useAssessmentModal();

  return (
    <SceneShell
      scene="transformation"
      anchorId="transformation"
      ariaLabel="Scene six — transformation"
      conversionZone="proof"
      atmosphere={
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden
          data-cinematic-parallax="9"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-ascend-surface/80 via-ascend-canvas to-ascend-surface/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_75%)]" />
        </div>
      }
    >
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-24 sm:px-10 lg:mx-auto lg:max-w-2xl">
        <p className="ascend-type-eyebrow text-zinc-500">Transformation</p>
        <h2 className="ascend-type-section-sm ascend-headline mt-8 max-w-[18ch] text-pretty">
          Proof lives in how the week closes.
        </h2>
        <div className="mt-12 space-y-8 border-l border-white/[0.08] pl-6">
          {voices.map((line) => (
            <blockquote
              key={line}
              className="ascend-prose-calm text-pretty text-zinc-400"
            >
              {line}
            </blockquote>
          ))}
        </div>
        <p className="ascend-prose-calm mt-12 max-w-lg text-zinc-500">
          Three lanes — Core, Pro, Black — one spine. Capacity is held on purpose.
        </p>
        <button
          type="button"
          onClick={() => openAssessment()}
          className={cn(
            "mt-12 inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-md border border-white/[0.12] bg-white/[0.05] px-6 text-sm font-medium text-zinc-100",
            "transition-[opacity,border-color,transform] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:border-white/[0.16] hover:opacity-95 active:scale-[0.997] sm:w-auto",
          )}
        >
          {FINAL_SECTION_CTA_LABEL}
        </button>
      </div>
    </SceneShell>
  );
}
