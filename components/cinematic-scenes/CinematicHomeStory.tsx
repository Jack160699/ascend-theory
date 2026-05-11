import { SceneBrotherhood } from "./SceneBrotherhood";
import { SceneEntry } from "./SceneEntry";
import { SceneInterruption } from "./SceneInterruption";
import { SceneMirror } from "./SceneMirror";
import { SceneRealization } from "./SceneRealization";
import { SceneSystem } from "./SceneSystem";
import { SceneTransformation } from "./SceneTransformation";

/** Seven-beat narrative spine — order is the emotional arc. */
export function CinematicHomeStory() {
  return (
    <>
      <SceneInterruption />
      <SceneMirror />
      <SceneRealization />
      <SceneSystem />
      <SceneBrotherhood />
      <SceneTransformation />
      <SceneEntry />
    </>
  );
}
