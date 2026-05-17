import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BRAND_MOTION, type BrandMotionProfile } from "@/lib/brand/motion";
import { BRAND_TIMING } from "./brand-timing";

const ROOT_SECTION = "[data-brand-section]";
const ROOT_DEPTH_ACTIVE = "[data-brand-depth-active]";
const HERO_ROOT = "[data-brand-hero]";
const CINEMATIC_TARGET = "[data-brand-cinematic]";

export type BrandMotionOptions = {
  mobile: boolean;
};

/** Reset visible state when Lenis / motion is unavailable. */
export function resetBrandMotionStatic(root: HTMLElement): void {
  const all = gsap.utils.toArray<HTMLElement>(
    `.hero-line, [data-brand-hero-sub], [data-brand-hero-scroll], ${ROOT_SECTION}, ${CINEMATIC_TARGET}, [data-brand-fade]`,
    root,
  );
  const zoom = root.querySelector<HTMLElement>("[data-hero-bg-zoom]");
  if (zoom) gsap.killTweensOf(zoom);

  gsap.set(all, {
    opacity: 1,
    y: 0,
    scale: 1,
    clearProps: "transform,opacity",
  });
  if (zoom) gsap.set(zoom, { scale: 1 });
  root.classList.remove("brand-motion-pending");
}

/** Section-aware motion — fewer triggers, contrasting pacing per beat. */
export function initBrandMotion(
  root: HTMLElement,
  options: BrandMotionOptions,
): void {
  ScrollTrigger.config({ limitCallbacks: true });

  playBrandHeroEntrance(root, options);
  playHeroBackgroundZoom(root, options);
  registerSectionMotions(root, options);
  registerBrandDepthParallax(root, options);
}

/** Barely perceptible Ken Burns — hero background only. */
export function playHeroBackgroundZoom(
  root: HTMLElement,
  options: BrandMotionOptions,
): void {
  if (options.mobile) return;

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const hero = root.querySelector<HTMLElement>(HERO_ROOT);
  const target = hero?.querySelector<HTMLElement>("[data-hero-bg-zoom]");
  if (!target) return;

  const { hero: t } = BRAND_TIMING;
  gsap.set(target, { scale: 1, force3D: true, transformOrigin: "50% 50%" });
  gsap.to(target, {
    scale: t.bgZoomScale,
    duration: t.bgZoomDuration,
    ease: "none",
    yoyo: true,
    repeat: -1,
  });
}

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
      sub
        ? `-=${t.scrollOverlap}`
        : lines.length
          ? `>+${t.pauseAfterLines}`
          : t.delay + 0.4,
    );
  }

  return tl;
}

function registerSectionMotions(
  root: HTMLElement,
  options: BrandMotionOptions,
): void {
  const sections = gsap.utils.toArray<HTMLElement>(ROOT_SECTION, root);

  sections.forEach((section) => {
    const profile = section.dataset.brandMotion as
      | BrandMotionProfile
      | undefined;

    switch (profile) {
      case BRAND_MOTION.philosophy:
        registerPhilosophyFade(section);
        break;
      case BRAND_MOTION.cinematic:
        registerCinematicReveal(section, options);
        break;
      case BRAND_MOTION.fade:
        registerMentorshipFade(section, options);
        break;
      case BRAND_MOTION.wearables:
      case BRAND_MOTION.static:
      case BRAND_MOTION.hero:
        break;
      default:
        break;
    }
  });
}

/** Philosophy — opacity only, no lift. */
function registerPhilosophyFade(section: HTMLElement): void {
  const content = section.querySelector<HTMLElement>("[data-brand-fade]");
  if (!content) return;

  const { philosophy: t } = BRAND_TIMING;
  gsap.fromTo(
    content,
    { opacity: 0 },
    {
      opacity: 1,
      duration: t.duration,
      ease: t.ease,
      scrollTrigger: {
        trigger: section,
        start: t.start,
        toggleActions: t.toggleActions,
        once: true,
      },
    },
  );
}

/** Featured drop — slow scale + opacity. */
function registerCinematicReveal(
  section: HTMLElement,
  options: BrandMotionOptions,
): void {
  const target = section.querySelector<HTMLElement>(CINEMATIC_TARGET);
  if (!target) return;

  const { cinematic: t } = BRAND_TIMING;
  const scale = options.mobile ? 0.98 : t.scale;

  gsap.from(target, {
    opacity: 0,
    scale,
    duration: options.mobile ? 1 : t.duration,
    ease: t.ease,
    force3D: true,
    scrollTrigger: {
      trigger: section,
      start: t.start,
      toggleActions: t.toggleActions,
      once: true,
    },
  });
}

/** Mentorship — subtle opacity fade on content shell. */
function registerMentorshipFade(
  section: HTMLElement,
  options: BrandMotionOptions,
): void {
  const content = section.querySelector<HTMLElement>("[data-brand-fade]");
  if (!content) return;

  const { fade: t } = BRAND_TIMING;
  gsap.fromTo(
    content,
    { opacity: 0 },
    {
      opacity: 1,
      duration: options.mobile ? t.durationMobile : t.duration,
      ease: t.ease,
      scrollTrigger: {
        trigger: section,
        start: t.start,
        toggleActions: t.toggleActions,
        once: true,
      },
    },
  );
}

/** Depth — hero + featured drop only; off on mobile. */
export function registerBrandDepthParallax(
  root: HTMLElement,
  options: BrandMotionOptions,
): void {
  if (options.mobile) return;

  const depths = gsap.utils.toArray<HTMLElement>(ROOT_DEPTH_ACTIVE, root);
  const { depth: t } = BRAND_TIMING;

  depths.forEach((depth) => {
    const section = depth.closest<HTMLElement>(ROOT_SECTION);
    if (!section || section.matches(HERO_ROOT)) return;

    gsap.fromTo(
      depth,
      { y: -t.range, force3D: true },
      {
        y: t.range,
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
