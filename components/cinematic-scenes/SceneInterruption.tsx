"use client";

import { Navbar } from "@/components/Navbar";
import { useAssessmentModal } from "@/contexts/assessment-modal";
import { CINEMATIC_ASSETS } from "@/lib/cinematic-assets";
import { CINEMATIC_IMAGE_CLASS } from "@/lib/cinematic-composition";
import { HERO_CTA_LABEL } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SceneNarrativeEnvironment } from "./SceneNarrativeEnvironment";
import { SceneShell } from "./SceneShell";

export function SceneInterruption() {
  const { openAssessment } = useAssessmentModal();

  return (
    <SceneShell
      scene="interruption"
      anchorId="interruption"
      ariaLabel="Scene one — interruption"
      conversionZone="hero"
      atmosphere={
        <>
          <div
            className="pointer-events-none absolute inset-0 z-0"
            aria-hidden
            data-cinematic-parallax="7"
          >
            <Image
              src={CINEMATIC_ASSETS.heroRooftopSunrise}
              alt="Rooftop at sunrise — city horizon, quiet architectural space"
              fill
              priority
              className={CINEMATIC_IMAGE_CLASS.heroRooftopSunrise}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/[0.52] sm:bg-black/[0.42]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ascend-canvas via-black/30 to-[rgb(12,14,18)]/55" />
          </div>
          <SceneNarrativeEnvironment scene="interruption" stack="overlay" />
        </>
      }
    >
      <Navbar />
      <div className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-16 pt-28 sm:px-10 sm:pb-24 sm:pt-32 lg:pl-16 lg:pb-28">
        <p className="ascend-type-eyebrow text-zinc-400">Ascend Theory</p>
        <h1 className="ascend-type-hero ascend-headline mt-8 max-w-[15ch] text-pretty sm:mt-10">
          The room you keep circling.
        </h1>
        <div className="ascend-narrative-stack ascend-after-scene-headline max-w-md text-zinc-400">
          <p className="ascend-prose-lede text-pretty text-zinc-300">
            Narrow door. Hand read.
          </p>
          <p className="ascend-prose-fragment text-zinc-400">
            A private bar for how you speak, choose, and hold shape when the
            room is still.
          </p>
        </div>
        <div className="mt-14 flex flex-col gap-4 sm:mt-16 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => openAssessment()}
            className={cn(
              "inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-md bg-white px-6 text-sm font-medium text-zinc-950",
              "shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-[opacity,transform] duration-[var(--ascend-hover-duration)] ease-[var(--ascend-hover-ease)] hover:opacity-95 active:scale-[0.997] sm:w-auto",
            )}
          >
            {HERO_CTA_LABEL}
          </button>
        </div>
      </div>

      <Link
        href="#mirror"
        className="absolute bottom-6 left-1/2 z-[15] flex -translate-x-1/2 flex-col items-center gap-1.5 text-zinc-500 sm:bottom-10"
        aria-label="Continue to scene two"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.26em]">
          Continue
        </span>
        <ChevronDown className="size-5 opacity-60" strokeWidth={1.25} />
      </Link>
    </SceneShell>
  );
}
