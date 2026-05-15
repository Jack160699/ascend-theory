/**
 * Microsoft Clarity — session replay & heatmaps
 *
 * WHERE IT INITIALIZES
 * ─────────────────────
 * The bootstrap runs once from `app/layout.tsx` via `<Script id="microsoft-clarity" />`.
 * `next/script` with a stable `id` guarantees a single tag in the document (no duplicate injection
 * on React re-renders). Load order: `afterInteractive` — after the page becomes interactive.
 *
 * PRODUCTION ONLY
 * ───────────────
 * `shouldLoadMicrosoftClarity()` is true only when `NODE_ENV === "production"`, unless you set
 * `NEXT_PUBLIC_CLARITY_DISABLED=true` (disables Clarity even in production builds — e.g. smoke tests).
 *
 * HOW TO VERIFY RECORDINGS
 * ─────────────────────────
 * 1. Deploy to production (or run `next build && next start` locally — NODE_ENV is production).
 * 2. Open https://clarity.microsoft.com → your project (ID below).
 * 3. Use the site; sessions appear within a few minutes under Recordings / Dashboard.
 *
 * HOW TO DISABLE
 * ───────────────
 * • Set `NEXT_PUBLIC_CLARITY_DISABLED=true` in Vercel / `.env.local` and redeploy.
 * • Override project ID with `NEXT_PUBLIC_CLARITY_PROJECT_ID` if you create a new Clarity project.
 *
 * @see https://learn.microsoft.com/en-us/clarity/
 */

const DEFAULT_PROJECT_ID = "wrotkllg2t";

export const CLARITY_PROJECT_ID =
  typeof process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID === "string" &&
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID.trim().length > 0
    ? process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID.trim()
    : DEFAULT_PROJECT_ID;

const DISABLED = process.env.NEXT_PUBLIC_CLARITY_DISABLED === "true";

/**
 * Clarity should load only for production builds (Vercel production + preview both use
 * `NODE_ENV=production` for `next build` output; disable explicitly if needed).
 */
export function shouldLoadMicrosoftClarity(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    !DISABLED &&
    CLARITY_PROJECT_ID.length > 0
  );
}

/**
 * Inline IIFE per Microsoft — loads `https://www.clarity.ms/tag/{id}` asynchronously.
 * Escapes project ID for safety inside template string.
 */
export function clarityBootstrapScript(): string {
  const id = CLARITY_PROJECT_ID.replace(/[^a-zA-Z0-9_-]/g, "");
  return `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${id}");`;
}
