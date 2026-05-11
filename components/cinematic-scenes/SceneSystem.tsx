import { SceneNarrativeEnvironment } from "./SceneNarrativeEnvironment";
import { SceneShell } from "./SceneShell";

const beats = [
  "Routine carries the depth: notes, reps, return.",
  "Review without theatre — only the record.",
  "Peers who keep the register plain when it tightens.",
  "The body as one line on the same ledger.",
] as const;

export function SceneSystem() {
  return (
    <SceneShell
      scene="system"
      anchorId="system"
      ariaLabel="Scene four — the system"
      conversionZone="programs"
      atmosphere={<SceneNarrativeEnvironment scene="system" />}
    >
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-28 sm:px-10 lg:max-w-3xl lg:pl-16">
        <p className="ascend-type-eyebrow text-zinc-500">The system</p>
        <h2 className="ascend-type-section-sm ascend-headline mt-10 max-w-[15ch] text-pretty sm:mt-12">
          One spine. Not a shelf of promises.
        </h2>
        <ul className="ascend-narrative-stack ascend-narrative-stack--tight ascend-after-scene-headline m-0 max-w-md list-none border-l border-white/[0.07] pl-6 sm:pl-7">
          {beats.map((line) => (
            <li key={line} className="ascend-prose-fragment text-zinc-400">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </SceneShell>
  );
}
