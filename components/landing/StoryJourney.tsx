"use client";

import { SceneContent } from "@/components/landing/world/SceneContent";
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
    <>
      <StickyScene id="momentum" scene={HERO_SCENES.momentum}>
        <SceneContent placement="bottom-16">
          <h2 className="world-display world-display--lg mb-6">
            You lost
            <br />
            momentum.
          </h2>
          <p className="world-body max-w-sm">
            The days blur together.
            <br />
            You&apos;re inconsistent. Distracted. Alone.
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="distraction" scene={HERO_SCENES.distraction}>
        <SceneContent placement="bottom-16">
          <h2 className="world-display world-display--md mb-6">
            You became
            <br />
            addicted to
            <br />
            distraction.
          </h2>
          <p className="world-body max-w-sm">
            Scrolling. Avoiding. Numbing.
            <br />
            The pattern keeps repeating.
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="environment" scene={HERO_SCENES.environment}>
        <SceneContent placement="bottom-16">
          <h2 className="world-display world-display--md mb-6">
            You become
            <br />
            who you spend
            <br />
            time with.
          </h2>
          <p className="world-body max-w-sm">
            Your environment is shaping you.
            <br />
            The right room changes everything.
          </p>
        </SceneContent>
      </StickyScene>

      <StickyScene id="solution" scene={HERO_SCENES.solution}>
        <SceneContent placement="center-left">
          <p className="world-eyebrow mb-5">The Solution</p>
          <h2 className="world-display world-display--sm mb-6">
            ASCEND THEORY
            <br />
            is a structured
            <br />
            environment
            <br />
            for men.
          </h2>
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
        <SceneContent placement="center-left" innerClassName="world-scene-copy--wide">
          <p className="world-eyebrow mb-5">How It Works</p>
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
        <SceneContent placement="center-left" innerClassName="world-scene-copy--wide">
          <p className="world-eyebrow mb-5">What You Build</p>
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
        <SceneContent placement="bottom-20-left">
          <p className="world-eyebrow mb-4">The Brotherhood</p>
          <h2 className="world-display world-display--md mb-6">
            Curated.
            <br />
            Accountable.
            <br />
            High-standard.
          </h2>
          <p className="world-body max-w-sm">
            Not a community. Not a group chat.
            <br />
            A private brotherhood of men who execute.
          </p>
        </SceneContent>
      </StickyScene>

      <TransformationBeat />
    </>
  );
}

function TransformationBeat() {
  const isMobile = useIsMobileConversion();
  const height = sceneScrollHeight(FIGMA_SCENE_SCROLL.transformation, isMobile);

  return (
    <section
      id="transformation"
      className="world-transformation-rail relative w-full"
      style={{ height }}
    >
      <div className="sticky top-0 flex h-screen min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[#0d0d0d]">
        <div className="world-transformation-glow" aria-hidden />
        <div className="world-transformation-panel max-w-lg text-center world-copy-enter">
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
