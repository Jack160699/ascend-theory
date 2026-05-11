import { SceneShell } from "./SceneShell";

export function SceneRealization() {
  return (
    <SceneShell
      scene="realization"
      anchorId="realization"
      ariaLabel="Scene three — realization"
      atmosphere={
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden
          data-cinematic-parallax="8"
        >
          <div className="absolute inset-0 bg-ascend-surface" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(0,0,0,0.45),transparent_65%)]" />
        </div>
      }
    >
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-24 sm:px-10 lg:ml-auto lg:max-w-2xl lg:pr-16">
        <p className="ascend-type-eyebrow text-zinc-500">Realization</p>
        <h2 className="ascend-type-section-sm ascend-headline mt-8 max-w-[18ch] text-pretty">
          The cost is not failure. It is drift you stopped naming.
        </h2>
        <p className="ascend-prose-lede mt-10 max-w-lg text-pretty text-zinc-400">
          When the standard lives only in your head, it negotiates with your week.
          A private room changes the physics: fewer exits, cleaner language, a
          single spine for how you move.
        </p>
      </div>
    </SceneShell>
  );
}
