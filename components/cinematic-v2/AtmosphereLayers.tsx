/**
 * Reserved fixed stack root for global atmosphere (depth, fog, vignette).
 * One paint-free shell — future planes attach inside without touching scenes.
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
    </div>
  );
}
