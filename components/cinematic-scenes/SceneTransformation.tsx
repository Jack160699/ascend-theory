"use client";

import { useAssessmentModal } from "@/contexts/assessment-modal";
import { FINAL_SECTION_CTA_LABEL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { SceneNarrativeEnvironment } from "./SceneNarrativeEnvironment";
import { SceneShell } from "./SceneShell";

const voices = [
  "I did not need louder encouragement. I needed the same bar on Tuesday.",
  "The relief was quieter: fewer stories I could tell myself.",
] as const;

export function SceneTransformation() {
  const { openAssessment } = useAssessmentModal();

  return (
    <SceneShell
      scene="transformation"
      anchorId="transformation"
      ariaLabel="Scene six — transformation"
      conversionZone="proof"
      atmosphere={<SceneNarrativeEnvironment scene="transformation" />}
    >
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-28 sm:px-10 lg:mx-auto lg:max-w-2xl">
        <p className="ascend-type-eyebrow text-zinc-500">Transformation</p>
        <h2 className="ascend-type-section-sm ascend-headline mt-10 max-w-[15ch] text-pretty sm:mt-12">
          The week tells the truth first.
        </h2>
        <div className="ascend-narrative-stack ascend-after-scene-headline border-l border-white/[0.07] pl-6 sm:pl-7">
          {voices.map((line) => (
            <blockquote
              key={line}
              className="ascend-prose-fragment text-pretty text-zinc-400"
            >
              {line}
            </blockquote>
          ))}
        </div>
        <p className="ascend-prose-fragment mt-14 max-w-md text-zinc-500 sm:mt-16">
          The room stays narrow so the work can stay honest.
        </p>
        <button
          type="button"
          onClick={() => openAssessment()}
          className={cn(
            "mt-14 inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-md border border-white/[0.12] bg-white/[0.05] px-6 text-sm font-medium text-zinc-100 sm:mt-16",
            "transition-[opacity,border-color,transform] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:border-white/[0.16] hover:opacity-95 active:scale-[0.997] sm:w-auto",
          )}
        >
          {FINAL_SECTION_CTA_LABEL}
        </button>
      </div>
    </SceneShell>
  );
}
