/**
 * Meta (Facebook) Pixel — App Router helpers
 *
 * WHERE EVENTS FIRE (current wiring)
 * ─────────────────────────────────
 * • PageView    — Snippet fires once per full page load; `MetaPixel` component fires on
 *                 client-side navigations only (avoid duplicate with snippet).
 * • InitiateCheckout — `openAssessment()` in `contexts/assessment-modal.tsx` (all CTAs
 *                 that open the intake modal: hero / mid gate / final / legacy surfaces).
 * • Lead        — Valid assessment form submit, before WhatsApp redirect (`AssessmentModal`).
 * • Contact     — Immediately after Lead on successful submit (WhatsApp handoff URL opened).
 *
 * ADDING NEW TRACKING LATER
 * ─────────────────────────
 * 1. Import `event` from this file where the user interaction happens (client components only).
 * 2. Call `event('<StandardOrCustom>', { …optional payloads… })`.
 *    Standard names: https://developers.facebook.com/docs/meta-pixel/reference
 * 3. Prefer wrapping with `if (typeof window !== 'undefined')` is unnecessary — `event` no-ops SSR.
 *
 * VERIFYING WITH META PIXEL HELPER (Chrome extension)
 * ───────────────────────────────────────────────────
 * 1. Deploy preview/production OR set NEXT_PUBLIC_FB_PIXEL_DEBUG=true (see env section below).
 * 2. Open the site → extension icon shows green when the pixel initialized.
 * 3. Open extension panel → Events tab lists PageView / Lead etc. as they occur.
 *
 * PERFORMANCE / CLEAN ARCHITECTURE
 * ─────────────────────────────────
 * • Pixel script loads `afterInteractive` (see `MetaPixel.tsx` used from root layout).
 * • Helpers are synchronous no-ops when `window.fbq` is missing or pixel disabled.
 */

const DEFAULT_PIXEL_ID = "958687430389557";

/** Public ID — set NEXT_PUBLIC_FB_PIXEL_ID in `.env.local` / Vercel (falls back below). */
export const FB_PIXEL_ID =
  typeof process.env.NEXT_PUBLIC_FB_PIXEL_ID === "string" &&
  process.env.NEXT_PUBLIC_FB_PIXEL_ID.trim().length > 0
    ? process.env.NEXT_PUBLIC_FB_PIXEL_ID.trim()
    : DEFAULT_PIXEL_ID;

/**
 * Disable all pixel injection + client tracking (e.g. staging).
 * NEXT_PUBLIC_FB_PIXEL_DISABLED=true → no script, helpers no-op early.
 */
const EXPLICIT_DISABLED =
  process.env.NEXT_PUBLIC_FB_PIXEL_DISABLED === "true";

/**
 * Pixel loads in production by default.
 * NEXT_PUBLIC_FB_PIXEL_DEBUG=true loads in dev/local for Pixel Helper QA.
 */
const DEBUG_ALLOWED = process.env.NEXT_PUBLIC_FB_PIXEL_DEBUG === "true";

export const FACEBOOK_PIXEL_SHOULD_LOAD: boolean =
  !EXPLICIT_DISABLED &&
  FB_PIXEL_ID.length > 0 &&
  (process.env.NODE_ENV === "production" || DEBUG_ALLOWED);

declare global {
  interface Window {
    fbq?:
      | ((
          action: string,
          event?: string | Record<string, unknown>,
          params?: Record<string, unknown>,
        ) => void)
      | undefined;
    _fbq?: unknown;
  }
}

/** True after afterInteractive snippet runs (same window guards as Pixel script). */
function hasFbq(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

/**
 * SPA / soft navigation PageView — do NOT call on initial load if the snippet
 * already emitted PageView for this document (handled in `MetaPixel.tsx`).
 */
export function pageview(): void {
  if (!FACEBOOK_PIXEL_SHOULD_LOAD || !hasFbq()) return;
  window.fbq!("track", "PageView");
}

/**
 * Track a Pixel event (`track` vs `trackCustom` when name is non-standard).
 * Meta standard events don't need prefix; customs use fbq('trackCustom', ...)
 */
export function event(
  name:
    | "PageView"
    | "Lead"
    | "Contact"
    | "InitiateCheckout"
    | string,
  payload?: Record<string, unknown>,
): void {
  if (!FACEBOOK_PIXEL_SHOULD_LOAD || !hasFbq()) return;

  const standard = new Set([
    "PageView",
    "Lead",
    "Contact",
    "InitiateCheckout",
    "CompleteRegistration",
    "Purchase",
    "Search",
    "ViewContent",
  ]);

  if (standard.has(name)) {
    if (
      payload === undefined ||
      (typeof payload === "object" && Object.keys(payload).length === 0)
    ) {
      window.fbq!("track", name);
    } else {
      window.fbq!("track", name, payload);
    }
    return;
  }

  window.fbq!(
    "trackCustom",
    name,
    payload ?? ({} satisfies Record<string, unknown>),
  );
}

/** Inline initializer for `<Script dangerouslySetInnerHTML />` — idempotent guard. */
export function facebookPixelSnippet(): string {
  return `
!(function(f,b,e,v,n,t,s){
if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
})(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${FB_PIXEL_ID}');
fbq('track','PageView');
`.trim();
}
