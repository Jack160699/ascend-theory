"use client";

import {
  SceneContent,
  StoryEyebrow,
  StoryHeadline,
} from "@/components/landing/world/SceneContent";
import { StickyScene } from "@/components/landing/world/StickyScene";
import { useIsMobileConversion } from "@/contexts/mobile-conversion";
import { HERO_SCENES } from "@/lib/figma-world-content";
import { FIGMA_SCENE_SCROLL, sceneScrollHeight } from "@/lib/world-scene-metrics";

function ItemBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="world-story-item-title mb-1.5 tracking-tight">{title}</h3>
      <p className="world-body--muted whitespace-pre-line">{body}</p>
    </div>
  );
}

export function StoryJourney() {
  return (
    <div className="world-story-flow world-continuum-narrative">
      <StickyScene id="momentum" scene={HERO_SCENES.momentum}>
        <SceneContent placement="bottom-16" display="lg">
          <StoryHeadline display="lg">
            Drift costs
            <br />
            more than mistakes.
          </StoryHeadline>
          <p className="world-body max-w-sm">
            Ambition without cadence quietly compounds
            <br />
            against you — attention frays before results do.
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="distraction" scene={HERO_SCENES.distraction}>
        <SceneContent placement="bottom-20" display="md">
          <StoryHeadline display="md">
            The feed
            <br />
            is not neutral.
          </StoryHeadline>
          <p className="world-body max-w-sm">
            Every skim trains your baseline down.
            <br />
            You feel busy — nothing moves forward.
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="environment" scene={HERO_SCENES.environment}>
        <SceneContent placement="bottom-20-left" display="env">
          <StoryHeadline display="env">
            Rooms set
            <br />
            your ceiling.
          </StoryHeadline>
          <p className="world-body max-w-sm">
            Proximity rewires norms faster than intentions.
            <br />
            The right friction becomes leverage.
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="solution" scene={HERO_SCENES.solution}>
        <SceneContent placement="center-left" display="sm">
          <StoryEyebrow className={HERO_SCENES.solution.eyebrowMb ?? "mb-5"}>
            Operating standard
          </StoryEyebrow>
          <StoryHeadline display="sm">
            ASCEND THEORY
            <br />
            is an environment,
            <br />
            not content.
          </StoryHeadline>
          <p className="world-body max-w-md">
            Systems, accountability, and a private cohort calibrated
            <br />
            for execution — disciplined, intelligent, restrained.
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="how-it-works" scene={HERO_SCENES.howItWorks}>
        <SceneContent placement="center-left" display="sm" innerClassName="world-scene-copy--wide">
          <StoryEyebrow className={HERO_SCENES.howItWorks.eyebrowMb ?? "mb-5"}>
            Mechanics
          </StoryEyebrow>
          <div className="mb-8 space-y-5">
            <ItemBlock
              title="Daily operating rhythm"
              body={"Morning stack. Decision hygiene.\nNo theater — repeatable motion."}
            />
            <ItemBlock
              title="Weekly synchronous pressure"
              body={"Structured check-ins.\nCandor over comfort — trajectory over mood."}
            />
            <ItemBlock
              title="Closed operator layer"
              body={"Signals, not spectators.\nA room that behaves like stakes exist."}
            />
          </div>
        </SceneContent>
      </StickyScene>

      <StickyScene id="what-you-build" scene={HERO_SCENES.whatYouBuild}>
        <SceneContent placement="center-left" display="sm" innerClassName="world-scene-copy--wide">
          <StoryEyebrow className={HERO_SCENES.whatYouBuild.eyebrowMb ?? "mb-5"}>
            Outcomes you earn
          </StoryEyebrow>
          <div className="max-w-md space-y-5">
            <ItemBlock
              title="Execution capacity"
              body={"Closer distance to shipped work.\nLess restart tax — higher finish rate."}
            />
            <ItemBlock
              title="Presence & signal"
              body={"Cleaner communication.\nConfidence that reads calm, not loud."}
            />
            <ItemBlock
              title="Physical readiness"
              body={"Consistency under load.\nEnergy as a multiplier, not an excuse."}
            />
            <ItemBlock
              title="Temperament"
              body={"Controlled responses under ambiguity.\nThe edge that survives scale."}
            />
          </div>
        </SceneContent>
      </StickyScene>

      <StickyScene id="brotherhood" scene={HERO_SCENES.brotherhood}>
        <SceneContent placement="bottom-20-left" display="md">
          <StoryEyebrow className={HERO_SCENES.brotherhood.eyebrowMb ?? "mb-4"}>
            Peer layer
          </StoryEyebrow>
          <StoryHeadline display="md">
            Curated.
            <br />
            Demand-matched.
            <br />
            Quietly elite.
          </StoryHeadline>
          <p className="world-body max-w-sm">
            Not a feed. Not a crowd.
            <br />
            A private set of operators who close loops.
          </p>
        </SceneContent>
      </StickyScene>

      <TransformationBeat />
    </div>
  );
}

function TransformationBeat() {
  const isMobile = useIsMobileConversion();
  const height = sceneScrollHeight(FIGMA_SCENE_SCROLL.transformation, isMobile);

  return (
    <section
      id="transformation"
      className="world-transformation-rail world-atmosphere-rail world-story-rail world-continuum-rail relative w-full"
      style={{ height }}
    >
      <div className="world-sticky-frame sticky top-0 flex w-full flex-col items-center justify-center overflow-hidden bg-[#0d0d0d]">
        <div className="world-transformation-glow" aria-hidden />
        <div className="world-transformation-continuity" aria-hidden />
        <div className="world-scene-handoff world-scene-handoff--top" aria-hidden />
        <div className="world-scene-handoff world-scene-handoff--bottom" aria-hidden />
        <div className="world-transformation-panel world-copy-enter world-copy-integrated">
          <p className="world-eyebrow mb-6">Recalibration</p>
          <h2 className="world-display world-display--transformation mb-8">
            Sharp.
            <br />
            Calm.
            <br />
            Relentless.
          </h2>
          <p className="world-body mx-auto max-w-md">
            What changes is how you allocate attention,
            <br />
            how you tolerate chaos, how you compound proof.
          </p>
        </div>
      </div>
    </section>
  );
}
