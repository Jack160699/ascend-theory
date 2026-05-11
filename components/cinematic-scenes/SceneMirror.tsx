import { SceneNarrativeEnvironment } from "./SceneNarrativeEnvironment";
import { SceneShell } from "./SceneShell";

export function SceneMirror() {
  return (
    <SceneShell
      scene="mirror"
      anchorId="mirror"
      ariaLabel="Scene two — mirror"
      conversionZone="philosophy"
      atmosphere={<SceneNarrativeEnvironment scene="mirror" />}
    >
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-28 sm:px-10 lg:max-w-2xl lg:pl-16">
        <p className="ascend-type-eyebrow text-zinc-500">Mirror</p>
        <h2 className="ascend-type-section-sm ascend-headline mt-10 max-w-[13ch] text-pretty sm:mt-12">
          You know the shape of it.
        </h2>
        <div className="ascend-narrative-stack ascend-after-scene-headline text-zinc-400">
          <p className="ascend-prose-fragment">
            The standard thins where nobody you respect is watching.
          </p>
          <p className="ascend-prose-fragment">
            That is not weak will. It is a lonely bar.
          </p>
          <p className="ascend-prose-fragment text-zinc-500">
            You have already said most of it to yourself.
          </p>
        </div>
      </div>
    </SceneShell>
  );
}
