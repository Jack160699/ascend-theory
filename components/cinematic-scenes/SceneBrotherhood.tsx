"use client";

import { AscendImage } from "@/components/AscendImage";
import { CINEMATIC_ASSETS } from "@/lib/cinematic-assets";
import { CINEMATIC_IMAGE_CLASS } from "@/lib/cinematic-composition";
import { SceneNarrativeEnvironment } from "./SceneNarrativeEnvironment";
import { SceneShell } from "./SceneShell";

export function SceneBrotherhood() {
  return (
    <SceneShell
      scene="brotherhood"
      anchorId="brotherhood"
      ariaLabel="Scene five — brotherhood"
      conversionZone="brotherhood"
      atmosphere={
        <>
          <div
            className="pointer-events-none absolute inset-0 z-0"
            aria-hidden
            data-cinematic-parallax="10"
          >
            <AscendImage
              src={CINEMATIC_ASSETS.brotherhoodWalk}
              alt="Two members walking together — shared pace, private standard"
              fill
              className={CINEMATIC_IMAGE_CLASS.brotherhoodWalk}
              sizes="100vw"
              priority={false}
            />
            <div className="absolute inset-0 bg-black/48 sm:bg-black/38" />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgb(18,12,10)]/88 via-black/32 to-transparent" />
          </div>
          <SceneNarrativeEnvironment scene="brotherhood" stack="overlay" />
        </>
      }
    >
      <div className="relative z-10 flex flex-1 flex-col justify-end px-6 pb-24 pt-32 sm:px-10 sm:pb-28 lg:max-w-xl lg:pl-16">
        <p className="ascend-type-eyebrow text-zinc-400">Brotherhood</p>
        <h2 className="ascend-type-section-sm ascend-headline mt-10 max-w-[14ch] text-pretty sm:mt-12">
          Company without theatre.
        </h2>
        <div className="ascend-narrative-stack ascend-after-scene-headline max-w-md text-zinc-300">
          <p className="ascend-prose-fragment">
            Others beside you who do not soften the bar when it costs.
          </p>
          <p className="ascend-prose-fragment text-zinc-400">
            Quiet room. Shared agreement. Language stays plain when the week
            tightens.
          </p>
        </div>
      </div>
    </SceneShell>
  );
}
