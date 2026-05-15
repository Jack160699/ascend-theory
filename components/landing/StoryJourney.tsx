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
            Drift compounds
            <br />
            against you.
          </StoryHeadline>
          <p className="world-body max-w-sm">
            Ambition without cadence silently taxes
            <br />
            your attention — long before it taxes your results.
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="distraction" scene={HERO_SCENES.distraction}>
        <SceneContent placement="bottom-20" display="md">
          <StoryHeadline display="md">
            Noise is
            <br />
            a design choice.
          </StoryHeadline>
          <p className="world-body max-w-sm">
            Each cheap input trains range downward.
            <br />
            Busy is not motion. Motion is not proof.
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="environment" scene={HERO_SCENES.environment}>
        <SceneContent placement="bottom-20-left" display="env">
          <StoryHeadline display="env">
            Context
            <br />
            rewires the bar.
          </StoryHeadline>
          <p className="world-body max-w-sm">
            Exposure sets your default faster than motivation.
            <br />
            Proximity is leverage — or liability.
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="solution" scene={HERO_SCENES.solution}>
        <SceneContent placement="center-left" display="sm">
          <StoryEyebrow className={HERO_SCENES.solution.eyebrowMb ?? "mb-5"}>
            Doctrine
          </StoryEyebrow>
          <StoryHeadline display="sm">
            ASCEND THEORY
            <br />
            is operational
            <br />
            intelligence.
          </StoryHeadline>
          <p className="world-body max-w-md">
            Not an audience. Not a curriculum. A disciplined standard for how
            <br />
            you think, commit, and execute when the price of softness is real.
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="how-it-works" scene={HERO_SCENES.howItWorks}>
        <SceneContent placement="center-left" display="sm" innerClassName="world-scene-copy--wide">
          <StoryEyebrow className={HERO_SCENES.howItWorks.eyebrowMb ?? "mb-5"}>
            Architecture
          </StoryEyebrow>
          <div className="mb-8 space-y-5">
            <ItemBlock
              title="Daily cadence stack"
              body={"Morning protocol. Decision hygiene.\nRipple-free motion — no performance."}
            />
            <ItemBlock
              title="Weekly pressure loop"
              body={"Structured review.\nComfort is not currency — trajectory is."}
            />
            <ItemBlock
              title="Closed operator surface"
              body={"Signals, never spectators.\nThe room behaves like outcomes matter."}
            />
          </div>
        </SceneContent>
      </StickyScene>

      <StickyScene id="what-you-build" scene={HERO_SCENES.whatYouBuild}>
        <SceneContent placement="center-left" display="sm" innerClassName="world-scene-copy--wide">
          <StoryEyebrow className={HERO_SCENES.whatYouBuild.eyebrowMb ?? "mb-5"}>
            What compounds
          </StoryEyebrow>
          <div className="max-w-md space-y-5">
            <ItemBlock
              title="Execution distance"
              body={"Shorter path to finished work.\nLess reset cost — higher terminal quality."}
            />
            <ItemBlock
              title="Signal & composure"
              body={"Language that stays clean under load.\nAuthority without volume."}
            />
            <ItemBlock
              title="Capacity under load"
              body={"Consistency when demand spikes.\nEnergy as infrastructure — not an alibi."}
            />
            <ItemBlock
              title="Emotional range control"
              body={"Measured responses in ambiguity.\nTemperament that survives scale."}
            />
          </div>
        </SceneContent>
      </StickyScene>

      <StickyScene id="brotherhood" scene={HERO_SCENES.brotherhood}>
        <SceneContent placement="bottom-20-left" display="md">
          <StoryEyebrow className={HERO_SCENES.brotherhood.eyebrowMb ?? "mb-4"}>
            Alliance
          </StoryEyebrow>
          <StoryHeadline display="md">
            Small.
            <br />
            Serious.
            <br />
            Unavailable by default.
          </StoryHeadline>
          <p className="world-body max-w-sm">
            Calibrated proximity — operators who finish,
            <br />
            listen cold, and protect the standard.
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
            Still.
            <br />
            Directed.
            <br />
            Proof-weighted.
          </h2>
          <p className="world-body mx-auto max-w-md">
            The shift lives in allocation — where focus goes,
            <br />
            what you refuse, and how quietly you compound evidence.
          </p>
        </div>
      </div>
    </section>
  );
}
