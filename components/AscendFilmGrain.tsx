/**
 * Film grain layer inside `<main>` — static markup, no client JS.
 * Very low opacity; removes digital flatness without visible “noise UI”.
 */
export function AscendFilmGrain() {
  return <div className="ascend-film-grain" aria-hidden />;
}
