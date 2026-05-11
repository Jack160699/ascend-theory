import { SceneShell } from "./SceneShell";

const beats = [
  "Routine — depth, notes, repetition.",
  "Accountability — review without theatre.",
  "Peer environment — composed, direct, literate.",
  "Physique — one layer of the same bar.",
] as const;

export function SceneSystem() {
  return (
    <SceneShell
      scene="system"
      anchorId="system"
      ariaLabel="Scene four — the system"
      conversionZone="programs"
      atmosphere={
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden
          data-cinematic-parallax="8"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-ascend-canvas via-ascend-surface to-ascend-canvas" />
        </div>
      }
    >
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-24 sm:px-10 lg:max-w-3xl lg:pl-16">
        <p className="ascend-type-eyebrow text-zinc-500">The system</p>
        <h2 className="ascend-type-section-sm ascend-headline mt-8 max-w-[16ch] text-pretty">
          One architecture. Not a stack of courses.
        </h2>
        <ul className="mt-14 max-w-xl space-y-5 border-l border-white/[0.08] pl-6 text-[15px] leading-relaxed text-zinc-400 sm:text-base">
          {beats.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </SceneShell>
  );
}
