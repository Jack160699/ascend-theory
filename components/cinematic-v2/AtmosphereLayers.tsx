/**
 * Fixed atmosphere stack: depth drift + slow narrative tint (emotional progression).
 * Opacity-only planes — no staged motion; values come from scroll-driven CSS vars.
 */
export function AtmosphereLayers() {
  return (
    <div
      aria-hidden
      data-cinematic-atmosphere-root
      className="pointer-events-none fixed inset-0 z-[1]"
    >
      <div
        data-cinematic-atmos-depth
        className="absolute inset-0 will-change-transform"
      />
      {/* Cool key that strengthens with narrative depth; bias shifts with dominant scene */}
      <div
        className="absolute inset-0 mix-blend-soft-light"
        style={{
          opacity:
            "calc(0.028 + var(--ascend-narrative-atmosphere, 0) * 0.055 + var(--ascend-continuity-depth, 0) * 0.028)",
          background:
            "radial-gradient(ellipse 120% 85% at 50% 18%, rgba(95,115,134,calc(0.04 + max(0, var(--ascend-atmosphere-bias, 0)) * 0.09)) 0%, transparent 55%)",
        }}
      />
      {/* Warm counterweight — scene-local worlds lead; this only whispers continuity */}
      <div
        className="absolute inset-0 mix-blend-soft-light"
        style={{
          opacity:
            "calc(0.012 + var(--ascend-emotional-density, 0.5) * 0.032 + max(0, calc(-1 * var(--ascend-atmosphere-bias, 0))) * 0.045)",
          background:
            "radial-gradient(ellipse 90% 70% at 72% 88%, rgba(150,140,125,0.055) 0%, transparent 50%)",
        }}
      />
    </div>
  );
}
