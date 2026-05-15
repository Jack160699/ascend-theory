"use client";

import {
  SceneContent,
  StoryHeadline,
} from "@/components/landing/world/SceneContent";
import { StickyScene } from "@/components/landing/world/StickyScene";
import { useIsMobileConversion } from "@/contexts/mobile-conversion";
import { HERO_SCENES } from "@/lib/figma-world-content";
import { FIGMA_SCENE_SCROLL, sceneScrollHeight } from "@/lib/world-scene-metrics";

export function StoryJourney() {
  return (
    <div className="world-story-flow world-continuum-narrative">
      <StickyScene id="momentum" scene={HERO_SCENES.momentum}>
        <SceneContent placement="bottom-16" display="lg">
          <StoryHeadline display="lg">
            Most People
            <br />
            Stay Stuck
          </StoryHeadline>
          <p className="world-body max-w-xs whitespace-pre-line sm:max-w-sm">
            {`Too distracted.
Too comfortable.
No direction.

That’s why most people never grow.`}
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="distraction" scene={HERO_SCENES.distraction}>
        <SceneContent placement="bottom-20" display="md">
          <StoryHeadline display="md">
            Everything Changes
            <br />
            With Discipline
          </StoryHeadline>
          <p className="world-body max-w-xs whitespace-pre-line sm:max-w-sm">
            {`Clear mind.
Better decisions.
Better execution.
Better life.`}
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="environment" scene={HERO_SCENES.environment}>
        <SceneContent placement="bottom-20-left" display="env">
          <StoryHeadline display="env">
            Built For The
            <br />
            Modern World
          </StoryHeadline>
          <p className="world-body max-w-[min(20rem,100%)] whitespace-pre-line">
            {`AI.
Markets.
Digital systems.
Modern skills.

The world is changing fast.
You either adapt or stay behind.`}
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="solution" scene={HERO_SCENES.solution}>
        <SceneContent placement="center-left" display="sm">
          <StoryHeadline display="sm">
            This Is Not
            <br />
            Motivation
          </StoryHeadline>
          <p className="world-body max-w-md whitespace-pre-line">
            {`Motivation comes and goes.

Systems stay.
Discipline stays.
Execution stays.`}
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="how-it-works" scene={HERO_SCENES.howItWorks}>
        <SceneContent placement="center-left" display="sm">
          <StoryHeadline display="sm">
            For Serious
            <br />
            People Only
          </StoryHeadline>
          <p className="world-body max-w-md whitespace-pre-line">
            {`People who want real growth.
Real focus.
Real direction.`}
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="brotherhood" scene={HERO_SCENES.brotherhood}>
        <SceneContent placement="bottom-20-left" display="md">
          <StoryHeadline display="md">
            Built For Focused
            <br />
            Individuals
          </StoryHeadline>
          <p className="world-body max-w-sm">
            Ascend Theory is designed for people serious about growth,
            discipline, and modern execution.
          </p>
          <p
            className="world-trust-keywords mt-8 max-w-sm"
            aria-label="Focus areas"
          >
            AI • Markets • Systems • Execution
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
          <h2 className="world-display world-display--transformation mb-8 text-balance">
            Stay clear.
            <br />
            Stay moving.
          </h2>
          <p className="world-body mx-auto max-w-md text-pretty">
            Same world. Fewer distractions. Cleaner choices.
          </p>
        </div>
      </div>
    </section>
  );
}
