import { SceneNarrativeEnvironment } from "./SceneNarrativeEnvironment";
import { SceneShell } from "./SceneShell";

export function SceneRealization() {
  return (
    <SceneShell
      scene="realization"
      anchorId="realization"
      ariaLabel="Scene three — realization"
      atmosphere={<SceneNarrativeEnvironment scene="realization" />}
    >
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-28 sm:px-10 lg:ml-auto lg:max-w-2xl lg:pr-16">
        <p className="ascend-type-eyebrow text-zinc-500">Realization</p>
        <h2 className="ascend-type-section-sm ascend-headline mt-10 max-w-[16ch] text-pretty sm:mt-12">
          The cost is not falling. It is drift you will not name.
        </h2>
        <div className="ascend-narrative-stack ascend-after-scene-headline text-zinc-400">
          <p className="ascend-prose-lede text-pretty text-zinc-300">
            Inside your head, the bar negotiates with your week.
          </p>
          <p className="ascend-prose-fragment">
            A room with a spine leaves you fewer polite exits.
          </p>
          <p className="ascend-prose-fragment text-zinc-500">
            Language gets simpler when the story has nowhere to hide.
          </p>
        </div>
      </div>
    </SceneShell>
  );
}
