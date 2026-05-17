import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BRAND_TIMING } from "./brand-timing";

const ROOT_REVEAL = "[data-brand-reveal]";
const ROOT_SECTION = "[data-brand-section]";
const ROOT_DEPTH = "[data-brand-depth]";
const HERO_ROOT = "[data-brand-hero]";

export type BrandMotionOptions = {
  mobile: boolean;
};

/** Reset visible state when Lenis / motion is unavailable. */
export function resetBrandMotionStatic(root: HTMLElement): void {
  const all = gsap.utils.toArray<HTMLElement>(
    `${ROOT_REVEAL}, .hero-line, [data-brand-hero-sub], [data-brand-hero-scroll], ${ROOT_SECTION}`,
    root,
  );
  gsap.set(all, { opacity: 1, y: 0, clearProps: "transform,opacity" });
  root.classList.remove("brand-motion-pending");
}

/** Single entry: hero timeline + section fades + reveals + depth (one context). */
export function initBrandMotion(
  root: HTMLElement,
  options: BrandMotionOptions,
): void {
  ScrollTrigger.config({ limitCallbacks: true });

  playBrandHeroEntrance(root, options);
  registerBrandSectionTransitions(root, options);
  registerBrandScrollReveals(root, options);
  registerBrandDepthParallax(root, options);
}

/**
 * Hero — one timeline: staggered lines → pause → subtext → scroll (soft overlap).
 */
export function playBrandHeroEntrance(
  root: HTMLElement,
  options?: BrandMotionOptions,
): gsap.core.Timeline {
  const hero = root.querySelector<HTMLElement>(HERO_ROOT);
  if (!hero) return gsap.timeline();

  const mobile = options?.mobile ?? false;
  const lines = gsap.utils.toArray<HTMLElement>(".hero-line", hero);
  const sub = hero.querySelector<HTMLElement>("[data-brand-hero-sub]");
  const scroll = hero.querySelector<HTMLElement>("[data-brand-hero-scroll]");

  const introTargets = [...lines, sub, scroll].filter(
    Boolean,
  ) as HTMLElement[];

  gsap.set(introTargets, {
    opacity: 0,
    y: mobile ? 18 : 26,
    force3D: true,
  });

  const { hero: t } = BRAND_TIMING;
  const tl = gsap.timeline({
    defaults: { ease: t.ease, force3D: true },
    onComplete: () => {
      root.classList.remove("brand-motion-pending");
    },
  });

  if (lines.length) {
    tl.to(
      lines,
      {
        opacity: 1,
        y: 0,
        duration: t.lineDuration,
        stagger: t.lineStagger,
      },
      t.delay,
    );
  }

  if (sub) {
    tl.to(
      sub,
      { opacity: 1, y: 0, duration: t.subDuration },
      lines.length ? `>+${t.pauseAfterLines}` : t.delay,
    );
  }

  if (scroll) {
    tl.to(
      scroll,
      { opacity: 1, y: 0, duration: t.scrollDuration },
      sub ? `-=${t.scrollOverlap}` : lines.length ? `>+${t.pauseAfterLines}` : t.delay + 0.4,
    );
  }

  return tl;
}

/** Section entrance — opacity + lift; connected, not abrupt. */
export function registerBrandSectionTransitions(
  root: HTMLElement,
  options: BrandMotionOptions,
): void {
  const sections = gsap.utils.toArray<HTMLElement>(
    `${ROOT_SECTION}:not([data-brand-hero])`,
    root,
  );

  const { section: t } = BRAND_TIMING;
  const y = options.mobile ? t.yMobile : t.y;

  sections.forEach((section) => {
    gsap.fromTo(
      section,
      { opacity: 0, y, force3D: true },
      {
        opacity: 1,
        y: 0,
        duration: t.duration,
        ease: t.ease,
        force3D: true,
        scrollTrigger: {
          trigger: section,
          start: t.start,
          toggleActions: t.toggleActions,
          once: true,
        },
      },
    );
  });
}

/** Scroll reveals — alternating lift; play once, no scrub. */
export function registerBrandScrollReveals(
  root: HTMLElement,
  options: BrandMotionOptions,
): void {
  const { mobile } = options;
  const elements = gsap.utils.toArray<HTMLElement>(ROOT_REVEAL, root);
  const { reveal: t } = BRAND_TIMING;
  const yValues = mobile
    ? ([t.yHighMobile, t.yLowMobile] as const)
    : ([t.yHigh, t.yLow] as const);
  const duration = mobile ? t.durationMobile : t.duration;

  elements.forEach((el, index) => {
    const y = yValues[index % 2];
    const delay =
      (parseFloat(el.dataset.brandRevealDelay ?? "0") || 0) * t.staggerDelay;

    gsap.from(el, {
      opacity: 0,
      y,
      duration,
      delay,
      ease: t.ease,
      force3D: true,
      scrollTrigger: {
        trigger: el,
        start: t.start,
        toggleActions: t.toggleActions,
        once: true,
      },
    });
  });
}

/** Depth — subtle scrubbed drift; premium ease; off on mobile. */
export function registerBrandDepthParallax(
  root: HTMLElement,
  options: BrandMotionOptions,
): void {
  if (options.mobile) return;

  const depths = gsap.utils.toArray<HTMLElement>(ROOT_DEPTH, root);
  const { depth: t } = BRAND_TIMING;
  const range = t.range;

  depths.forEach((depth) => {
    const section = depth.closest<HTMLElement>(ROOT_SECTION);
    if (!section) return;

    gsap.fromTo(
      depth,
      { y: -range, force3D: true },
      {
        y: range,
        ease: t.ease,
        force3D: true,
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: t.scrub,
          invalidateOnRefresh: true,
        },
      },
    );
  });
}

export function refreshBrandScroll(): void {
  ScrollTrigger.refresh();
}
