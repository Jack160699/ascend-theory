/**
 * Locks document scroll while a fullscreen overlay is open (iOS-safe).
 * Restores scroll position on release.
 */
export function lockModalScroll(): () => void {
  if (typeof window === "undefined") return () => undefined;

  const html = document.documentElement;
  const body = document.body;
  const scrollY = window.scrollY;

  const prevHtmlOverflow = html.style.overflow;
  const prevBodyOverflow = body.style.overflow;
  const prevBodyPosition = body.style.position;
  const prevBodyTop = body.style.top;
  const prevBodyLeft = body.style.left;
  const prevBodyRight = body.style.right;
  const prevBodyWidth = body.style.width;
  const prevBodyTouchAction = body.style.touchAction;
  const prevHtmlOverscroll = html.style.overscrollBehavior;

  html.classList.add("world-intake-open");
  body.classList.add("world-intake-open");
  html.style.overflow = "hidden";
  html.style.overscrollBehavior = "none";
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.touchAction = "none";

  const blockBackgroundTouch = (event: TouchEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".world-intake-panel, .drop-cart-panel")) return;
    event.preventDefault();
  };

  const blockBackgroundWheel = (event: WheelEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".world-intake-panel, .drop-cart-panel")) return;
    event.preventDefault();
  };

  document.addEventListener("touchmove", blockBackgroundTouch, { passive: false });
  document.addEventListener("wheel", blockBackgroundWheel, { passive: false });

  return () => {
    document.removeEventListener("touchmove", blockBackgroundTouch);
    document.removeEventListener("wheel", blockBackgroundWheel);

    html.classList.remove("world-intake-open");
    body.classList.remove("world-intake-open");
    html.style.overflow = prevHtmlOverflow;
    html.style.overscrollBehavior = prevHtmlOverscroll;
    body.style.overflow = prevBodyOverflow;
    body.style.position = prevBodyPosition;
    body.style.top = prevBodyTop;
    body.style.left = prevBodyLeft;
    body.style.right = prevBodyRight;
    body.style.width = prevBodyWidth;
    body.style.touchAction = prevBodyTouchAction;

    window.scrollTo(0, scrollY);
  };
}
