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
            You lost
            <br />
            momentum.
          </StoryHeadline>
          <p className="world-body max-w-sm">
            The days blur together.
            <br />
            You&apos;re inconsistent. Distracted. Alone.
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="distraction" scene={HERO_SCENES.distraction}>
        <SceneContent placement="bottom-20" display="md">
          <StoryHeadline display="md">
            You became
            <br />
            addicted to
            <br />
            distraction.
          </StoryHeadline>
          <p className="world-body max-w-sm">
            Scrolling. Avoiding. Numbing.
            <br />
            The pattern keeps repeating.
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="environment" scene={HERO_SCENES.environment}>
        <SceneContent placement="bottom-20-left" display="env">
          <StoryHeadline display="env">
            You become
            <br />
            who you spend
            <br />
            time with.
          </StoryHeadline>
          <p className="world-body max-w-sm">
            Your environment is shaping you.
            <br />
            The right room changes everything.
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="solution" scene={HERO_SCENES.solution}>
        <SceneContent placement="center-left" display="sm">
          <StoryEyebrow className={HERO_SCENES.solution.eyebrowMb ?? "mb-5"}>
            The Solution
          </StoryEyebrow>
          <StoryHeadline display="sm">
            ASCEND THEORY
            <br />
            is a structured
            <br />
            environment
            <br />
            for men.
          </StoryHeadline>
          <p className="world-body max-w-md">
            We rebuild discipline, confidence,
            <br />
            and execution through accountability
            <br />
            and proven systems.
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="how-it-works" scene={HERO_SCENES.howItWorks}>
        <SceneContent placement="center-left" display="sm" innerClassName="world-scene-copy--wide">
          <StoryEyebrow className={HERO_SCENES.howItWorks.eyebrowMb ?? "mb-5"}>
            How It Works
          </StoryEyebrow>
          <div className="mb-8 space-y-5">
            <ItemBlock
              title="Daily structured routines"
              body={"Morning systems. Execution frameworks.\nHabits that compound."}
            />
            <ItemBlock
              title="Weekly accountability calls"
              body={"Check-ins with your group.\nReal-time feedback and support."}
            />
            <ItemBlock
              title="Curated community access"
              body={"Private group of ambitious men.\nNo excuses. Just execution."}
            />
          </div>
        </SceneContent>
      </StickyScene>

      <StickyScene id="what-you-build" scene={HERO_SCENES.whatYouBuild}>
        <SceneContent placement="center-left" display="sm" innerClassName="world-scene-copy--wide">
          <StoryEyebrow className={HERO_SCENES.whatYouBuild.eyebrowMb ?? "mb-5"}>
            What You Build
          </StoryEyebrow>
          <div className="max-w-md space-y-5">
            <ItemBlock
              title="Discipline & execution"
              body={"Daily routines. Consistent action.\nNo more starting and stopping."}
            />
            <ItemBlock
              title="Communication & confidence"
              body={"Express yourself clearly.\nCommand respect. Lead conversations."}
            />
            <ItemBlock
              title="Fitness & lifestyle"
              body={"Build strength. Recalibrate your body.\nSustain high performance."}
            />
            <ItemBlock
              title="Emotional control"
              body={"Master your reactions.\nStay composed under pressure."}
            />
          </div>
        </SceneContent>
      </StickyScene>

      <StickyScene id="brotherhood" scene={HERO_SCENES.brotherhood}>
        <SceneContent placement="bottom-20-left" display="md">
          <StoryEyebrow className={HERO_SCENES.brotherhood.eyebrowMb ?? "mb-4"}>
            The Brotherhood
          </StoryEyebrow>
          <StoryHeadline display="md">
            Curated.
            <br />
            Accountable.
            <br />
            High-standard.
          </StoryHeadline>
          <p className="world-body max-w-sm">
            Not a community. Not a group chat.
            <br />
            A private brotherhood of men who execute.
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
      <div className="sticky top-0 flex h-screen min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[#0d0d0d]">
        <div className="world-transformation-glow" aria-hidden />
        <div className="world-transformation-continuity" aria-hidden />
        <div className="world-scene-handoff world-scene-handoff--top" aria-hidden />
        <div className="world-scene-handoff world-scene-handoff--bottom" aria-hidden />
        <div className="world-transformation-panel world-copy-enter world-copy-integrated">
          <p className="world-eyebrow mb-6">The Transformation</p>
          <h2 className="world-display world-display--transformation mb-8">
            Confident.
            <br />
            Disciplined.
            <br />
            Unstoppable.
          </h2>
          <p className="world-body mx-auto max-w-md">
            You rebuild yourself from the ground up.
            <br />
            This is where men become who they&apos;re
            <br />
            supposed to be.
          </p>
        </div>
      </div>
    </section>
  );
}
