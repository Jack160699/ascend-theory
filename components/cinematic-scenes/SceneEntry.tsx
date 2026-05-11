"use client";

import { useAssessmentModal } from "@/contexts/assessment-modal";
import { FINAL_SECTION_CTA_LABEL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { SceneNarrativeEnvironment } from "./SceneNarrativeEnvironment";
import { SceneShell } from "./SceneShell";

export function SceneEntry() {
  const { openAssessment } = useAssessmentModal();

  return (
    <SceneShell
      scene="entry"
      anchorId="entry"
      ariaLabel="Scene seven — entry"
      conversionZone="final"
      atmosphere={<SceneNarrativeEnvironment scene="entry" />}
    >
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-28 sm:px-10 lg:max-w-2xl lg:pl-16">
        <p className="ascend-type-eyebrow text-zinc-500">Entry</p>
        <h2 className="ascend-type-section-sm ascend-headline mt-10 max-w-[14ch] text-pretty sm:mt-12">
          If it holds, the door opens.
        </h2>
        <div className="ascend-narrative-stack ascend-after-scene-headline max-w-md text-zinc-400">
          <p className="ascend-prose-lede text-pretty text-zinc-300">
            One application. Read by hand.
          </p>
          <p className="ascend-prose-fragment text-zinc-500">
            If it is not a fit, that is information too — without theatre.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openAssessment()}
          className={cn(
            "mt-16 inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-md bg-white px-6 text-sm font-medium text-zinc-950 sm:mt-[max(4rem,5vh)]",
            "transition-[opacity,transform] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:opacity-95 active:scale-[0.997] sm:w-auto",
          )}
        >
          {FINAL_SECTION_CTA_LABEL}
        </button>
      </div>
    </SceneShell>
  );
}
