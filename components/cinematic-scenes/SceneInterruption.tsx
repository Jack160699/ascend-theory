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
          <div className="absolute inset-0 bg-black/50 sm:bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ascend-canvas via-black/25 to-black/35" />
        </div>
      }
    >
      <Navbar />
      <div className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-16 pt-28 sm:px-10 sm:pb-24 sm:pt-32 lg:pl-16 lg:pb-28">
        <p className="ascend-type-eyebrow text-zinc-400">Ascend Theory</p>
        <h1 className="ascend-type-hero ascend-headline mt-6 max-w-[16ch] text-pretty">
          The room you have been avoiding.
        </h1>
        <p className="ascend-prose-lede mt-8 max-w-xl text-pretty text-zinc-400">
          Private mentorship — selective intake, manual review. One standard for
          identity, communication, and execution.
        </p>
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
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
