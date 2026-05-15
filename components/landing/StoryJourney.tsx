"use client";

import { StickyScene } from "@/components/landing/world/StickyScene";
import { HERO_SCENES } from "@/lib/figma-world-content";

function ItemBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3
        className="mb-1.5 tracking-tight text-white"
        style={{ fontWeight: 400, fontSize: "clamp(1rem, 4.5vw, 1.25rem)" }}
      >
        {title}
      </h3>
      <p className="world-body--muted whitespace-pre-line">{body}</p>
    </div>
  );
}

export function StoryJourney() {
  return (
    <>
      <StickyScene
        id="momentum"
        scrollHeight="130vh"
        image={HERO_SCENES.momentum.image}
        imageAlt={HERO_SCENES.momentum.imageAlt}
        imageClass={HERO_SCENES.momentum.imageClass}
        imagePosition="center 40%"
        overlayClass="bg-[#0d0d0d]/85"
        gradientClass="bg-gradient-to-b from-[#0d0d0d]/70 via-[#0d0d0d]/80 to-[#0d0d0d]"
        contentClassName="flex items-end"
        parallax={{ y: [50, -50] }}
        extraOverlay={
          <div
            className="absolute inset-0 opacity-15"
            style={{
              background:
                "radial-gradient(ellipse 50% 40% at 50% 55%, rgba(140, 170, 200, 0.3) 0%, transparent 50%)",
            }}
            aria-hidden
          />
        }
      >
        <div className="absolute bottom-16 left-0 right-0 px-5">
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
        </div>
      </StickyScene>

      <StickyScene
        id="distraction"
        scrollHeight="120vh"
        image={HERO_SCENES.distraction.image}
        imageAlt={HERO_SCENES.distraction.imageAlt}
        imageClass={HERO_SCENES.distraction.imageClass}
        overlayClass="bg-[#0d0d0d]/88"
        gradientClass="bg-gradient-to-b from-[#0d0d0d]/75 via-[#0d0d0d]/85 to-[#0d0d0d]"
        contentClassName="flex items-end"
        parallax={{ y: [40, -40] }}
      >
        <div className="absolute bottom-20 left-0 right-0 px-5">
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
        </div>
      </StickyScene>

      <StickyScene
        id="environment"
        scrollHeight="135vh"
        image={HERO_SCENES.environment.image}
        imageAlt={HERO_SCENES.environment.imageAlt}
        imageClass={HERO_SCENES.environment.imageClass}
        overlayClass="bg-[#0d0d0d]/80"
        gradientClass="bg-gradient-to-br from-[#0d0d0d]/60 via-[#0d0d0d]/75 to-[#0d0d0d]/95"
        contentClassName="flex items-end"
        parallax={{ scale: [1.08, 1.05], y: [20, -15] }}
      >
        <div className="absolute bottom-20 left-0 px-5">
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
        </div>
      </StickyScene>

      <StickyScene
        id="solution"
        scrollHeight="125vh"
        image={HERO_SCENES.solution.image}
        imageAlt={HERO_SCENES.solution.imageAlt}
        imageClass={HERO_SCENES.solution.imageClass}
        overlayClass="bg-[#0d0d0d]/82"
        gradientClass="bg-gradient-to-br from-[#0d0d0d]/70 via-[#0d0d0d]/80 to-[#0d0d0d]/90"
        contentClassName="flex items-center"
        parallax={{ scale: [1.05, 1] }}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 px-5">
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
        </div>
      </StickyScene>

      <StickyScene
        id="how-it-works"
        scrollHeight="120vh"
        image={HERO_SCENES.howItWorks.image}
        imageAlt={HERO_SCENES.howItWorks.imageAlt}
        imageClass={HERO_SCENES.howItWorks.imageClass}
        overlayClass="bg-[#0d0d0d]/82"
        gradientClass="bg-gradient-to-b from-[#0d0d0d]/70 via-[#0d0d0d]/80 to-[#0d0d0d]/90"
        contentClassName="flex items-center"
        parallax={{ y: [30, -30] }}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 px-5">
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
        </div>
      </StickyScene>

      <StickyScene
        id="what-you-build"
        scrollHeight="125vh"
        image={HERO_SCENES.whatYouBuild.image}
        imageAlt={HERO_SCENES.whatYouBuild.imageAlt}
        imageClass={HERO_SCENES.whatYouBuild.imageClass}
        overlayClass="bg-[#0d0d0d]/78"
        gradientClass="bg-gradient-to-bl from-[#0d0d0d]/65 via-[#0d0d0d]/80 to-[#0d0d0d]/90"
        contentClassName="flex items-center"
        parallax={{ y: [40, -40], scale: [1.05, 1] }}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 px-5">
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
        </div>
      </StickyScene>

      <StickyScene
        id="brotherhood"
        scrollHeight="130vh"
        image={HERO_SCENES.brotherhood.image}
        imageAlt={HERO_SCENES.brotherhood.imageAlt}
        imageClass={HERO_SCENES.brotherhood.imageClass}
        overlayClass="bg-[#0d0d0d]/76"
        gradientClass="bg-gradient-to-tr from-[#0d0d0d]/85 via-[#0d0d0d]/70 to-[#0d0d0d]/85"
        contentClassName="flex items-end"
        parallax={{ scale: [1.06, 1.03], y: [25, -20] }}
      >
        <div className="absolute bottom-20 left-0 px-5">
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
        </div>
      </StickyScene>

      <TransformationBeat />
    </>
  );
}

function TransformationBeat() {
  return (
    <div id="transformation" className="relative h-[100vh] w-full">
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0d0d0d]">
        <div
          className="absolute inset-0 world-warm-glow--center opacity-[0.08]"
          aria-hidden
        />
        <div className="relative z-10 px-5 text-center">
          <p className="world-eyebrow mb-6">The Transformation</p>
          <h2 className="world-display world-display--lg mb-8">
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
    </div>
  );
}
