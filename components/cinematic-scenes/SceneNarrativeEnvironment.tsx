import type { HomeSceneId } from "@/lib/cinematic-v2/cinematic-layout";
import { cn } from "@/lib/utils";

type StackRole = "base" | "overlay";

/**
 * Per-scene environmental storytelling: lighting, depth layers, and temperature.
 * Transform-only drift via `data-cinematic-parallax` — no decorative animation.
 * Image-based scenes compose photography separately, then `stack="overlay"`.
 */
export function SceneNarrativeEnvironment({
  scene,
  stack = "base",
}: {
  scene: HomeSceneId;
  stack?: StackRole;
}) {
  if (scene === "interruption" && stack === "base") return null;
  if (scene === "brotherhood" && stack === "base") return null;

  const z = stack === "overlay" ? "z-[1]" : "z-0";

  return (
    <div
      className={cn("pointer-events-none absolute inset-0", z)}
      aria-hidden
    >
      {scene === "interruption" && stack === "overlay" ? (
        <>
          <div
            data-cinematic-parallax="3"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(185deg, rgba(22,26,34,0.5) 0%, transparent 38%, rgba(4,5,7,0.62) 100%)",
            }}
          />
          <div
            data-cinematic-parallax="5.5"
            className="absolute inset-0 mix-blend-soft-light"
            style={{
              opacity: 0.55,
              background:
                "radial-gradient(ellipse 95% 55% at 50% 108%, rgba(72,88,108,0.14), transparent 52%)",
            }}
          />
          <div
            data-cinematic-parallax="2.2"
            className="absolute inset-0 opacity-[0.35]"
            style={{
              background:
                "linear-gradient(102deg, transparent 38%, rgba(255,255,255,0.03) 49%, transparent 62%)",
            }}
          />
        </>
      ) : null}

      {scene === "mirror" && stack === "base" ? (
        <>
          <div
            className="absolute inset-0 bg-[#060607]"
            style={{
              boxShadow: "inset 0 0 120px rgba(0,0,0,0.45)",
            }}
          />
          <div
            data-cinematic-parallax="5"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 72% 58% at 50% 44%, rgba(255,255,255,0.045), transparent 64%)",
            }}
          />
          <div
            data-cinematic-parallax="8"
            className="absolute inset-0 mix-blend-soft-light opacity-[0.85]"
            style={{
              background:
                "radial-gradient(ellipse 130% 88% at 50% 112%, rgba(112,102,94,0.14), transparent 48%)",
            }}
          />
        </>
      ) : null}

      {scene === "realization" && stack === "base" ? (
        <>
          <div className="absolute inset-0 bg-[#09090b]" />
          <div
            data-cinematic-parallax="6"
            className="absolute inset-0 opacity-[0.45]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 12vw,
                rgba(255,255,255,0.018) 12vw,
                rgba(255,255,255,0.018) 12.06vw
              )`,
            }}
          />
          <div
            data-cinematic-parallax="4"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.055) 0%, transparent 32%), linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 8%)",
            }}
          />
          <div
            data-cinematic-parallax="3.5"
            className="absolute inset-0 opacity-[0.4]"
            style={{
              background:
                "radial-gradient(ellipse 55% 70% at 78% 50%, rgba(0,0,0,0.38), transparent 70%)",
            }}
          />
        </>
      ) : null}

      {scene === "system" && stack === "base" ? (
        <>
          <div className="absolute inset-0 bg-[#070708]" />
          <div
            data-cinematic-parallax="5"
            className="absolute inset-0 opacity-[0.5]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                180deg,
                transparent,
                transparent 11.5vh,
                rgba(255,255,255,0.014) 11.5vh,
                rgba(255,255,255,0.014) 11.58vh
              )`,
            }}
          />
          <div
            data-cinematic-parallax="7"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(6,7,9,0.92) 0%, rgba(6,7,9,0.22) 36%, transparent 58%)",
            }}
          />
        </>
      ) : null}

      {scene === "brotherhood" && stack === "overlay" ? (
        <>
          <div
            data-cinematic-parallax="3.5"
            className="absolute inset-0 mix-blend-soft-light"
            style={{
              opacity: 0.75,
              background:
                "linear-gradient(12deg, transparent 35%, rgba(138,124,112,0.06) 55%, transparent 78%)",
            }}
          />
          <div
            data-cinematic-parallax="6"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(88,72,62,0.42) 0%, transparent 48%), radial-gradient(ellipse 95% 65% at 28% 92%, rgba(165,145,128,0.1), transparent 55%)",
            }}
          />
        </>
      ) : null}

      {scene === "transformation" && stack === "base" ? (
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #0b0b0d 0%, #080809 48%, #0a0a0c 100%)",
            }}
          />
          <div
            data-cinematic-parallax="4"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 100% 75% at 50% -8%, rgba(255,255,255,0.055), transparent 52%)",
            }}
          />
          <div
            data-cinematic-parallax="2.8"
            className="absolute inset-0 opacity-[0.55]"
            style={{
              background:
                "radial-gradient(ellipse 85% 90% at 50% 100%, rgba(0,0,0,0.22), transparent 58%)",
            }}
          />
        </>
      ) : null}

      {scene === "entry" && stack === "base" ? (
        <>
          <div className="absolute inset-0 bg-ascend-canvas" />
          <div
            data-cinematic-parallax="3"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 72% 45% at 50% -5%, rgba(255,255,255,0.032), transparent 58%)",
            }}
          />
        </>
      ) : null}
    </div>
  );
}
