"use client";

import { useCinematicScroll } from "@/contexts/cinematic-scroll";
import {
  CINEMATIC_MAIN_ID,
  CINEMATIC_SCENE_SELECTOR,
} from "@/lib/cinematic-v2/constants";
import {
  applyScrollProgressionVars,
  clearScrollProgressionVars,
} from "@/lib/cinematic-v2/scroll-progression";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect } from "react";

/**
 * Central GSAP registration for the cinematic experience: one context, one pass,
 * transform-only parallax/fog inside marked scene layers, plus scroll progression
 * CSS variables (no React state — avoids render churn during scroll).
 */
export function MasterSceneOrchestrator() {
  const { lenis } = useCinematicScroll();

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !lenis) return;

    gsap.registerPlugin(ScrollTrigger);

    const main = document.getElementById(CINEMATIC_MAIN_ID);
    if (!main) return;

    const root = document.documentElement;
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const amp = (raw: string | undefined, fallback: number) => {
      const n = parseFloat(raw ?? "");
      const base = Number.isFinite(n) ? n : fallback;
      return mobile ? base * 0.65 : base;
    };

    const ctx = gsap.context(() => {
      const scenes = main.querySelectorAll<HTMLElement>(CINEMATIC_SCENE_SELECTOR);
      const n = scenes.length;
      applyScrollProgressionVars(root, { sceneCount: n, globalProgress: 0, activeSceneIndex: 0 });

      scenes.forEach((scene) => {
        const layers = scene.querySelectorAll<HTMLElement>(
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
                trigger: scene,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.35,
              },
            },
          );
        });

        const fogs = scene.querySelectorAll<HTMLElement>("[data-cinematic-fog]");
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
                trigger: scene,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.6,
              },
            },
          );
        });
      });

      ScrollTrigger.create({
        trigger: main,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          applyScrollProgressionVars(root, { globalProgress: self.progress });
        },
      });

      /* Active scene: lightweight band per scene (CSS var only). Dense stacks may
         briefly overlap; tighten bands or switch to a single onUpdate when tuning. */
      scenes.forEach((scene, i) => {
        ScrollTrigger.create({
          trigger: scene,
          start: "top 58%",
          end: "bottom 42%",
          onToggle: (self) => {
            if (self.isActive) {
              applyScrollProgressionVars(root, { activeSceneIndex: i });
            }
          },
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
      clearScrollProgressionVars(root);
    };
  }, [lenis]);

  return null;
}
