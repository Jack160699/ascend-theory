import { SceneShell } from "./SceneShell";

export function SceneMirror() {
  return (
    <SceneShell
      scene="mirror"
      anchorId="mirror"
      ariaLabel="Scene two — mirror"
      conversionZone="philosophy"
      atmosphere={
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden
          data-cinematic-parallax="9"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-ascend-canvas via-ascend-surface to-ascend-canvas" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(95,115,134,0.07),transparent_58%)]" />
        </div>
      }
    >
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-24 sm:px-10 lg:max-w-2xl lg:pl-16">
        <p className="ascend-type-eyebrow text-zinc-500">Mirror</p>
        <h2 className="ascend-type-section-sm ascend-headline mt-8 max-w-[14ch] text-pretty">
          You already know the drift.
        </h2>
        <div className="ascend-prose-calm mt-10 max-w-lg space-y-6 text-zinc-400">
          <p>
            Inconsistent discipline. No one beside you who holds the bar. Habits
            that quietly stop matching who you say you are.
          </p>
          <p>This is not motivation. It is recognition.</p>
        </div>
      </div>
    </SceneShell>
  );
}
