"use client";

import { SceneContent } from "@/components/landing/world/SceneContent";
import { StickyScene } from "@/components/landing/world/StickyScene";
import { HERO_SCENES } from "@/lib/figma-world-content";

function ItemBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="world-story-item-title mb-1.5">{title}</h3>
      <p className="world-body--muted whitespace-pre-line">{body}</p>
    </div>
  );
}

export function StoryJourney() {
  return (
    <>
      <StickyScene
        id="momentum"
        image={HERO_SCENES.momentum.image}
        imageAlt={HERO_SCENES.momentum.imageAlt}
        imageClass={HERO_SCENES.momentum.imageClass}
        imagePosition="center 40%"
        contentClassName="flex items-end"
      >
        <SceneContent layout="bottom">
          <h2 className="world-display world-display--lg mb-5 sm:mb-6">
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

      <StickyScene
        id="distraction"
        image={HERO_SCENES.distraction.image}
        imageAlt={HERO_SCENES.distraction.imageAlt}
        imageClass={HERO_SCENES.distraction.imageClass}
        contentClassName="flex items-end"
      >
        <SceneContent layout="bottom">
          <h2 className="world-display world-display--md mb-5 sm:mb-6">
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

      <StickyScene
        id="environment"
        image={HERO_SCENES.environment.image}
        imageAlt={HERO_SCENES.environment.imageAlt}
        imageClass={HERO_SCENES.environment.imageClass}
        imagePosition="center 32%"
        contentClassName="flex items-end"
      >
        <SceneContent layout="bottom">
          <h2 className="world-display world-display--md mb-5 sm:mb-6">
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

      <StickyScene
        id="solution"
        image={HERO_SCENES.solution.image}
        imageAlt={HERO_SCENES.solution.imageAlt}
        imageClass={HERO_SCENES.solution.imageClass}
        contentClassName="flex items-center"
      >
        <SceneContent layout="center-left">
          <p className="world-eyebrow mb-4 sm:mb-5">The Solution</p>
          <h2 className="world-display world-display--sm mb-5 sm:mb-6">
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

      <StickyScene
        id="how-it-works"
        image={HERO_SCENES.howItWorks.image}
        imageAlt={HERO_SCENES.howItWorks.imageAlt}
        imageClass={HERO_SCENES.howItWorks.imageClass}
        imagePosition="55% 42%"
        contentClassName="flex items-center"
      >
        <SceneContent layout="center-left" innerClassName="world-scene-copy--wide">
          <p className="world-eyebrow mb-4 sm:mb-5">How It Works</p>
          <div className="mb-2 space-y-4 sm:space-y-5">
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

      <StickyScene
        id="what-you-build"
        image={HERO_SCENES.whatYouBuild.image}
        imageAlt={HERO_SCENES.whatYouBuild.imageAlt}
        imageClass={HERO_SCENES.whatYouBuild.imageClass}
        imagePosition="center 30%"
        contentClassName="flex items-center"
      >
        <SceneContent layout="center-left" innerClassName="world-scene-copy--wide">
          <p className="world-eyebrow mb-4 sm:mb-5">What You Build</p>
          <div className="max-w-md space-y-4 sm:space-y-5">
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

      <StickyScene
        id="brotherhood"
        image={HERO_SCENES.brotherhood.image}
        imageAlt={HERO_SCENES.brotherhood.imageAlt}
        imageClass={HERO_SCENES.brotherhood.imageClass}
        contentClassName="flex items-end"
      >
        <SceneContent layout="bottom">
          <p className="world-eyebrow mb-3 sm:mb-4">The Brotherhood</p>
          <h2 className="world-display world-display--md mb-5 sm:mb-6">
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
  return (
    <section
      id="transformation"
      className="flex min-h-[100svh] w-full flex-col items-center justify-center bg-[#0d0d0d] px-5"
    >
      <div className="world-transformation-panel max-w-lg text-center">
        <p className="world-eyebrow mb-5 sm:mb-6">The Transformation</p>
        <h2 className="world-display world-display--lg mb-6 sm:mb-8">
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
    </section>
  );
}
