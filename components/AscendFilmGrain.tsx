/**
 * Viewport-locked grain (see `.ascend-global-grain` in `styles/premium.css`).
 * Rendered once in root layout — static markup, no client JS.
 */
export function AscendFilmGrain() {
  return <div className="ascend-global-grain" aria-hidden />;
}
