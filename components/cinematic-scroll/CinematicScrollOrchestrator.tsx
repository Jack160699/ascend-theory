"use client";

import { useCinematicScroll } from "@/contexts/cinematic-scroll";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect } from "react";

const MAIN_ID = "ascend-cinematic-main";

/**
 * Calm scroll-linked depth: transform-only, scrubbed, low amplitude.
 * Targets `[data-cinematic-parallax]` inside each direct `main > section`.
 */
export function CinematicScrollOrchestrator() {
  const { lenis } = useCinematicScroll();

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !lenis) return;

    gsap.registerPlugin(ScrollTrigger);

    const main = document.getElementById(MAIN_ID);
    if (!main) return;

    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const amp = (raw: string | undefined, fallback: number) => {
      const n = parseFloat(raw ?? "");
      const base = Number.isFinite(n) ? n : fallback;
      return mobile ? base * 0.65 : base;
    };

    const ctx = gsap.context(() => {
      const sections = main.querySelectorAll<HTMLElement>(":scope > section");

      sections.forEach((section) => {
        const layers = section.querySelectorAll<HTMLElement>(
          "[data-cinematic-parallax]",
        );
        layers.forEach((layer) => {
          const range = amp(layer.dataset.cinematicParallax, 10);
          gsap.fromTo(
            layer,
            { y: -range * 0.5, force3D: true },
            {
              y: range * 0.5,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.35,
              },
            },
          );
        });

        const fogs = section.querySelectorAll<HTMLElement>("[data-cinematic-fog]");
        fogs.forEach((fog) => {
          const drift = amp(fog.dataset.cinematicFog, 5);
          gsap.fromTo(
            fog,
            { y: -drift * 0.4, force3D: true },
            {
              y: drift * 0.4,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.6,
              },
            },
          );
        });
      });

      ScrollTrigger.refresh();
    }, main);

    const t = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      window.cancelAnimationFrame(t);
      ctx.revert();
    };
  }, [lenis]);

  return null;
}
