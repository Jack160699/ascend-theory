"use client";

import { useAssessmentModal } from "@/contexts/assessment-modal";
import { FINAL_SECTION_CTA_LABEL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { SceneShell } from "./SceneShell";

export function SceneEntry() {
  const { openAssessment } = useAssessmentModal();

  return (
    <SceneShell
      scene="entry"
      anchorId="entry"
      ariaLabel="Scene seven — entry"
      conversionZone="final"
      atmosphere={
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden
          data-cinematic-parallax="10"
        >
          <div className="absolute inset-0 bg-ascend-surface" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.04),transparent_55%)]" />
        </div>
      }
    >
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-24 sm:px-10 lg:max-w-2xl lg:pl-16">
        <p className="ascend-type-eyebrow text-zinc-500">Entry</p>
        <h2 className="ascend-type-section-sm ascend-headline mt-8 max-w-[16ch] text-pretty">
          If the fit is real, we open the door.
        </h2>
        <p className="ascend-prose-lede mt-10 max-w-lg text-pretty text-zinc-400">
          One application. Manual read. No funnel theatre — just a direct line
          into the room.
        </p>
        <button
          type="button"
          onClick={() => openAssessment()}
          className={cn(
            "mt-14 inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-md bg-white px-6 text-sm font-medium text-zinc-950",
            "transition-[opacity,transform] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:opacity-95 active:scale-[0.997] sm:w-auto",
          )}
        >
          {FINAL_SECTION_CTA_LABEL}
        </button>
      </div>
    </SceneShell>
  );
}
