import { cn } from "@/lib/utils";

type WorldPanelAtmosphereProps = {
  /** Figma: 56px pricing grid, 48px fine grid on final CTA */
  grid?: "standard" | "fine";
  /** Warm editorial glow */
  warm?: boolean;
  /** Soft vertical film continuity */
  film?: boolean;
  /** Edge vignette for cinematic closure */
  vignette?: boolean;
};

/**
 * Shared atmosphere for pricing + final CTA — Figma dot grid + warm radial.
 * CSS-only, no images, no blur.
 */
export function WorldPanelAtmosphere({
  grid = "standard",
  warm = true,
  film = true,
  vignette = false,
}: WorldPanelAtmosphereProps) {
  return (
    <>
      <div
        className={cn(
          "world-panel-dot-grid pointer-events-none absolute inset-0",
          grid === "fine" && "world-panel-dot-grid--fine",
        )}
        aria-hidden
      />
      {warm ? (
        <div className="world-panel-warm pointer-events-none absolute inset-0" aria-hidden />
      ) : null}
      {film ? (
        <div className="world-panel-film pointer-events-none absolute inset-0" aria-hidden />
      ) : null}
      {vignette ? (
        <div className="world-panel-vignette pointer-events-none absolute inset-0" aria-hidden />
      ) : null}
    </>
  );
}
