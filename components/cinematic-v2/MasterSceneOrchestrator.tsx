"use client";

import { useCinematicScroll } from "@/contexts/cinematic-scroll";
import {
  CINEMATIC_MAIN_ID,
  CINEMATIC_SCENE_SELECTOR,
} from "@/lib/cinematic-v2/constants";
import {
  registerGlobalAtmosphereDrift,
  registerSceneDepthTimeline,
} from "@/lib/cinematic-v2/register-scene-depth";
import {
  applyEmotionalRhythmVars,
  clearEmotionalRhythmVars,
} from "@/lib/cinematic-v2/emotional-progression-vars";
import { computeEmotionalRhythmSnapshot } from "@/lib/cinematic-v2/emotional-rhythm";
import {
  applyScrollProgressionVars,
  clearScrollProgressionVars,
} from "@/lib/cinematic-v2/scroll-progression";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect } from "react";

/**
 * V2 motion: GSAP timelines + ScrollTrigger — one scrubbed rig per scene
 * (depth + fog + camera), transform-only, restrained amplitude. Progression
 * vars stay on `documentElement` (no React scroll state).
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

    const ctx = gsap.context(() => {
      const scenes = main.querySelectorAll<HTMLElement>(CINEMATIC_SCENE_SELECTOR);
      const n = scenes.length;
      applyScrollProgressionVars(root, {
        sceneCount: n,
        globalProgress: 0,
        activeSceneIndex: 0,
      });

      scenes.forEach((scene) => {
        registerSceneDepthTimeline(scene, { mobile });
      });

      const atmosDepth = main.querySelector<HTMLElement>(
        "[data-cinematic-atmos-depth]",
      );
      registerGlobalAtmosphereDrift(main, atmosDepth);

      ScrollTrigger.create({
        trigger: main,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          applyScrollProgressionVars(root, { globalProgress: self.progress });
          const scrollY = self.scroll();
          const snap = computeEmotionalRhythmSnapshot(
            Array.from(scenes),
            scrollY,
            window.innerHeight,
            self.progress,
          );
          applyEmotionalRhythmVars(root, snap);
        },
      });

      scenes.forEach((scene, i) => {
        ScrollTrigger.create({
          trigger: scene,
          start: "top 56%",
          end: "bottom 44%",
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
      clearEmotionalRhythmVars(root);
    };
  }, [lenis]);

  return null;
}
