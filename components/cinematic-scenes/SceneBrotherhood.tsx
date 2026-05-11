"use client";

import { AscendImage } from "@/components/AscendImage";
import { CINEMATIC_ASSETS } from "@/lib/cinematic-assets";
import { CINEMATIC_IMAGE_CLASS } from "@/lib/cinematic-composition";
import { SceneShell } from "./SceneShell";

export function SceneBrotherhood() {
  return (
    <SceneShell
      scene="brotherhood"
      anchorId="brotherhood"
      ariaLabel="Scene five — brotherhood"
      conversionZone="brotherhood"
      atmosphere={
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden
          data-cinematic-parallax="11"
        >
          <AscendImage
            src={CINEMATIC_ASSETS.brotherhoodWalk}
            alt="Two members walking together — shared pace, private standard"
            fill
            className={CINEMATIC_IMAGE_CLASS.brotherhoodWalk}
            sizes="100vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-black/55 sm:bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
        </div>
      }
    >
      <div className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-24 pt-32 sm:px-10 sm:pb-28 lg:max-w-xl lg:pl-16">
        <p className="ascend-type-eyebrow text-zinc-400">Brotherhood</p>
        <h2 className="ascend-type-section-sm ascend-headline mt-8 max-w-[14ch] text-pretty">
          Others walking the same bar.
        </h2>
        <p className="ascend-prose-calm mt-8 max-w-lg text-pretty text-zinc-300">
          Quiet room. Shared standard. No performance of “accountability” — only
          people who keep the language clean when it gets hard.
        </p>
      </div>
    </SceneShell>
  );
}
